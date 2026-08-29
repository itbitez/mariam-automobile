-- =============================================================
-- Migration: Happy Customers gallery
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Safe to run more than once.
-- =============================================================

-- ---------- delivery photos shown on /happy-customers ----------
create table if not exists happy_customers (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',        -- optional: customer name, car, or a short line
  sort_order int not null default 0,       -- lower shows first; ties fall back to newest
  created_at timestamptz not null default now()
);

create index if not exists happy_customers_order_idx
  on happy_customers (sort_order asc, created_at desc);

alter table happy_customers enable row level security;

drop policy if exists "happy public read" on happy_customers;
drop policy if exists "happy admin write" on happy_customers;

-- The gallery is public, but only a signed-in admin can change it.
create policy "happy public read" on happy_customers
  for select using (true);

create policy "happy admin write" on happy_customers
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Photos reuse the existing 'car-photos' storage bucket, so no new bucket or
-- storage policy is needed — the media library already reads and writes it.
