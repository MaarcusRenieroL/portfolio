-- Messages from the contact form, kept so none are lost if email delivery fails. Deleted after 12 months.
create table if not exists contact_message (
  id bigserial primary key,
  name text not null,
  email text not null,
  org text,
  reason text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived boolean not null default false
);
create index if not exists contact_message_created_at on contact_message (created_at desc);
