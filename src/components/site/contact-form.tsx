"use client";

import { useActionState, useState } from "react";
import { type ContactState, sendContactMessage } from "~/lib/actions/contact";
import { REASONS } from "~/lib/content";

const initial: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial);
  const [reason, setReason] = useState(REASONS[0].id);
  const [again, setAgain] = useState(0);
  const cur = REASONS.find((r) => r.id === reason) ?? REASONS[0];
  const fe = state.fieldErrors ?? {};

  if (state.status === "success" && again === 0) {
    return (
      <div className="stack g16" aria-live="polite">
        <h2 className="h2">Message sent.</h2>
        <p className="muted">Thanks. You&apos;ll hear back from me directly at the address you gave.</p>
        <button className="action" type="button" onClick={() => setAgain(1)}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form" action={action} key={again} noValidate>
      <fieldset className="stack g16" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="legend" style={{ marginBottom: 12 }}>
          I&apos;m reaching out about
        </legend>
        <div className="reasons">
          {REASONS.map((r) => (
            <button key={r.id} type="button" className="reason" aria-pressed={reason === r.id} onClick={() => setReason(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="reason" value={reason} />
      </fieldset>

      <div className="field">
        <label htmlFor="f-n">Name</label>
        <input className="input" id="f-n" name="name" autoComplete="name" aria-invalid={!!fe.name} aria-describedby={fe.name ? "e-n" : undefined} />
        {fe.name && <span id="e-n" className="err">{fe.name}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-e">Email</label>
        <input className="input" id="f-e" name="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={!!fe.email} aria-describedby={fe.email ? "e-e" : undefined} />
        {fe.email && <span id="e-e" className="err">{fe.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-o">Company or university (optional)</label>
        <input className="input" id="f-o" name="org" />
      </div>
      <div className="field">
        <label htmlFor="f-m">Message</label>
        <textarea className="input" id="f-m" name="message" placeholder={cur.placeholder} aria-invalid={!!fe.message} aria-describedby={fe.message ? "e-m" : undefined} />
        {fe.message && <span id="e-m" className="err">{fe.message}</span>}
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }} />
      {state.status === "error" && !state.fieldErrors && <p className="err" role="alert">{state.message}</p>}

      <div className="stack g16">
        <button className="send" type="submit" disabled={pending} aria-live="polite">
          {pending ? (
            <>
              <span className="spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
        <span className="help">
          Goes straight to my inbox and nowhere else.
        </span>
      </div>
    </form>
  );
}
