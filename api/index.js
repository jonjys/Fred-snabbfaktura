const { html, json, preflight } = require("../lib/http");
const { getUser } = require("../lib/auth");
const renderApp = require("../lib/ui");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return preflight(req, res);

  const accept = String(req.headers.accept || "");
  const wantsJson = accept.includes("application/json") && !accept.includes("text/html");

  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(req, res, 405, { error: "Method not allowed" });
  }

  const user = await getUser(req);

  if (wantsJson) {
    if (!user) return json(req, res, 401, { error: "Unauthorized", service: "snabbfaktura" });
    return json(req, res, 200, {
      service: "snabbfaktura",
      authenticated: true,
      user: { id: user.id, email: user.email || null },
    });
  }

  const cookie = user
    ? `sf_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    : "sf_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax";

  return html(req, res, 200, renderApp({ email: user && user.email }), { "Set-Cookie": cookie });
};
