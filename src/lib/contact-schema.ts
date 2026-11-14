import { z } from "zod";

/**
 * The one contact schema. The form validates with it in the browser for
 * instant feedback, and the server action validates with it again because the
 * browser can never be trusted.
 */
export const REASON_LABELS = { role: "A full-time role", freelance: "A freelance project", hi: "Just saying hi" } as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100).regex(/^[^\r\n]*$/, "Please enter a single-line name"),
  email: z.email("Please enter a valid email").max(200),
  org: z.string().trim().max(150, "Keep this under 150 characters").optional(),
  reason: z.enum(["role", "freelance", "hi"]),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000, "Message is too long"),
});

/** The browser form also carries the honeypot (checked first by the server) and the optional Turnstile token. */
export const contactFormSchema = contactSchema.extend({ website: z.string().optional(), token: z.string().optional() });

export type ContactField = "name" | "email" | "org" | "reason" | "message";
export type ContactInput = z.input<typeof contactFormSchema>;
export type ContactOutput = z.output<typeof contactFormSchema>;
