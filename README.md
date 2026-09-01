# SnabbFaktura / Fred Invoice

Beautiful invoices in 30 seconds. Real backend so Fred `/core/invoice` auto-signs-in.

**Live:** https://snabbfaktura.vercel.app  
**Fred iframe:** https://fred-platform.vercel.app/core/invoice → `/api/invoice-proxy` → this app’s `/api/`

## What `/core/invoice` talks to

Fred’s same-origin proxy forwards the logged-in Supabase Bearer token to:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/` | Iframe UI (invoice list + create) |
| GET | `/api/health` | Liveness + live GoTrue ping (no auth) |
| GET | `/api/auth/me` | Current Fred user |
| POST | `/api/auth/logout` | Clear `sf_session` |
| GET | `/api/invoices` | List current user’s invoices |
| POST | `/api/invoices` | Create |
| GET/PUT/DELETE | `/api/invoices/:id` | Read / update / delete |
| POST | `/api/stripe/webhook` | Stripe `checkout.session.completed` (needs `STRIPE_WEBHOOK_SECRET`) |

Iframe fetches use `/api/invoices` and `/api/auth/me` so they stay on Fred’s same-origin rewrites.

## Auth

Same Supabase project as fred-platform: `https://xaszyzqcxrvbbbkebqxj.supabase.co`.

Fred attaches `Authorization: Bearer <access_token>`. We verify it against `/auth/v1/user`. Network failures return 401, never a 500. No second login.

## Storage

1. Dedicated `public.invoices` table if you run `sql/invoices.sql` in the **xaszy** Supabase SQL editor.
2. Otherwise invoices live in `companies.metadata.invoices` (already in the Fred schema) — works immediately, no migration.

## Iframe

`vercel.json` sets `Content-Security-Policy: frame-ancestors` for `fred-platform.vercel.app` (and local `:3000`). `X-Frame-Options` is intentionally omitted.

## Standalone creator

`index.html` is the public 30-second invoice creator (client-side PDF). Pro is 49 SEK/mo or 490 SEK/yr via Stripe Payment Links. The Fred-embedded product is the `/api/` app.

## Pro

- Monthly 49 SEK: https://buy.stripe.com/00wcN43XP3oGh16fHv8og00
- Yearly 490 SEK: https://buy.stripe.com/4gM4gy65X1gy9yEeDr8og01
- Success: `https://snabbfaktura.vercel.app/?pro=success` → localStorage `snabbfaktura_pro=1`

Optional: set `STRIPE_WEBHOOK_SECRET` on Vercel and point Stripe to `/api/stripe/webhook`.
