"use server";

import { Resend } from "resend";
import { z } from "zod";

const REASONS = { role: "A full-time role", freelance: "A freelance project", msc: "Master's admissions", hi: "Just saying hi" } as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  org: z.string().trim().max(150).optional(),
  reason: z.enum(["role", "freelance", "msc", "hi"]),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000, "Message is too long"),
});

type Field = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<Field, string>>;
};

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
