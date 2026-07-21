-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ============================================================
-- ARTICLES
-- ============================================================
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table articles enable row level security;

drop policy if exists "Public can read published articles" on articles;
create policy "Public can read published articles"
  on articles for select
  to anon
  using (published = true);

drop policy if exists "Authenticated can read all articles" on articles;
create policy "Authenticated can read all articles"
  on articles for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert articles" on articles;
create policy "Authenticated can insert articles"
  on articles for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update articles" on articles;
create policy "Authenticated can update articles"
  on articles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete articles" on articles;
create policy "Authenticated can delete articles"
  on articles for delete
  to authenticated
  using (true);

-- keep updated_at fresh on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- ============================================================
-- PAGE SECTIONS (CMS content for the CV page: hero, about, skills, ...)
-- ============================================================
create table if not exists page_sections (
  section text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table page_sections enable row level security;

drop policy if exists "Public can read page sections" on page_sections;
create policy "Public can read page sections"
  on page_sections for select
  to anon
  using (true);

drop policy if exists "Authenticated can read page sections" on page_sections;
create policy "Authenticated can read page sections"
  on page_sections for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can upsert page sections" on page_sections;
create policy "Authenticated can upsert page sections"
  on page_sections for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update page sections" on page_sections;
create policy "Authenticated can update page sections"
  on page_sections for update
  to authenticated
  using (true)
  with check (true);

drop trigger if exists page_sections_set_updated_at on page_sections;
create trigger page_sections_set_updated_at
  before update on page_sections
  for each row execute function set_updated_at();

-- ============================================================
-- IMPORTANT MANUAL STEPS (do these in the Supabase dashboard, not SQL):
-- 1. Authentication > Providers > Email: turn OFF "Allow new users to sign up".
-- 2. Authentication > Users > Add user: create your one admin account
--    (email + password). This is the only account that will ever be able
--    to log in, since sign-up is disabled.
-- ============================================================
