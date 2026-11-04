"use client";

import { useEffect } from "react";
import { NOT_FOUND, SERVER_ERROR } from "~/lib/status";
import { StatusView } from "./status-view";

export function NotFoundView() {
  return <StatusView status={NOT_FOUND} />;
}

export function ServerErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <StatusView status={SERVER_ERROR} onRetry={reset} digest={error.digest ?? ""} />;
}
