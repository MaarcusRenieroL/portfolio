-- Admin identity: exactly one admin, ever (id is pinned to 1).
create table if not exists admin_user (
  id smallint primary key default 1 check (id = 1),
  email text not null,
  totp_secret_enc text not null,
  totp_last_step bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists admin_passkey (
  id text primary key,
  public_key bytea not null,
  counter bigint not null default 0,
  transports text[],
  label text not null default 'Passkey',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists admin_recovery_code (
  id serial primary key,
  code_hash text not null unique,
  used_at timestamptz
);

-- One row per in-flight login or setup. The browser holds the random id in a cookie; only its hash is stored.
create table if not exists admin_attempt (
  id text primary key,
  kind text not null check (kind in ('login', 'setup')),
  stage text not null,
  magic_hash text,
  challenge text,
  pending jsonb,
  failures int not null default 0,
  ip_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists admin_session (
  id text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ip_hash text,
  ua text
);

create table if not exists audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  event text not null,
  ip_hash text,
  detail jsonb
);
create index if not exists audit_log_at on audit_log (at desc);
create index if not exists audit_log_event_at on audit_log (event, at desc);

-- First-party, cookieless analytics. `visitor` is a daily-rotating hash, never an IP.
create table if not exists site_event (
  id bigserial primary key,
  at timestamptz not null default now(),
  kind text not null,
  path text,
  target text,
  visitor text
);
create index if not exists site_event_at on site_event (at desc);
create index if not exists site_event_kind_at on site_event (kind, at desc);

-- CMS content. Draft is what the editor shows; published is what visitors see.
create table if not exists content_item (
  kind text not null,
  key text not null,
  position int not null default 0,
  draft jsonb not null,
  published jsonb,
  draft_de jsonb,
  published_de jsonb,
  de_machine boolean not null default false,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  primary key (kind, key)
);
create index if not exists content_item_kind on content_item (kind, position);
