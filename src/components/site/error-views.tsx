"use client";

import { useEffect } from "react";
import { useLang } from "~/components/site/locale";
import { statusFor } from "~/lib/localize";
import { StatusView } from "./status-view";

export function NotFoundView() {
  return <StatusView status={statusFor(useLang(), "404")} />;
}

export function ServerErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const lang = useLang();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusView status={statusFor(lang, "500")} onRetry={reset} digest={error.digest ?? ""} />;
}
