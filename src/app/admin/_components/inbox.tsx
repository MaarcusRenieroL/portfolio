"use client";

import { Archive, ArchiveRestore, CalendarClock, Check, Loader2, Mail, MailOpen, Reply, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { REASON_LABELS } from "~/lib/contact-schema";
import { cancelBooking, deleteMessage, setMessageArchived, setMessageRead } from "../inbox-actions";

export type Message = { id: number; name: string; email: string; org: string | null; reason: keyof typeof REASON_LABELS | string; message: string; created_at: string; read_at: string | null; archived: boolean };
export type Booking = { id: string; name: string; email: string; company: string | null; notes: string | null; duration: number; visitor_tz: string; starts_at: string | null; created_at: string };

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) => new Date(iso).toLocaleString("en", opts);

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d`;
  return fmt(iso, { month: "short", day: "numeric" });
}

const btn =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[12px] text-[var(--fg-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--fg)] disabled:opacity-50 pointer-coarse:h-10";

/** Contact messages: a list and the open message, with reply, read/unread, archive and delete. */
export function MessagesInbox({ messages, archived }: { messages: Message[]; archived: boolean }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(messages[0]?.id ?? null);
  const [busy, setBusy] = useState("");
  const open = messages.find((m) => m.id === openId) ?? null;

  const act = async (key: string, fn: () => Promise<{ ok: boolean }>) => {
    setBusy(key);
    await fn();
    setBusy("");
    router.refresh();
  };

  const select = (m: Message) => {
    setOpenId(m.id);
    if (!m.read_at) void act(`read-${m.id}`, () => setMessageRead(m.id, true));
  };

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line-2)] px-6 py-12 text-center">
        <Mail className="mx-auto h-6 w-6 text-[var(--fg-3)]" aria-hidden="true" />
        <p className="mt-3 text-sm text-[var(--fg)]">{archived ? "Nothing archived" : "No messages yet"}</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-[var(--fg-3)]">
          {archived ? "Archived messages land here." : "Messages from the contact form show up here as well as in your email."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-xl border border-[var(--line)] lg:grid-cols-[22rem_minmax(0,1fr)]">
      <ul className="max-h-[70vh] divide-y divide-[var(--line)] overflow-y-auto border-[var(--line)] lg:border-r" data-lenis-prevent aria-label="Messages">
        {messages.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => select(m)}
              aria-current={m.id === openId}
              className={`block w-full px-4 py-3 text-left transition-colors ${m.id === openId ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]/60"}`}
            >
              <span className="flex items-center gap-2">
                {!m.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green)]" aria-label="Unread" />}
                <span className={`min-w-0 flex-1 truncate text-[13px] ${m.read_at ? "text-[var(--fg-2)]" : "font-medium text-[var(--fg)]"}`}>{m.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-[var(--fg-3)]">{ago(m.created_at)}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-[var(--fg-3)]">
                {REASON_LABELS[m.reason as keyof typeof REASON_LABELS] ?? m.reason} · {m.message}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open ? (
        <article className="min-w-0 p-5 sm:p-6" aria-label={`Message from ${open.name}`}>
          <header className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-semibold text-[var(--fg)]">{open.name}</h2>
              <p className="text-[12px] text-[var(--fg-3)]">
                <a className="text-[var(--fg-2)] underline underline-offset-2 hover:text-[var(--green)]" href={`mailto:${open.email}`}>
                  {open.email}
                </a>
                {open.org ? ` · ${open.org}` : ""} · {fmt(open.created_at)}
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--fg-2)]">
              {REASON_LABELS[open.reason as keyof typeof REASON_LABELS] ?? open.reason}
            </span>
          </header>
          <p className="mt-5 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--fg)]">{open.message}</p>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
            <a
              href={`mailto:${open.email}?subject=${encodeURIComponent("Re: your message on maarcus.dev")}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--green)] px-3 text-[12px] font-medium text-[var(--green-ink)] hover:opacity-90 pointer-coarse:h-10"
            >
              <Reply className="h-3.5 w-3.5" /> Reply by email
            </a>
            <button type="button" className={btn} disabled={Boolean(busy)} onClick={() => void act("read", () => setMessageRead(open.id, !open.read_at))}>
              {open.read_at ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
              {open.read_at ? "Mark unread" : "Mark read"}
            </button>
            <button type="button" className={btn} disabled={Boolean(busy)} onClick={() => void act("arch", () => setMessageArchived(open.id, !open.archived))}>
              {open.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
              {open.archived ? "Move to inbox" : "Archive"}
            </button>
            <button
              type="button"
              className={`${btn} ml-auto border-[var(--danger)]/40 text-[var(--danger)] hover:text-[var(--danger)]`}
              disabled={Boolean(busy)}
              onClick={() => {
                if (confirm(`Delete the message from ${open.name} for good?`)) void act("del", () => deleteMessage(open.id));
              }}
            >
              {busy === "del" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </button>
          </div>
        </article>
      ) : (
        <p className="hidden p-6 text-[13px] text-[var(--fg-3)] lg:block">Pick a message.</p>
      )}
    </div>
  );
}

/** Booked calls: upcoming first, with the guest's details and a cancel that emails them. */
export function CallsList({ upcoming, past }: { upcoming: Booking[]; past: Booking[] }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const row = (b: Booking, isPast: boolean) => (
    <li key={b.id} className="px-4 py-3.5">
      <div className="flex flex-wrap items-start gap-3">
        <CalendarClock className={`mt-0.5 h-4 w-4 shrink-0 ${isPast ? "text-[var(--fg-3)]" : "text-[var(--green)]"}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[var(--fg)]">
            {b.starts_at ? fmt(b.starts_at, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Unknown time"}
            <span className="text-[var(--fg-3)]"> · {b.duration} min · their zone {b.visitor_tz}</span>
          </p>
          <p className="truncate text-[12px] text-[var(--fg-2)]">
            {b.name}
            {b.company ? `, ${b.company}` : ""} ·{" "}
            <a className="underline underline-offset-2 hover:text-[var(--green)]" href={`mailto:${b.email}`}>
              {b.email}
            </a>
          </p>
          {b.notes && <p className="mt-1 whitespace-pre-wrap text-[12px] text-[var(--fg-3)]">{b.notes}</p>}
        </div>
        {!isPast && cancelling !== b.id && (
          <button type="button" className={btn} onClick={() => setCancelling(b.id)}>
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
      </div>
      {cancelling === b.id && (
        <div className="mt-3 space-y-2 rounded-lg border border-[var(--danger)]/40 p-3">
          <p className="text-[12px] text-[var(--fg)]">Cancel this call? {b.name} gets an email (if email is set up), and the slot opens again.</p>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for them, e.g. a reason or other times that work" />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              className={`${btn} border-[var(--danger)]/40 text-[var(--danger)] hover:text-[var(--danger)]`}
              onClick={async () => {
                setBusy(true);
                const r = await cancelBooking(b.id, note);
                setBusy(false);
                setCancelling(null);
                setNote("");
                setResult(r.ok ? (r.emailed ? `Cancelled. ${b.name} was emailed.` : `Cancelled. Email isn't set up, so tell ${b.name} yourself.`) : r.errors.join(" "));
                router.refresh();
              }}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Cancel the call
            </button>
            <button type="button" className={btn} onClick={() => setCancelling(null)}>
              Keep it
            </button>
          </div>
        </div>
      )}
    </li>
  );

  return (
    <div className="space-y-8">
      {result && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2.5 text-[13px] text-[var(--fg)]">
          <Check className="h-3.5 w-3.5 text-[var(--green)]" /> {result}
        </p>
      )}
      <section aria-labelledby="up-h">
        <h2 id="up-h" className="mb-2 text-[13px] font-medium text-[var(--fg)]">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] px-4 py-5 text-[13px] text-[var(--fg-3)]">No calls booked. People book from the Schedule a call button on the site.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)]">{upcoming.map((b) => row(b, false))}</ul>
        )}
      </section>
      {past.length > 0 && (
        <section aria-labelledby="past-h">
          <h2 id="past-h" className="mb-2 text-[13px] font-medium text-[var(--fg)]">
            Past ({past.length})
          </h2>
          <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)] opacity-80">{past.map((b) => row(b, true))}</ul>
          <p className="mt-2 text-[12px] text-[var(--fg-3)]">Past calls are deleted 12 months after they happened.</p>
        </section>
      )}
    </div>
  );
}
