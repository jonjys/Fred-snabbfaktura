const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("../lib/config");
const { json, preflight } = require("../lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(req, res, 405, { error: "Method not allowed" });
  }

  let supabaseOk = false;
  let supabaseStatus = 0;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    supabaseOk = r.ok;
    supabaseStatus = r.status;
  } catch {
    supabaseOk = false;
  }

  return json(req, res, 200, {
    ok: true,
    service: "snabbfaktura",
    version: "3.1.0",
    supabase: SUPABASE_URL,
    supabaseOk,
    supabaseStatus,
    time: new Date().toISOString(),
    endpoints: [
      "GET /api/health",
      "GET /api/",
      "GET /api/auth/me",
      "POST /api/auth/logout",
      "GET /api/invoices",
      "POST /api/invoices",
      "GET /api/invoices/:id",
      "PUT /api/invoices/:id",
      "DELETE /api/invoices/:id",
      "POST /api/stripe/webhook",
    ],
  });
};
