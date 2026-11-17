"use client";

import { CalendarDays } from "lucide-react";
import { useDict } from "~/components/site/locale";
import { SCHEDULE_EVENT } from "~/lib/booking-event";

/** Opens the booking dialog from anywhere (it is mounted once, in the layout). */
export function ScheduleCallButton({ className = "action", label }: { className?: string; label?: string }) {
  const t = useDict().booking;
  return (
    <button type="button" className={`${className} inline-flex items-center gap-1.5`} onClick={() => window.dispatchEvent(new Event(SCHEDULE_EVENT))} data-track="book-call">
      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
      {label ?? t.open}
    </button>
  );
}
