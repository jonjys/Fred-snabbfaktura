const { SUPABASE_URL } = require("../lib/config");
const { json, preflight } = require("../lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(req, res, 405, { error: "Method not allowed" });
  }
  return json(req, res, 200, {
    ok: true,
    service: "snabbfaktura",
    version: "3.0.0",
    supabase: SUPABASE_URL,
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
    ],
  });
};
