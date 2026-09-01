const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.FRED_SUPABASE_URL ||
  "https://xaszyzqcxrvbbbkebqxj.supabase.co"
).replace(/\/$/, "");

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.FRED_SUPABASE_ANON_KEY ||
  "sb_publishable_k2feCk4pRm047efzynWhcA_EgrGW3h8";

const FRAME_ANCESTORS = "'self'";

const ALLOWED_ORIGINS = [
  "https://www.invoic.se",
  "https://invoic.se",
  "https://snabbfaktura.vercel.app",
];

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  FRAME_ANCESTORS,
  ALLOWED_ORIGINS,
};
