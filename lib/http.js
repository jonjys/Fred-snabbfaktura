const { FRAME_ANCESTORS, ALLOWED_ORIGINS } = require("./config");

function originOf(req) {
  const o = req.headers.origin || req.headers.referer || "";
  try {
    return new URL(o).origin;
  } catch {
    return "";
  }
}

function applyHeaders(req, res, extra = {}) {
  const origin = originOf(req);
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type");
  res.setHeader("Access-Control-Expose-Headers", "set-cookie");
  res.setHeader("Vary", "Origin");
  res.setHeader("Content-Security-Policy", `frame-ancestors ${FRAME_ANCESTORS}`);
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
}

function json(req, res, status, body, extraHeaders) {
  applyHeaders(req, res, { "Content-Type": "application/json; charset=utf-8", ...extraHeaders });
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

function html(req, res, status, markup, extraHeaders) {
  applyHeaders(req, res, { "Content-Type": "text/html; charset=utf-8", ...extraHeaders });
  res.statusCode = status;
  res.end(markup);
}

function preflight(req, res) {
  applyHeaders(req, res);
  res.statusCode = 204;
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = { applyHeaders, json, html, preflight, readBody };
