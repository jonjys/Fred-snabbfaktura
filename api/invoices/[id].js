const { json, preflight, readBody } = require("../../lib/http");
const { getUser } = require("../../lib/auth");
const { getInvoice, updateInvoice, deleteInvoice } = require("../../lib/store");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  const user = await getUser(req);
  if (!user) return json(req, res, 401, { error: "Unauthorized" });

  const id = req.query && req.query.id;
  if (!id) return json(req, res, 400, { error: "Missing invoice id" });

  try {
    if (req.method === "GET") {
      const pack = await getInvoice(user, id);
      if (!pack.invoice) return json(req, res, 404, { error: "Not found" });
      return json(req, res, 200, { invoice: pack.invoice, source: pack.source });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await readBody(req);
      const pack = await updateInvoice(user, id, body);
      if (!pack.invoice) return json(req, res, 404, { error: "Not found" });
      return json(req, res, 200, { invoice: pack.invoice, source: pack.source });
    }
    if (req.method === "DELETE") {
      const ok = await deleteInvoice(user, id);
      if (!ok) return json(req, res, 404, { error: "Not found" });
      return json(req, res, 200, { ok: true, id });
    }
    return json(req, res, 405, { error: "Method not allowed" });
  } catch (err) {
    return json(req, res, 500, { error: err.message || "Server error" });
  }
};
