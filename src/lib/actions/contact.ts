"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { record } from "~/lib/server/analytics";
import { allowContact, clientKeyFrom } from "~/lib/rate-limit";
import { hasDb, query } from "~/lib/server/db";
import { humanOk } from "~/lib/server/human";
import { type ContactField, REASON_LABELS, contactSchema as schema } from "~/lib/contact-schema";

const REASONS = REASON_LABELS;
const MAX_PER_HOUR = 20;
const MAX_PER_SENDER_PER_HOUR = 3;

type Field = ContactField;

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<Field, string>>;
};

async function clientKey() {
  try {
    return clientKeyFrom(await headers());
  } catch {
    return "unknown";
  }
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // honeypot: real users never fill a hidden field
  if (formData.get("website")) return { status: "success", message: "sent" };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    org: formData.get("org") || undefined,
    reason: formData.get("reason"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<Field, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as Field;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  const ip = await clientKey();
  if (!allowContact(ip)) {
    return { status: "error", message: "Too many messages from this connection. Please try again later or email me directly." };
  }
  if (!(await humanOk(formData.get("token"), ip))) {
    return { status: "error", message: "The spam check didn't pass. Please reload the check and try again, or email me directly." };
  }

  const { name, email, org, reason, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_EMAIL;
  const to = process.env.MY_EMAIL;
  // Keep a copy first, so a message survives an email outage and shows up in the admin inbox.
  let stored = false;
  if (hasDb()) {
    // A cap that survives restarts and spans server instances (the in-memory limit doesn't), so a
    // flood can't fill the inbox or the database while the spam check is off.
    try {
      const recent = (
        await query<{ all: number; mine: number }>(
          "select count(*)::int as all, count(*) filter (where lower(email) = lower($1))::int as mine from contact_message where created_at > now() - interval '1 hour'",
          [email],
        )
      ).rows[0];
      if (recent && (recent.all >= MAX_PER_HOUR || recent.mine >= MAX_PER_SENDER_PER_HOUR)) {
        return { status: "error", message: "Too many messages right now. Please try again later or email me directly." };
      }
    } catch {
      // Can't check: fall through; the in-memory limit still applies.
    }
    try {
      await query("insert into contact_message (name, email, org, reason, message) values ($1, $2, $3, $4, $5)", [name, email, org ?? null, reason, message]);
      stored = true;
    } catch (err) {
      console.error("[contact] couldn't store message:", err);
    }
  }
  if (!apiKey || !from || !to) {
    if (stored) {
      await record("contact-sent", "/contact");
      return { status: "success", message: "sent" };
    }
    return { status: "error", message: "Email isn't configured right now. Please reach out directly." };
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `[${REASONS[reason]}] portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nAbout: ${REASONS[reason]}${org ? `\nOrganisation: ${org}` : ""}\n\n${message}`,
    });
    if (error) {
      console.error("[contact] resend error:", error);
      if (!stored) return { status: "error", message: "Couldn't send right now. Please try again or email me directly." };
    }
    // Off by default: replying to an unverified address can be abused to mail strangers. Turn on with CONTACT_AUTOREPLY=1 once Turnstile is on.
    if (process.env.CONTACT_AUTOREPLY === "1") {
      try {
        await new Resend(apiKey).emails.send({
          from,
          to: email,
          replyTo: to,
          subject: "Thanks for your message",
          text: `Hi ${name},\n\nThanks for getting in touch. I got your message and will reply personally, usually within a few days.\n\nMaarcus`,
        });
      } catch (err) {
        console.error("[contact] auto-reply failed:", err);
      }
    }
    await record("contact-sent", "/contact");
    return { status: "success", message: "sent" };
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    if (stored) return { status: "success", message: "sent" };
    return { status: "error", message: "Something went wrong. Please try again or email me directly." };
  }
}
