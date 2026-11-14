"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { track } from "@vercel/analytics";
import { Turnstile } from "~/components/site/turnstile";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { useDict, useLang } from "~/components/site/locale";
import { reasonsFor } from "~/lib/localize";
import { type ContactState, sendContactMessage } from "~/lib/actions/contact";
import { type ContactField, type ContactInput, type ContactOutput, contactFormSchema } from "~/lib/contact-schema";

const idle: ContactState = { status: "idle", message: "" };
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";
const FIELDS: ContactField[] = ["name", "email", "org", "message", "reason"];

export function ContactForm() {
  const lang = useLang();
  const t = useDict().contact;
  const REASONS = reasonsFor(lang);
  const tr = (m?: string) => (m ? t.errors[m] ?? m : m);
  const [sent, setSent] = useState(false);
  const [checkKey, setCheckKey] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<ContactInput, unknown, ContactOutput>({
    resolver: zodResolver(contactFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", org: "", reason: REASONS[0].id as ContactInput["reason"], message: "", website: "", token: "" },
  });

  const onToken = useCallback((t: string) => setValue("token", t), [setValue]);
  const reason = useWatch({ control, name: "reason" });
  const cur = REASONS.find((r) => r.id === reason) ?? REASONS[0];
  const invalid = FIELDS.filter((f) => errors[f]).length;

  const onSubmit: SubmitHandler<ContactOutput> = async (values) => {
    // The server re-validates with the same schema; it also owns the honeypot and the rate limit.
    const fd = new FormData();
    for (const [k, v] of Object.entries(values)) fd.set(k, v ?? "");
    let result: ContactState;
    try {
      result = await sendContactMessage(idle, fd);
    } catch {
      result = { status: "error", message: "Something went wrong. Please try again or email me directly." };
    }

    if (result.status === "success") {
      track("contact-sent", { reason: values.reason });
      reset();
      setSent(true);
      return;
    }
    // A Turnstile token works once, so show a fresh check after any failed attempt.
    setCheckKey((k) => k + 1);
    // Typed input stays put on every failure.
    const fieldErrors = Object.entries(result.fieldErrors ?? {}) as [ContactField, string][];
    fieldErrors.forEach(([field, message], i) => setError(field, { type: "server", message }, { shouldFocus: i === 0 }));
    if (!fieldErrors.length || result.fieldErrors?.reason) setError("root.server", { type: "server", message: result.message });
  };

  if (sent) {
    return (
      <div className="stack g16" role="status" aria-live="polite">
        <h2 className="h2">{t.sentH}</h2>
        <p className="muted">{t.sentP}</p>
        <button className="action" type="button" onClick={() => setSent(false)}>
          {t.another}
        </button>
      </div>
    );
  }

  const field = (name: "name" | "email" | "org" | "message", id: string) => ({
    id,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `e-${id.slice(2)}` : undefined,
    ...register(name),
  });

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
      <fieldset className="stack g16" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="legend" style={{ marginBottom: 12 }}>
          {t.legend}
        </legend>
        <div className="reasons">
          {REASONS.map((r) => (
            <button key={r.id} type="button" className="reason" aria-pressed={reason === r.id} onClick={() => setValue("reason", r.id as ContactInput["reason"])}>
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="f-n">{t.name}</label>
        <input className="input" autoComplete="name" {...field("name", "f-n")} />
        {errors.name && <span id="e-n" className="err">{tr(errors.name.message)}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-e">{t.mail}</label>
        <input className="input" type="email" autoComplete="email" placeholder="you@company.com" {...field("email", "f-e")} />
        {errors.email && <span id="e-e" className="err">{tr(errors.email.message)}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-o">{t.org}</label>
        <input className="input" {...field("org", "f-o")} />
        {errors.org && <span id="e-o" className="err">{tr(errors.org.message)}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-m">{t.message}</label>
        <textarea className="input" placeholder={cur.placeholder} {...field("message", "f-m")} />
        {errors.message && <span id="e-m" className="err">{tr(errors.message.message)}</span>}
      </div>

      {SITE_KEY && <Turnstile key={checkKey} siteKey={SITE_KEY} onToken={onToken} />}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }} {...register("website")} />
      {errors.root?.server && <p className="err" role="alert">{tr(errors.root.server.message)}</p>}

      <div className="stack g16">
        <button className="send" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spin" aria-hidden="true" />
              {t.sending}
            </>
          ) : (
            t.send
          )}
        </button>
        <span className="help">{t.help}</span>
        {/* Announces progress and validation results to screen readers. */}
        <span className="sr-only" role="status" aria-live="polite">
          {isSubmitting ? t.srSending : submitCount > 0 && invalid > 0 ? t.srFields(invalid) : ""}
        </span>
      </div>
    </form>
  );
}
