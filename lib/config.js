// Shared Fred Supabase project (public URL + publishable key — same as fred-platform).
// Override with env on Vercel if the project is rotated.
const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xaszyzqcxrvbbbkebqxj.supabase.co"
).replace(/\/$/, "");

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
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
