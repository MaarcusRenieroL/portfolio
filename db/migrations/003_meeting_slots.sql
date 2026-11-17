-- Bookings are stored by their exact UTC start so a slot can only be taken once.
alter table meeting_booking add column if not exists starts_at timestamptz;
create unique index if not exists meeting_booking_starts_at on meeting_booking (starts_at);
