const { json, preflight } = require("../../lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  if (req.method !== "POST" && req.method !== "GET") {
    return json(req, res, 405, { error: "Method not allowed" });
  }
  json(
    req,
    res,
    200,
    { ok: true },
    { "Set-Cookie": "sf_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" },
  );
};
