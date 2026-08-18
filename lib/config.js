// MUST be the same Supabase project as fred-platform so Bearer tokens verify.
// Do not fall back to a leftover SUPABASE_URL on the snabbfaktura Vercel project.
const SUPABASE_URL = (
  process.env.FRED_SUPABASE_URL ||
  "https://xaszyzqcxrvbbbkebqxj.supabase.co"
).replace(/\/$/, "");

const SUPABASE_ANON_KEY =
  process.env.FRED_SUPABASE_ANON_KEY ||
  "sb_publishable_k2feCk4pRm047efzynWhcA_EgrGW3h8";

const FRAME_ANCESTORS = [
  "'self'",
  "https://fred-platform.vercel.app",
  "https://fred-platform-feffelito-s-projects.vercel.app",
  "https://fred-platform-git-main-feffelito-s-projects.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].join(" ");

const ALLOWED_ORIGINS = [
  "https://fred-platform.vercel.app",
  "https://fred-platform-feffelito-s-projects.vercel.app",
  "https://fred-platform-git-main-feffelito-s-projects.vercel.app",
  "https://snabbfaktura.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  FRAME_ANCESTORS,
  ALLOWED_ORIGINS,
};
