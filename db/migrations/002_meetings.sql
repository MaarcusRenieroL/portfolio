create table if not exists meeting_booking (
  id text primary key,
  name text not null,
  email text not null,
  company text,
  duration int not null,
  meeting_date text not null,
  meeting_time text not null,
  visitor_tz text not null,
  notes text,
  created_at timestamptz not null default now()
);
