const { json, preflight, readBody } = require("../../lib/http");
const { getUser } = require("../../lib/auth");
const { listInvoices, createInvoice } = require("../../lib/store");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  const user = await getUser(req);
  if (!user) return json(req, res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const pack = await listInvoices(user);
      return json(req, res, 200, {
        invoices: pack.invoices,
        source: pack.source,
        count: pack.invoices.length,
      });
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      if (!body.customer_name && !body.description && body.amount == null) {
        return json(req, res, 400, { error: "customer_name, description or amount required" });
      }
      const pack = await createInvoice(user, body);
      return json(req, res, 201, { invoice: pack.invoice, source: pack.source });
    }
    return json(req, res, 405, { error: "Method not allowed" });
  } catch (err) {
    return json(req, res, 500, { error: err.message || "Server error" });
  }
};
