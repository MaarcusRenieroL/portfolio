"use client";

import { ServerErrorView } from "~/components/site/error-views";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ServerErrorView {...props} />;
}
