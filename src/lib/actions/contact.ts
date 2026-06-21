"use server";

import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "please enter your name").max(100),
  email: z.email("please enter a valid email").max(200),
  message: z
    .string()
    .trim()
    .min(10, "message should be at least 10 characters")
    .max(5000, "message is too long"),
});

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: FieldErrors;
};

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // honeypot: real users never fill a hidden field; bots usually do.
  if (formData.get("company")) {
    return { status: "success", message: "thanks — your message has been sent." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      status: "error",
      message: "please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const { name, email, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_EMAIL;
  const to = process.env.MY_EMAIL;

  if (!apiKey || !from || !to) {
    return {
      status: "error",
      message: "email is not configured right now. please reach out directly.",
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `portfolio contact from ${name}`,
      text: `name: ${name}\nemail: ${email}\n\n${message}`,
    });

    if (error) {
      return {
        status: "error",
        message: "could not send right now. please try again or email me directly.",
      };
    }

    return {
      status: "success",
      message: "thanks — your message is on its way. i'll get back to you soon.",
    };
  } catch {
    return {
      status: "error",
      message: "something went wrong. please try again or email me directly.",
    };
  }
}
