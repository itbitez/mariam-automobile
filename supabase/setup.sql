-- =============================================================
-- Mariam Automobile — Supabase setup
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query
-- =============================================================

-- ---------- tables ----------
create table if not exists cars (
  id text primary key,
  title text not null,
  brand text not null,
  model text not null,
  grade text not null default '',
  year int not null,
  body text not null default 'SUV',
  fuel text not null default 'Hybrid',
  transmission text not null default 'Automatic',
  drive text not null default '2WD',
  engine text not null default '',
  mileage text not null default '',
  seats int not null default 5,
  color text not null default '',
  condition text not null default 'Recondition',
  auction text not null default '',
  reg text not null default '',
  price numeric not null default 0,
  featured boolean not null default false,
  status text not null default 'available',
  show_home boolean not null default false,
  photos jsonb not null default '[]'::jsonb,
  tagline text not null default '',
  about text not null default '',
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists home_content (
  id int primary key default 1,
  hero jsonb not null,
  trust jsonb not null,
  inventory jsonb not null,
  process jsonb not null,
  faq jsonb not null,
  cta jsonb not null,
  contact jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id int primary key default 1,
  phone text not null default '',
  whatsapp text not null default '',
  address text not null default '',
  hours_week text not null default '',
  hours_fri text not null default '',
  emergency text not null default '',
  updated_at timestamptz not null default now()
);

-- Website enquiry form submissions (homepage form + book-a-viewing).
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  car text not null default '',
  budget text not null default '',
  payment text not null default '',
  message text not null default '',
  source text not null default 'homepage',
  status text not null default 'new',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);

-- Finance estimator configuration (Admin → Calculator).
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

-- ---------- row level security ----------
alter table cars enable row level security;
alter table home_content enable row level security;
alter table site_settings enable row level security;
alter table calc_settings enable row level security;
alter table leads enable row level security;

-- public can read, only logged-in admins can write
create policy "cars public read" on cars
  for select using (true);
create policy "cars admin insert" on cars
  for insert with check (auth.role() = 'authenticated');
create policy "cars admin update" on cars
  for update using (auth.role() = 'authenticated');
create policy "cars admin delete" on cars
  for delete using (auth.role() = 'authenticated');

create policy "home public read" on home_content
  for select using (true);
create policy "home admin write" on home_content
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "settings public read" on site_settings
  for select using (true);
create policy "settings admin write" on site_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "calc public read" on calc_settings
  for select using (true);
create policy "calc admin write" on calc_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anyone can submit the public form; only admins can read or manage the results.
create policy "leads public insert" on leads
  for insert with check (true);
create policy "leads admin read" on leads
  for select using (auth.role() = 'authenticated');
create policy "leads admin update" on leads
  for update using (auth.role() = 'authenticated');
create policy "leads admin delete" on leads
  for delete using (auth.role() = 'authenticated');

-- ---------- storage bucket for car photos ----------
insert into storage.buckets (id, name, public)
values ('car-photos', 'car-photos', true)
on conflict (id) do nothing;

create policy "photos public read" on storage.objects
  for select using (bucket_id = 'car-photos');
create policy "photos admin upload" on storage.objects
  for insert with check (bucket_id = 'car-photos' and auth.role() = 'authenticated');
create policy "photos admin update" on storage.objects
  for update using (bucket_id = 'car-photos' and auth.role() = 'authenticated');
create policy "photos admin delete" on storage.objects
  for delete using (bucket_id = 'car-photos' and auth.role() = 'authenticated');
