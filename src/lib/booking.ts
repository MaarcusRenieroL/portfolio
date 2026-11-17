import { z } from "./zod-browser";

/**
 * Call booking rules, shared by the dialog and the API so they can never disagree.
 * Availability is defined in India time (IST is a fixed +05:30, no DST); visitors
 * see the same instants in their own time zone.
 */
export { SCHEDULE_EVENT } from "./booking-event";

export const HOST_TZ = "Asia/Kolkata";
const IST_OFFSET_MIN = 330;

/** Start times offered each day, IST. Edit these to change availability. */
export const SLOT_TIMES_IST = ["14:00", "15:00", "16:30", "17:30", "19:00", "20:00", "21:00"] as const;
export const DURATIONS = [15, 30, 45] as const;
export type Duration = (typeof DURATIONS)[number];

/** Earliest bookable slot is this far out; latest is BOOKING_DAYS ahead. */
export const MIN_LEAD_MS = 12 * 60 * 60_000;
export const BOOKING_DAYS = 30;

/** UTC instant of an IST wall-clock date + time. */
export function istToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, mi) - IST_OFFSET_MIN * 60_000);
}

/** Every bookable slot start (UTC), in order, from `now`. */
export function upcomingSlots(now = Date.now()): Date[] {
  const out: Date[] = [];
  const istToday = new Date(now + IST_OFFSET_MIN * 60_000);
  for (let i = 0; i <= BOOKING_DAYS; i++) {
    const day = new Date(Date.UTC(istToday.getUTCFullYear(), istToday.getUTCMonth(), istToday.getUTCDate() + i));
    const date = day.toISOString().slice(0, 10);
    for (const time of SLOT_TIMES_IST) {
      const start = istToUtc(date, time);
      if (start.getTime() - now >= MIN_LEAD_MS) out.push(start);
    }
  }
  return out;
}

/** True when `start` is exactly one of the offered slots and inside the booking window. */
export function isBookableSlot(start: Date, now = Date.now()): boolean {
  const t = start.getTime();
  return upcomingSlots(now).some((s) => s.getTime() === t);
}

const oneLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !/[\r\n]/.test(v), "Use a single line.");

export const bookingSchema = z.object({
  name: oneLine(100).pipe(z.string().min(2, "Please enter your name.")),
  email: oneLine(200).pipe(z.email("Please enter a valid email address.")),
  duration: z.union([z.literal(15), z.literal(30), z.literal(45)]),
  start: z.iso.datetime({ message: "Pick a time slot." }),
  timezone: z.string().max(64).default("UTC"),
  notes: z.string().trim().max(1000).optional(),
  token: z.string().optional(),
  website: z.string().optional(),
});
export type BookingInput = z.input<typeof bookingSchema>;
