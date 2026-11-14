"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { allowContact } from "~/lib/rate-limit";
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
    const h = await headers();
    // Vercel sets x-vercel-forwarded-for itself; a client-sent cf-connecting-ip would be spoofable here.
    return h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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

  if (!allowContact(await clientKey())) {
    return { status: "error", message: "Too many messages from this connection. Please try again later or email me directly." };
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
    return { status: "success", message: "sent" };
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return { status: "error", message: "Something went wrong. Please try again or email me directly." };
  }
}
