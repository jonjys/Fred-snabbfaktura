-- Optional dedicated invoices table for Invo.
-- The API works WITHOUT this table: it falls back to companies.metadata.invoices.
-- Run in Supabase SQL editor if you want a first-class invoices table + RLS.

create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  number          text not null,
  customer_name   text not null default '',
  customer_email  text not null default '',
  customer_orgnr  text not null default '',
  description     text not null default '',
  amount          numeric(14, 2) not null default 0,
  currency        text not null default 'SEK',
  tax_rate        numeric(6, 2) not null default 25,
  status          text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date      date,
  due_date        date,
  lines           jsonb not null default '[]'::jsonb,
  notes           text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_created_at_idx on public.invoices(created_at desc);

alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own" on public.invoices;
drop policy if exists "invoices_insert_own" on public.invoices;
drop policy if exists "invoices_update_own" on public.invoices;
drop policy if exists "invoices_delete_own" on public.invoices;

create policy "invoices_select_own" on public.invoices
  for select using (user_id = (select auth.uid()));
create policy "invoices_insert_own" on public.invoices
  for insert with check (user_id = (select auth.uid()));
create policy "invoices_update_own" on public.invoices
  for update using (user_id = (select auth.uid()));
create policy "invoices_delete_own" on public.invoices
  for delete using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.invoices to authenticated;
