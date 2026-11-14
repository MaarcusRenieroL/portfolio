"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { allowContact, clientKeyFrom } from "~/lib/rate-limit";
import { type ContactField, REASON_LABELS, contactSchema as schema } from "~/lib/contact-schema";

const REASONS = REASON_LABELS;

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

/** Cloudflare Turnstile: only enforced when TURNSTILE_SECRET is set, so local dev and tests need nothing. */
async function humanOk(token: FormDataEntryValue | null, ip: string) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: token, remoteip: ip }) });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
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
  if (!apiKey || !from || !to) return { status: "error", message: "Email isn't configured right now. Please reach out directly." };

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
      return { status: "error", message: "Couldn't send right now. Please try again or email me directly." };
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
    return { status: "success", message: "sent" };
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return { status: "error", message: "Something went wrong. Please try again or email me directly." };
  }
}
