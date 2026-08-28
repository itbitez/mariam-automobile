-- =============================================================
-- Migration: lead capture
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Safe to run more than once.
-- =============================================================

-- ---------- where website enquiries are stored ----------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  car text not null default '',
  budget text not null default '',
  payment text not null default '',
  message text not null default '',
  source text not null default 'homepage',
  status text not null default 'new',          -- new | contacted | closed
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);

alter table leads enable row level security;

drop policy if exists "leads public insert" on leads;
drop policy if exists "leads admin read" on leads;
drop policy if exists "leads admin update" on leads;
drop policy if exists "leads admin delete" on leads;

-- Anyone can submit the public form...
create policy "leads public insert" on leads
  for insert with check (true);

-- ...but only a signed-in admin can read or manage them.
create policy "leads admin read" on leads
  for select using (auth.role() = 'authenticated');
create policy "leads admin update" on leads
  for update using (auth.role() = 'authenticated');
create policy "leads admin delete" on leads
  for delete using (auth.role() = 'authenticated');
