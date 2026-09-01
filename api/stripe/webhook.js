const crypto = require("crypto");
const { json, preflight } = require("../../lib/http");

function stripeSignatureOk(raw, header, secret) {
  if (!header || !secret) return false;
  const parts = {};
  for (const piece of String(header).split(",")) {
    const [k, v] = piece.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;
  const signed = `${timestamp}.${raw}`;
  const digest = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
  } catch {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  if (req.method !== "POST") return json(req, res, 405, { error: "Method not allowed" });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return json(req, res, 501, {
      error: "Stripe webhook not configured",
      hint: "Set STRIPE_WEBHOOK_SECRET (and STRIPE_SECRET_KEY) on the Vercel project",
    });
  }

  const chunks = [];
  const raw = await new Promise((resolve, reject) => {
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

  const sig = req.headers["stripe-signature"] || req.headers["Stripe-Signature"];
  if (!stripeSignatureOk(raw, sig, secret)) {
    return json(req, res, 400, { error: "Invalid Stripe signature" });
  }

  let event = {};
  try {
    event = raw ? JSON.parse(raw) : {};
  } catch {
    return json(req, res, 400, { error: "Invalid JSON" });
  }

  // Standalone Pro still unlocks via ?pro=success → localStorage.
  // This endpoint acknowledges checkout.session.completed so Stripe retries stop.
  return json(req, res, 200, {
    received: true,
    type: event.type || null,
    id: event.id || null,
  });
};
