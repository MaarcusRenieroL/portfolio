"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { type ContactState, sendContactMessage } from "~/lib/actions/contact";
import { REASONS } from "~/lib/content";
import { Arrow } from "./icons";

const initial: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial);
  const [reason, setReason] = useState(REASONS[0].id);
  const [again, setAgain] = useState(0);
  const cur = REASONS.find((r) => r.id === reason) ?? REASONS[0];
  const fe = state.fieldErrors ?? {};

  if (state.status === "success" && again === 0) {
    return (
      <div className="stack" style={{ gap: 20, minHeight: 520, justifyContent: "center" }} aria-live="polite">
        <div className="slash in" data-draw />
        <span className="kanji rise" style={{ fontSize: 64, lineHeight: 1 }} aria-hidden="true">済</span>
        <h2 className="h2 rise" style={{ animationDelay: "120ms" }}>Message sent.</h2>
        <p className="body rise" style={{ animationDelay: "220ms" }}>Thanks — you&apos;ll hear back from me directly at the address you gave.</p>
        <button className="btn btn-ghost" type="button" style={{ alignSelf: "flex-start" }} onClick={() => setAgain(1)}>Send another</button>
      </div>
    );
  }

  return (
    <form className="stack" style={{ gap: 24 }} action={action} key={again} noValidate>
      <fieldset className="stack" style={{ gap: 12, border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 12, color: "var(--fg-2)" }}>I&apos;m reaching out about</legend>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          {REASONS.map((r) => (
            <button key={r.id} type="button" className={`rsn${reason === r.id ? " on" : ""}`} aria-pressed={reason === r.id} onClick={() => setReason(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="reason" value={reason} />
      </fieldset>
      <div className="grid-2" style={{ gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }}>
        <div className="field">
          <label htmlFor="f-n">Name</label>
          <input className={`input${fe.name ? " is-error" : ""}`} id="f-n" name="name" autoComplete="name" placeholder="Your name" aria-invalid={!!fe.name} aria-describedby={fe.name ? "e-n" : undefined} />
          {fe.name && <span id="e-n" className="help err">{fe.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="f-e">Email</label>
          <input className={`input${fe.email ? " is-error" : ""}`} id="f-e" name="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={!!fe.email} aria-describedby={fe.email ? "e-e" : undefined} />
          {fe.email && <span id="e-e" className="help err">{fe.email}</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-o">Company or university <span className="fg3" style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <input className="input" id="f-o" name="org" placeholder="e.g. TU Darmstadt" />
      </div>
      <div className="field">
        <label htmlFor="f-m">Message</label>
        <textarea className={`input${fe.message ? " is-error" : ""}`} id="f-m" name="message" placeholder={cur.placeholder} aria-invalid={!!fe.message} aria-describedby={fe.message ? "e-m" : undefined} />
        {fe.message && <span id="e-m" className="help err">{fe.message}</span>}
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }} />
      {state.status === "error" && !state.fieldErrors && <p className="help err" role="alert">{state.message}</p>}
      <div className="row stack-m" style={{ gap: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
        <span className="help">Sent with Resend straight to my inbox. <Link href="/privacy">How your data is handled</Link>.</span>
        <button className="btn btn-primary" type="submit" disabled={pending} aria-live="polite">
          {pending ? (<><span className="spin" aria-hidden="true" />Sending…</>) : (<>Send message <Arrow /></>)}
        </button>
      </div>
    </form>
  );
}
