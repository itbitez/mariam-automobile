-- =============================================================
-- Migration: finance estimator settings
-- Run this in: Supabase Dashboard → SQL Editor → New query
--
-- Safe to run more than once. Only needed if you already ran setup.sql
-- before the Calculator screen was added to the admin panel.
-- =============================================================

create table if not exists calc_settings (
  id int primary key default 1,
  price_min numeric not null default 1000000,
  price_max numeric not null default 6000000,
  price_step numeric not null default 50000,
  price_default numeric not null default 3000000,
  down_min numeric not null default 20,
  down_max numeric not null default 70,
  down_step numeric not null default 5,
  down_default numeric not null default 40,
  term_min numeric not null default 1,
  term_max numeric not null default 7,
  term_step numeric not null default 1,
  term_default numeric not null default 5,
  rate_min numeric not null default 7,
  rate_max numeric not null default 16,
  rate_step numeric not null default 0.5,
  rate_default numeric not null default 11,
  show_rate_slider boolean not null default true,
  car_page_rate numeric not null default 11,
  heading text not null default 'Monthly instalment estimator',
  intro text not null default '',
  disclaimer text not null default '',
  updated_at timestamptz not null default now()
);

alter table calc_settings enable row level security;

drop policy if exists "calc public read" on calc_settings;
drop policy if exists "calc admin write" on calc_settings;

create policy "calc public read" on calc_settings
  for select using (true);
create policy "calc admin write" on calc_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed row 1 with the values the site shipped with.
insert into calc_settings (id, intro, disclaimer)
values (
  1,
  'Move the sliders to see roughly what your monthly payment could look like. Then message us for an exact, bank-confirmed quote.',
  'Indicative estimate only. Final rates, fees and eligibility are set by your bank.'
)
on conflict (id) do nothing;
