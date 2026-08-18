# SnabbFaktura / Fred Invoice

Beautiful invoices in 30 seconds. Now with a real backend so Fred `/core/invoice` is auto-signed-in.

**Live:** https://snabbfaktura.vercel.app  
**Fred iframe:** https://fred-platform.vercel.app/core/invoice → `/api/invoice-proxy` → this app’s `/api/*`

## What `/core/invoice` talks to

Fred’s same-origin proxy forwards the logged-in Supabase Bearer token to:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/` | Iframe UI (invoice list + create) |
| GET | `/api/health` | Liveness (no auth) |
| GET | `/api/auth/me` | Current Fred user |
| POST | `/api/auth/logout` | Clear `sf_session` |
| GET | `/api/invoices` | List current user’s invoices |
| POST | `/api/invoices` | Create |
| GET/PUT/DELETE | `/api/invoices/:id` | Read / update / delete |

All iframe fetches use **relative** paths (`invoices`, `auth/me`) so they stay on `/api/invoice-proxy/*` and keep the session.

## Auth

Same Supabase project as fred-platform: `https://xaszyzqcxrvbbbkebqxj.supabase.co`.

Fred attaches `Authorization: Bearer <access_token>`. We verify it against `/auth/v1/user`. No second login.

## Storage

1. Dedicated `public.invoices` table if you run `sql/invoices.sql` in the Supabase SQL editor.
2. Otherwise invoices live in `companies.metadata.invoices` (already in the Fred schema) — works immediately, no migration.

## Iframe

`vercel.json` sets `Content-Security-Policy: frame-ancestors` for `fred-platform.vercel.app` (and local `:3000`). `X-Frame-Options` is intentionally omitted.

## Standalone creator

`index.html` is still the public 30-second invoice creator (client-side PDF). The Fred-embedded product is the `/api/` app.

## Pro

- Monthly 49 SEK: https://buy.stripe.com/00wcN43XP3oGh16fHv8og00
- Yearly 490 SEK: https://buy.stripe.com/4gM4gy65X1gy9yEeDr8og01
