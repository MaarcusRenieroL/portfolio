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
import { useTheme } from "~/components/site/theme-toggle";

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
  const theme = useTheme();
  const isDark = theme === "dark";

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
    <div
      className={`w-full max-w-4xl rounded-2xl border font-sans overflow-hidden transition-colors duration-200 ${
        isDark
          ? "border-neutral-800 bg-[#060a08]/98 text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(16,185,129,0.12)]"
          : "border-neutral-200/90 bg-white text-neutral-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div
        className={`flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x ${
          isDark ? "divide-neutral-800/80" : "divide-neutral-200"
        }`}
      >
        {/* ================= LEFT SIDEBAR (Host Info & Details) ================= */}
        <aside
          className={`md:w-80 lg:w-84 shrink-0 p-6 flex flex-col justify-between space-y-6 ${
            isDark ? "bg-[#040806]/80 text-neutral-100" : "bg-[#fbfdfc] text-neutral-900"
          }`}
        >
          <div className="space-y-5">
            {/* Host Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${
                    isDark
                      ? "border-emerald-500/40 bg-[#08120d]"
                      : "border-emerald-500/30 bg-[#ecfdf5]"
                  }`}
                >
                  <span
                    className={`font-bold text-xs tracking-wider font-mono ${
                      isDark ? "text-emerald-400" : "text-emerald-700"
                    }`}
                  >
                    MR
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border ${
                        isDark ? "border-[#060a08]" : "border-white"
                      }`}
                    />
                  </span>
                </div>
                <div>
                  <div className={`text-xs font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Maarcus Reniero L
                  </div>
                  <div className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    Technical Scheduling
                  </div>
                </div>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-lg p-1 transition-colors ${
                    isDark
                      ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                      : "text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Event Title & Description */}
            <div>
              <h2
                className={`text-base font-bold tracking-tight leading-snug ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {currentDurationObj.title}
              </h2>
              <p
                className={`mt-1 text-xs leading-relaxed ${
                  isDark ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                {currentDurationObj.desc}
              </p>
            </div>

            {/* Duration Selector Segmented Bar */}
            <div>
              <label
                className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 block font-mono ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Duration
              </label>
              <div
                className={`grid grid-cols-3 gap-1.5 rounded-xl border p-1 ${
                  isDark
                    ? "border-neutral-800/80 bg-[#08100c]"
                    : "border-neutral-200 bg-neutral-100/80"
                }`}
              >
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
                          ? isDark
                            ? "bg-emerald-500 text-black font-semibold shadow-sm"
                            : "bg-emerald-600 text-white font-semibold shadow-xs"
                          : isDark
                          ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Metadata Spec list */}
            <div
              className={`space-y-2 text-xs pt-1 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <span>{duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <span>Google Meet video call</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                <span className="truncate">{userTimezone}</span>
              </div>
            </div>

            {/* Selected Slot Recap Badge */}
            {selectedDate && selectedTime && (
              <div
                className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                  isDark
                    ? "border-emerald-500/25 bg-emerald-950/20 text-emerald-300"
                    : "border-emerald-300 bg-emerald-50/80 text-emerald-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarIcon className={`h-3.5 w-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>{formatDateLong(selectedDate)}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-[11px] pl-5 font-mono ${
                    isDark ? "text-emerald-400/80" : "text-emerald-700"
                  }`}
                >
                  <span>{format12h(selectedTime)} ({duration}m)</span>
                </div>
              </div>
            )}
          </div>

          <div
            className={`pt-4 border-t text-[10px] flex items-center gap-1 font-mono ${
              isDark ? "border-neutral-800/60 text-neutral-500" : "border-neutral-200 text-neutral-500"
            }`}
          >
            <Sparkles className={`h-3 w-3 ${isDark ? "text-emerald-500/80" : "text-emerald-600"}`} />
            <span>Instant Google Meet &amp; ICS invite</span>
          </div>
        </aside>

        {/* ================= RIGHT PANEL (Interactive Calendar / Details) ================= */}
        <main className={`flex-1 p-6 flex flex-col justify-between ${isDark ? "bg-[#060a08]/95" : "bg-white"}`}>
          {/* STEP 1: Interactive Monthly Calendar & Time Slots */}
          {step === "slot" && (
            <div className="space-y-6">
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
                  isDark ? "border-neutral-800/80" : "border-neutral-200"
                }`}
              >
                <h3
                  className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  <span>Select a Date &amp; Time</span>
                </h3>
                <div
                  className={`flex items-center gap-2 text-xs font-mono ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  <Globe className={`h-3 w-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>{userTimezone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Monthly Calendar Grid (Cal.com Style) */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Month header & navigation */}
                  <div className="flex items-center justify-between px-1">
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isDark ? "text-neutral-200" : "text-neutral-800"
                      }`}
                    >
                      {monthLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={!canGoPrev}
                        className={`rounded-lg p-1.5 transition-colors disabled:opacity-20 disabled:hover:bg-transparent ${
                          isDark
                            ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isDark
                            ? "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                        }`}
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div
                    className={`grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-semibold ${
                      isDark ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  >
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
                        return <div key={`empty-${idx}`} className="h-9.5 w-full" />;
                      }

                      const isSelected = selectedDate === cell.dateStr;
                      const isDisabled = !cell.isAvailable;

                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedDate(cell.dateStr)}
                          className={`group relative flex h-9.5 w-full items-center justify-center rounded-xl text-xs transition-all ${
                            isSelected
                              ? isDark
                                ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30 scale-105 z-10"
                                : "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25 scale-105 z-10"
                              : isDisabled
                              ? isDark
                                ? "text-neutral-700 opacity-25 cursor-not-allowed"
                                : "text-neutral-300 opacity-40 cursor-not-allowed"
                              : isDark
                              ? "text-neutral-200 hover:bg-[#0f1d16] hover:text-emerald-300 hover:border hover:border-emerald-500/40"
                              : "text-neutral-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border hover:border-emerald-300"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {/* Dot indicator for available days */}
                          {!isSelected && cell.isAvailable && (
                            <span
                              className={`absolute bottom-1 h-1 w-1 rounded-full ${
                                isDark
                                  ? "bg-emerald-500/70 group-hover:bg-emerald-400"
                                  : "bg-emerald-600/70 group-hover:bg-emerald-600"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots Rail */}
                <div
                  className={`lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 ${
                    isDark ? "border-neutral-800/80" : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className={isDark ? "text-neutral-300" : "text-neutral-800"}>Available Times</span>
                    <span
                      className={`text-[10px] font-mono ${
                        isDark ? "text-emerald-400" : "text-emerald-700"
                      }`}
                    >
                      {selectedDate ? formatDateLong(selectedDate) : "Pick date"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {AVAILABLE_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`w-full rounded-xl py-2.5 px-3 text-xs font-mono transition-all text-center border ${
                            isSelected
                              ? isDark
                                ? "bg-emerald-500 border-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/20"
                                : "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                              : isDark
                              ? "border-neutral-800 bg-[#09110d] text-neutral-300 hover:border-emerald-500/50 hover:bg-[#0e1a14] hover:text-emerald-300"
                              : "border-neutral-200 bg-white text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/60"
                          }`}
                        >
                          {format12h(slot)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Continue bar */}
              <div
                className={`pt-3 border-t flex items-center justify-between ${
                  isDark ? "border-neutral-800/80" : "border-neutral-200"
                }`}
              >
                <div
                  className={`text-xs hidden sm:block ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Selected:{" "}
                  <strong className={isDark ? "text-white" : "text-neutral-900"}>
                    {formatDateLong(selectedDate)}
                  </strong>{" "}
                  at{" "}
                  <strong className={isDark ? "text-emerald-400" : "text-emerald-700"}>
                    {format12h(selectedTime)}
                  </strong>
                </div>
                <Button
                  variant="default"
                  className={`gap-2 ml-auto ${
                    isDark
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
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
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? "border-neutral-800/80" : "border-neutral-200"
                }`}
              >
                <h3
                  className={`text-sm font-semibold tracking-tight ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Enter Your Details
                </h3>
                <button
                  type="button"
                  onClick={() => setStep("slot")}
                  className={`text-xs hover:underline ${
                    isDark ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  Change Date &amp; Time
                </button>
              </div>

              <div
                className={`rounded-xl border p-3 text-xs flex items-center justify-between ${
                  isDark
                    ? "border-neutral-800 bg-[#09110d] text-neutral-300"
                    : "border-emerald-200 bg-[#f0fdf4] text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className={`h-4 w-4 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
                  <span>{formatDateLong(selectedDate)}</span>
                  <Clock className={`h-4 w-4 ml-2 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
                  <span className="font-mono">{format12h(selectedTime)}</span>
                </div>
                <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  ({duration} mins)
                </span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`text-xs mb-1 block ${
                      isDark ? "text-neutral-400" : "text-neutral-700 font-medium"
                    }`}
                  >
                    Your Name *
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className={`text-xs no-focus-ring ${
                      isDark
                        ? "bg-[#09110d] border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-700"
                        : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600"
                    }`}
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs mb-1 block ${
                      isDark ? "text-neutral-400" : "text-neutral-700 font-medium"
                    }`}
                  >
                    Email Address *
                  </label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className={`text-xs no-focus-ring ${
                      isDark
                        ? "bg-[#09110d] border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-700"
                        : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600"
                    }`}
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`text-xs mb-1 block ${
                    isDark ? "text-neutral-400" : "text-neutral-700 font-medium"
                  }`}
                >
                  Company / Organization
                </label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp or Freelance"
                  className={`text-xs no-focus-ring ${
                    isDark
                      ? "bg-[#09110d] border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-700"
                      : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600"
                  }`}
                  style={{ outline: "none", boxShadow: "none" }}
                />
              </div>

              <div>
                <label
                  className={`text-xs mb-1 block ${
                    isDark ? "text-neutral-400" : "text-neutral-700 font-medium"
                  }`}
                >
                  Meeting Agenda / Topic
                </label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss? (e.g. Full-time backend role, Go / TypeScript architecture, contract scope)"
                  className={`text-xs no-focus-ring ${
                    isDark
                      ? "bg-[#09110d] border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-700"
                      : "bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600"
                  }`}
                  style={{ outline: "none", boxShadow: "none" }}
                />
              </div>

              <div
                className={`flex items-center justify-between pt-3 border-t ${
                  isDark ? "border-neutral-800/80" : "border-neutral-200"
                }`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("slot")}
                  className={isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isSubmitting || !name || !email}
                  className={`gap-2 ${
                    isDark
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
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
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-4 shadow-lg ${
                  isDark
                    ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/10 shadow-emerald-500/20"
                    : "bg-emerald-100 text-emerald-700 ring-emerald-300 shadow-emerald-600/10"
                }`}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3
                  className={`text-xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Call Confirmed!
                </h3>
                <p
                  className={`mt-1 text-xs max-w-sm mx-auto leading-relaxed ${
                    isDark ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  Your meeting with Maarcus Reniero L has been scheduled for{" "}
                  <strong className={isDark ? "text-white" : "text-neutral-900"}>
                    {formatDateLong(selectedDate)}
                  </strong>{" "}
                  at{" "}
                  <strong className={`font-mono ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                    {format12h(selectedTime)}
                  </strong>.
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 max-w-md mx-auto text-left text-xs space-y-2 ${
                  isDark
                    ? "border-neutral-800 bg-[#09110d] text-neutral-300"
                    : "border-neutral-200 bg-[#fbfdfc] text-neutral-800 shadow-xs"
                }`}
              >
                <div
                  className={`flex justify-between border-b pb-2 ${
                    isDark ? "border-neutral-800/60" : "border-neutral-200"
                  }`}
                >
                  <span className={isDark ? "text-neutral-500" : "text-neutral-500"}>Event</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>
                    {currentDurationObj.title}
                  </span>
                </div>
                <div
                  className={`flex justify-between border-b pb-2 ${
                    isDark ? "border-neutral-800/60" : "border-neutral-200"
                  }`}
                >
                  <span className={isDark ? "text-neutral-500" : "text-neutral-500"}>Duration</span>
                  <span className={isDark ? "text-neutral-200" : "text-neutral-700"}>{duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-neutral-500" : "text-neutral-500"}>Location</span>
                  <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                    Google Meet (Link generated in invite)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={confirmation.gcalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all shadow-md active:scale-95 ${
                    isDark
                      ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                  }`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Add to Google Calendar</span>
                </a>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full sm:w-auto gap-2 ${
                    isDark ? "" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
                  }`}
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
                  className={`text-xs hover:underline ${
                    isDark ? "text-neutral-400 hover:text-neutral-200" : "text-neutral-500 hover:text-neutral-800"
                  }`}
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
