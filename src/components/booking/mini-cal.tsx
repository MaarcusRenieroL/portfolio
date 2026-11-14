"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Globe, CheckCircle2, Download, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const DURATIONS = [
  { id: 15, label: "15 min", desc: "Quick Intro / Coffee Chat" },
  { id: 30, label: "30 min", desc: "Technical Discussion & Role Fit" },
  { id: 45, label: "45 min", desc: "Architecture Deep Dive" },
] as const;

const AVAILABLE_SLOTS = [
  "14:00",
  "15:00",
  "16:30",
  "17:30",
  "19:00",
  "20:00",
  "21:00",
];

export function MiniCal({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<"slot" | "form" | "confirmed">("slot");
  const [duration, setDuration] = useState<15 | 30 | 45>(30);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>("15:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    gcalUrl: string;
    icsContent: string;
  } | null>(null);

  // User timezone detection
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  // Generate next 10 business dates
  const availableDates = useMemo(() => {
    const dates: Array<{ dateStr: string; label: string; dayName: string }> = [];
    const cur = new Date();
    let count = 0;
    while (dates.length < 10 && count < 20) {
      cur.setDate(cur.getDate() + 1);
      count++;
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        // Exclude weekends
        const dateStr = cur.toISOString().split("T")[0];
        dates.push({
          dateStr,
          label: cur.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          dayName: cur.toLocaleDateString("en-US", { weekday: "short" }),
        });
      }
    }
    return dates;
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          duration,
          date: selectedDate,
          time: selectedTime,
          timezone: userTimezone,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule meeting");
      }

      setConfirmation(data);
      setStep("confirmed");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadIcs = () => {
    if (!confirmation?.icsContent) return;
    const blob = new Blob([confirmation.icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-maarcus-${selectedDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-emerald-500/20 bg-[#060a08]/95 p-6 shadow-2xl backdrop-blur-xl text-neutral-100">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-semibold tracking-tight text-white">Book a Technical Call</h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Native calendar booking with Maarcus Reniero L · Chennai (IST)
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {step === "slot" && (
        <div className="space-y-5">
          {/* Duration Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 block">
              1. Select Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDuration(d.id)}
                  className={`rounded-lg border p-2.5 text-left transition-all ${
                    duration === d.id
                      ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.15)]"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  <div className="text-sm font-semibold">{d.label}</div>
                  <div className="text-[11px] text-neutral-400 truncate">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 block">
              2. Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableDates.map((item) => (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[64px] rounded-lg border py-2 px-1 text-center transition-all ${
                    selectedDate === item.dateStr
                      ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 font-semibold shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono">{item.dayName}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                3. Select Time
              </label>
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                <Globe className="h-3 w-3 text-emerald-400" />
                <span>{userTimezone}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {AVAILABLE_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-md border py-2 text-center text-xs font-mono transition-all ${
                    selectedTime === slot
                      ? "border-emerald-500 bg-emerald-500 text-black font-semibold shadow-md"
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-emerald-500/50 hover:bg-neutral-800"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => setStep("form")}
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {step === "form" && (
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="rounded-lg border border-neutral-800 bg-[#090f0c] p-3 text-xs text-neutral-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-emerald-400" />
              <span>{selectedDate}</span>
              <Clock className="h-4 w-4 ml-2 text-emerald-400" />
              <span>{selectedTime} ({duration} mins)</span>
            </div>
            <button
              type="button"
              onClick={() => setStep("slot")}
              className="text-emerald-400 hover:underline"
            >
              Change
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-950/40 p-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Your Name *</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Email Address *</label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Company / Organization</label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp or Freelance"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1 block">Meeting Agenda / Notes</label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to discuss? (e.g. Full-time backend role, Next.js architecture review, contract work)"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("slot")}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting || !name || !email}
            >
              {isSubmitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      )}

      {step === "confirmed" && confirmation && (
        <div className="py-6 text-center space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Call Scheduled!</h3>
            <p className="mt-1 text-xs text-neutral-300 max-w-sm mx-auto">
              We look forward to speaking with you on <strong className="text-white">{selectedDate}</strong> at <strong className="text-white">{selectedTime}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={confirmation.gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Add to Google Calendar</span>
            </a>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto gap-2"
              onClick={downloadIcs}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .ics file</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
