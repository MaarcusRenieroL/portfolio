import type { Metadata } from "next";
import { MiniCal } from "~/components/booking/mini-cal";

export const metadata: Metadata = {
  title: "Schedule a Call · Maarcus Reniero L",
  description: "Book a 15, 30, or 45-minute technical discussion or intro call with Maarcus Reniero L.",
};

export default function SchedulePage() {
  return (
    <div className="wrap page py-12">
      <div className="flex flex-col items-center justify-center">
        <MiniCal />
      </div>
    </div>
  );
}
