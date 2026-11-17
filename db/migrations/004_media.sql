-- CMS media library. Files live in Vercel Blob; this table holds what the blob store doesn't: alt text and image size.
create table if not exists media (
  id bigserial primary key,
  url text not null unique,
  pathname text not null,
  content_type text not null,
  size integer not null,
  width integer,
  height integer,
  alt text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists media_created_at on media (created_at desc);
