"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  CheckCircle2,
  Download,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Video,
  Coffee,
  Code2,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const DURATIONS = [
  {
    id: 15 as const,
    label: "15 min",
    icon: Coffee,
    title: "Quick Intro / Coffee Chat",
    desc: "Casual conversation, initial role alignment, or high-level questions.",
  },
  {
    id: 30 as const,
    label: "30 min",
    icon: Code2,
    title: "Technical Discussion & Role Fit",
    desc: "In-depth review of backend architecture, Go/TypeScript stack, and role expectations.",
  },
  {
    id: 45 as const,
    label: "45 min",
    icon: Layers,
    title: "Architecture & Systems Deep Dive",
    desc: "Technical systems design, distributed workflows, or comprehensive code walkthrough.",
  },
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

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function format12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDateLong(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toDateString(d: Date) {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MiniCal({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<"slot" | "form" | "confirmed">("slot");
  const [duration, setDuration] = useState<15 | 30 | 45>(30);

  // Month navigation state
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toDateString(today), [today]);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Default selected date to next business day
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    // If weekend, skip to Monday
    if (next.getDay() === 0) next.setDate(next.getDate() + 1);
    if (next.getDay() === 6) next.setDate(next.getDate() + 2);
    return toDateString(next);
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
      return "Asia/Kolkata";
    }
  }, []);

  const currentDurationObj = useMemo(
    () => DURATIONS.find((d) => d.id === duration) ?? DURATIONS[1],
    [duration]
  );

  // Calendar generation math
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dayNum: number | null;
      dateStr: string;
      isPast: boolean;
      isWeekend: boolean;
      isToday: boolean;
      isAvailable: boolean;
    }> = [];

    // Preceding empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNum: null,
        dateStr: "",
        isPast: true,
        isWeekend: false,
        isToday: false,
        isAvailable: false,
      });
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const dObj = new Date(year, month, day);
      const dateStr = toDateString(dObj);
      const dayOfWeek = dObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const isAvailable = !isPast && !isWeekend;

      days.push({
        dayNum: day,
        dateStr,
        isPast,
        isWeekend,
        isToday,
        isAvailable,
      });
    }

    return days;
  }, [currentMonth, todayStr]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [currentMonth]);

  const canGoPrev = useMemo(() => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prev.getFullYear() >= today.getFullYear() && prev.getMonth() >= today.getMonth();
  }, [currentMonth, today]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

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
    <div className="w-full max-w-4xl rounded-2xl border border-neutral-800 bg-[#060a08]/98 shadow-2xl backdrop-blur-xl text-neutral-100 overflow-hidden font-sans">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-800/80">
        {/* ================= LEFT SIDEBAR (Host Info & Details) ================= */}
        <aside className="md:w-80 lg:w-84 shrink-0 p-6 bg-[#040806]/80 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Host Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-[#08120d] shadow-sm">
                  <span className="text-emerald-400 font-bold text-xs tracking-wider font-mono">MR</span>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#060a08]" />
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-400">Maarcus Reniero L</div>
                  <div className="text-[13px] font-semibold text-white">Technical Scheduling</div>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Event Title & Description */}
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                {currentDurationObj.title}
              </h2>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                {currentDurationObj.desc}
              </p>
            </div>

            {/* Duration Selector Segmented Bar */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block font-mono">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-neutral-800/80 bg-[#08100c] p-1">
                {DURATIONS.map((d) => {
                  const Icon = d.icon;
                  const isActive = duration === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-emerald-500 text-black font-semibold shadow-sm shadow-emerald-500/20"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                      }`}
                    >
                      <Icon className={`h-3 w-3 ${isActive ? "text-black" : "text-neutral-400"}`} />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Metadata Spec list */}
            <div className="space-y-2 text-xs text-neutral-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Google Meet video call</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{userTimezone}</span>
              </div>
            </div>

            {/* Selected Slot Recap Badge */}
            {selectedDate && selectedTime && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{formatDateLong(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/80 pl-5 font-mono">
                  <span>{format12h(selectedTime)} ({duration}m)</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800/60 text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
            <Sparkles className="h-3 w-3 text-emerald-500/80" />
            <span>Instant Google Meet &amp; ICS invite</span>
          </div>
        </aside>

        {/* ================= RIGHT PANEL (Interactive Calendar / Details) ================= */}
        <main className="flex-1 p-6 flex flex-col justify-between">
          {/* STEP 1: Interactive Monthly Calendar & Time Slots */}
          {step === "slot" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                  <span>Select a Date &amp; Time</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <Globe className="h-3 w-3 text-emerald-400" />
                  <span>{userTimezone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Monthly Calendar Grid (Cal.com Style) */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Month header & navigation */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-neutral-200 tracking-wide">
                      {monthLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={!canGoPrev}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-semibold text-neutral-500">
                    {WEEKDAY_NAMES.map((w) => (
                      <div key={w} className="py-1">
                        {w}
                      </div>
                    ))}
                  </div>

                  {/* 7-column Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((cell, idx) => {
                      if (!cell.dayNum) {
                        return <div key={`empty-${idx}`} className="h-9 w-full" />;
                      }

                      const isSelected = selectedDate === cell.dateStr;
                      const isDisabled = !cell.isAvailable;

                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`group relative flex h-9 w-full items-center justify-center rounded-xl text-xs transition-all ${
                            isSelected
                              ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30 scale-105 z-10"
                              : isDisabled
                              ? "text-neutral-600 opacity-30 cursor-not-allowed"
                              : "text-neutral-200 hover:bg-[#0f1d16] hover:text-emerald-300 hover:border hover:border-emerald-500/40"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {/* Dot indicator for available days */}
                          {!isSelected && cell.isAvailable && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500/70 group-hover:bg-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots Rail */}
                <div className="lg:col-span-5 space-y-2 border-t lg:border-t-0 lg:border-l border-neutral-800/80 pt-4 lg:pt-0 lg:pl-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
                    <span>Available Times</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {selectedDate ? formatDateLong(selectedDate) : "Pick date"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {AVAILABLE_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <div key={slot} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`flex-1 rounded-xl py-2 px-3 text-xs font-mono transition-all text-center ${
                              isSelected
                                ? "bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20"
                                : "border border-neutral-800 bg-[#09110d] text-neutral-300 hover:border-emerald-500/50 hover:bg-[#0e1a14] hover:text-emerald-300"
                            }`}
                          >
                            {format12h(slot)}
                          </button>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={() => setStep("form")}
                              className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-300 transition-all flex items-center gap-1 shrink-0 animate-in fade-in"
                            >
                              <span>Next</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Continue bar */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="text-xs text-neutral-400 hidden sm:block">
                  Meeting date: <strong className="text-white">{formatDateLong(selectedDate)}</strong> at{" "}
                  <strong className="text-emerald-400">{format12h(selectedTime)}</strong>
                </div>
                <Button
                  variant="default"
                  className="gap-2 ml-auto"
                  onClick={() => setStep("form")}
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Attendee Details Form */}
          {step === "form" && (
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <h3 className="text-sm font-semibold tracking-tight text-white">Enter Your Details</h3>
                <button
                  type="button"
                  onClick={() => setStep("slot")}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Change Date &amp; Time
                </button>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-[#09110d] p-3 text-xs text-neutral-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-emerald-400" />
                  <span>{formatDateLong(selectedDate)}</span>
                  <Clock className="h-4 w-4 ml-2 text-emerald-400" />
                  <span className="font-mono">{format12h(selectedTime)}</span>
                </div>
                <span className="text-emerald-400 font-medium">({duration} mins)</span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">Your Name *</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-[#09110d] border-neutral-800 focus:border-neutral-700 text-xs"
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
                    className="bg-[#09110d] border-neutral-800 focus:border-neutral-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Company / Organization</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp or Freelance"
                  className="bg-[#09110d] border-neutral-800 focus:border-neutral-700 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Meeting Agenda / Topic</label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss? (e.g. Full-time backend role, Go / TypeScript architecture, contract scope)"
                  className="bg-[#09110d] border-neutral-800 focus:border-neutral-700 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
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
                  className="gap-2"
                >
                  <span>{isSubmitting ? "Scheduling..." : "Confirm & Schedule Call"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Confirmed Screen */}
          {step === "confirmed" && confirmation && (
            <div className="py-6 text-center space-y-5 animate-in fade-in">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Call Confirmed!</h3>
                <p className="mt-1 text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  Your meeting with Maarcus Reniero L has been scheduled for{" "}
                  <strong className="text-white">{formatDateLong(selectedDate)}</strong> at{" "}
                  <strong className="text-emerald-400 font-mono">{format12h(selectedTime)}</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-[#09110d] p-4 max-w-md mx-auto text-left text-xs space-y-2 text-neutral-300">
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-500">Event</span>
                  <span className="font-semibold text-white">{currentDurationObj.title}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-500">Duration</span>
                  <span className="text-neutral-200">{duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Location</span>
                  <span className="text-emerald-400 font-medium">Google Meet (Link generated in invite)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={confirmation.gcalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("slot");
                    setConfirmation(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-200 hover:underline"
                >
                  Schedule another discussion
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
