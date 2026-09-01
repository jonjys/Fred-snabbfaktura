# Invo

Svenska fakturor på 30 sekunder. Fristående produkt — ingen plattform, ingen iframe.

**Live:** [www.invoic.se](https://www.invoic.se)  
**App:** [snabbfaktura.vercel.app](https://snabbfaktura.vercel.app)

## Vad det är

- Skapa faktura i webbläsaren (PDF + Swish)
- Spara fakturor mot `public.invoices` när du är inloggad
- Pro låser upp extra lägen via Stripe

## Pro

| Plan | Pris | Länk |
| --- | --- | --- |
| Månad | 49 kr | [Köp](https://buy.stripe.com/00wcN43XP3oGh16fHv8og00) |
| År | 490 kr | [Köp](https://buy.stripe.com/4gM4gy65X1gy9yEeDr8og01) |

Efter köp: `https://www.invoic.se/?pro=success` (samma på snabbfaktura.vercel.app).

Webhook: `POST /api/stripe/webhook` · Vercel env: `STRIPE_WEBHOOK_SECRET`

## API

| Method | Path | Syfte |
| --- | --- | --- |
| GET | `/api/health` | Status |
| GET | `/api/auth/me` | Inloggad användare |
| POST | `/api/auth/logout` | Logga ut |
| GET | `/api/invoices` | Lista fakturor |
| POST | `/api/invoices` | Skapa |
| GET / PUT / DELETE | `/api/invoices/:id` | Läs / ändra / radera |
| POST | `/api/stripe/webhook` | Stripe `checkout.session.completed` |

## Databas

Kör [`sql/invoices.sql`](sql/invoices.sql) i Supabase SQL Editor.

Tabell: `public.invoices` (RLS på `auth.uid()`).
