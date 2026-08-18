const { json, preflight } = require("../../lib/http");
const { getUser } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);
  if (req.method !== "GET") return json(req, res, 405, { error: "Method not allowed" });
  const user = await getUser(req);
  if (!user) return json(req, res, 401, { authenticated: false, error: "Unauthorized" });
  return json(req, res, 200, {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email || null,
      created_at: user.created_at || null,
    },
  });
};
