"use client";

import { useActionState } from "react";
import { CheckCircle2Icon, Loader2Icon, SendIcon } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { sendContactMessage, type ContactState } from "~/lib/actions/contact";

const initialState: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 border border-primary/40 bg-primary/5 p-8 text-center">
        <CheckCircle2Icon className="size-8 text-primary" />
        <p className="text-sm leading-7 text-foreground/90">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 border border-border/60 bg-card/35 p-5 sm:p-6"
    >
      <div>
        <p className="text-xs font-semibold text-primary">send a message</p>
        <h2 className="mt-2 text-2xl font-semibold">start a conversation</h2>
      </div>

      {/* honeypot: hidden from users, catches naive bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
            name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="your name"
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
            email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-xs font-medium text-muted-foreground">
          message
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="what would you like to build or talk about?"
          required
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
        {state.fieldErrors?.message && (
          <p className="text-xs text-destructive">{state.fieldErrors.message}</p>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="w-fit rounded-none"
      >
        {pending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SendIcon className="size-4" />
        )}
        {pending ? "sending..." : "send message"}
      </Button>
    </form>
  );
}
