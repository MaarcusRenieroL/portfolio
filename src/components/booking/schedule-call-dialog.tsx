"use client";

import { CalendarDays, CalendarPlus, Check, Clock, Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { de as deLocale, enUS } from "react-day-picker/locale";
import { useDict, useLang } from "~/components/site/locale";
import { Turnstile } from "~/components/site/turnstile";
import { Button, buttonVariants } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { DURATIONS, type Duration, SCHEDULE_EVENT, bookingSchema, upcomingSlots } from "~/lib/booking";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";


type Done = { start: string; duration: number; gcal: string; ics: string; emailed: boolean };

function visitorZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "YYYY-MM-DD" for a calendar date (the picker hands us local-midnight Dates). */
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const keyToDate = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Appointment picker in the Origin UI pattern: a month calendar (days without
 * open slots are disabled) next to a scrollable column of times, all shown in
 * the visitor's time zone. Built from shadcn/ui parts: Dialog, Calendar,
 * ScrollArea, ToggleGroup, Label, Input, Textarea, Button.
 */
export function ScheduleCallDialog({ initialOpen = false }: { initialOpen?: boolean }) {
  const t = useDict().booking;
  const lang = useLang();
  const locale = lang === "de" ? "de-DE" : "en-US";

  const [open, setOpen] = useState(initialOpen);
  const [now, setNow] = useState(0);
  const [taken, setTaken] = useState<Set<string> | null>(null);
  const [duration, setDuration] = useState<Duration>(30);
  const [day, setDay] = useState<Date | undefined>();
  const [start, setStart] = useState("");
  const [form, setForm] = useState({ name: "", email: "", notes: "", website: "" });
  const [token, setToken] = useState("");
  const [checkKey, setCheckKey] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const tz = useMemo(() => visitorZone(), []);

  // Open from any ScheduleCallButton or the command palette; refresh availability each time.
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setNow(Date.now());
      setTaken(null);
      fetch("/api/schedule")
        .then((r) => (r.ok ? r.json() : { taken: [] }))
        .then((j: { taken?: string[] }) => setTaken(new Set(j.taken ?? [])))
        .catch(() => setTaken(new Set()));
    };
    window.addEventListener(SCHEDULE_EVENT, onOpen);
    return () => window.removeEventListener(SCHEDULE_EVENT, onOpen);
  }, []);

  const keyOf = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }), [tz]);
  const fmtTime = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" }), [locale, tz]);
  const fmtDay = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }), [locale]);
  const fmtFull = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: tz, dateStyle: "full", timeStyle: "short" }), [locale, tz]);

  // Open slots (offered minus taken), grouped by the visitor's local day.
  const byDay = useMemo(() => {
    const map = new Map<string, Date[]>();
    if (!now || !taken) return map;
    for (const s of upcomingSlots(now)) {
      if (taken.has(s.toISOString())) continue;
      const k = keyOf.format(s);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [now, taken, keyOf]);

  const keys = useMemo(() => [...byDay.keys()], [byDay]);
  const selected = day ?? (keys[0] ? keyToDate(keys[0]) : undefined);
  const slots = selected ? (byDay.get(dateKey(selected)) ?? []) : [];
  const onToken = useCallback((v: string) => setToken(v), []);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setDone(null);
      setError("");
      setStart("");
      setDay(undefined);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, duration, start, timezone: tz, token };
    const parsed = bookingSchema.safeParse(payload);
    const tr = (m: string) => t.errors[m] ?? m;
    if (!parsed.success) return setError(tr(parsed.error.issues[0]?.message ?? t.failed));
    setSending(true);
    try {
      const res = await fetch("/api/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json().catch(() => ({}))) as Partial<Done> & { error?: string };
      if (!res.ok || !json.start) {
        setError(json.error ? tr(json.error) : t.failed);
        setCheckKey((k) => k + 1); // a Turnstile token works once
        if (res.status === 409) {
          setTaken((prev) => new Set([...(prev ?? []), start]));
          setStart("");
        }
        return;
      }
      setDone(json as Done);
    } catch {
      setError(t.failed);
    } finally {
      setSending(false);
    }
  };

  const downloadIcs = () => {
    if (!done) return;
    const url = URL.createObjectURL(new Blob([done.ics], { type: "text/calendar;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "call-maarcus.ics" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-11 items-center justify-center rounded-full border border-[var(--green)] bg-[var(--green-wash)] text-[var(--green)]">
              <Check className="size-5" aria-hidden="true" />
            </span>
            <DialogHeader className="items-center text-center">
              <DialogTitle>{t.doneH}</DialogTitle>
              <DialogDescription>
                {t.done(fmtFull.format(new Date(done.start)))} {done.emailed && t.doneMailed}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap justify-center gap-2">
              <a className={buttonVariants({ variant: "outline" })} href={done.gcal} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="size-3.5" aria-hidden="true" />
                {t.gcal}
              </a>
              <Button variant="outline" onClick={downloadIcs}>
                <Download className="size-3.5" aria-hidden="true" />
                {t.ics}
              </Button>
            </div>
            <Button variant="ghost" onClick={() => close(false)}>
              {t.close}
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>{t.title}</DialogTitle>
              <DialogDescription>{t.lead(tz)}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label id="b-len">{t.length}</Label>
              <ToggleGroup type="single" value={String(duration)} onValueChange={(v) => v && setDuration(Number(v) as Duration)} aria-labelledby="b-len">
                {DURATIONS.map((d) => (
                  <ToggleGroupItem key={d} value={String(d)}>
                    <Clock className="mr-1.5 size-3" aria-hidden="true" />
                    {t.minutes(d)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Origin UI style appointment picker: calendar | time column */}
            <div className="rounded-lg border border-[var(--line)]">
              {!taken ? (
                <p className="flex items-center gap-2 p-6 text-xs text-[var(--fg-3)]">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  {t.loading}
                </p>
              ) : !keys.length ? (
                <p className="p-6 text-xs text-[var(--fg-3)]">{t.none}</p>
              ) : (
                <div className="flex flex-col sm:flex-row">
                  <div className="flex flex-1 justify-center">
                  <Calendar
                    mode="single"
                    required
                    selected={selected}
                    onSelect={(d) => {
                      setDay(d);
                      setStart("");
                    }}
                    locale={lang === "de" ? deLocale : enUS}
                    defaultMonth={selected}
                    startMonth={keyToDate(keys[0])}
                    endMonth={keyToDate(keys[keys.length - 1])}
                    disabled={(d) => !byDay.has(dateKey(d))}
                    className="p-3"
                  />
                  </div>
                  <div className="relative border-t border-[var(--line)] sm:w-48 sm:shrink-0 sm:border-t-0 sm:border-l">
                    <div className="sm:absolute sm:inset-0">
                      <ScrollArea className="max-h-60 sm:h-full sm:max-h-none">
                        <fieldset className="flex flex-col gap-3 p-4">
                          <legend className="mb-3 text-sm font-medium text-[var(--fg)]">{selected ? fmtDay.format(selected) : t.time}</legend>
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
                            {slots.map((s) => {
                              const iso = s.toISOString();
                              return (
                                <Button
                                  key={iso}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  aria-pressed={start === iso}
                                  onClick={() => setStart(iso)}
                                  className="w-full aria-pressed:border-[var(--green)] aria-pressed:bg-[var(--green)] aria-pressed:text-[var(--green-ink)] aria-pressed:font-semibold"
                                >
                                  {fmtTime.format(s)}
                                </Button>
                              );
                            })}
                          </div>
                        </fieldset>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="b-n">{t.name}</Label>
                <Input id="b-n" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="b-e">{t.email}</Label>
                <Input id="b-e" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-m">{t.notes}</Label>
              <Textarea id="b-m" rows={3} maxLength={1000} className="min-h-20" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {SITE_KEY && <Turnstile key={checkKey} siteKey={SITE_KEY} onToken={onToken} />}

            {error && (
              <p className="text-xs text-[var(--danger)]" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--fg-3)]" aria-live="polite">
                {start ? `${fmtFull.format(new Date(start))} · ${t.minutes(duration)}` : ""}
              </span>
              <Button type="submit" disabled={sending || !start}>
                {sending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                {sending ? t.sending : t.submit}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
