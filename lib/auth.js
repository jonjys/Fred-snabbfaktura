const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("./config");

function bearer(req) {
  const h = req.headers.authorization || req.headers.Authorization || "";
  if (typeof h === "string" && h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
  return "";
}

async function getUser(req) {
  const token = bearer(req);
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
  });
  if (!r.ok) return null;
  const user = await r.json();
  if (!user || !user.id) return null;
  return { ...user, access_token: token };
}

function requireUser(req, res, json) {
  return getUser(req).then((user) => {
    if (!user) {
      json(req, res, 401, { error: "Unauthorized", hint: "Fred session Bearer required" });
      return null;
    }
    return user;
  });
}

module.exports = { bearer, getUser, requireUser };
