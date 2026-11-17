-- Site-wide settings edited in the CMS (photo, availability, hero copy, résumé). One JSON row per key; saved = live.
create table if not exists site_setting (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
