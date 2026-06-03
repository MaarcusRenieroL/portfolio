"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

type CopyEmailButtonProps = {
  email?: string;
};

export function CopyEmailButton({
  email = "maarcusreniero.l@gmail.com",
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard?.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copyEmail}
      className="inline-flex h-10 items-center gap-2 border border-border/60 bg-background/45 px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      aria-label="copy email address"
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {copied ? "copied" : "copy email"}
    </button>
  );
}
