"use client";

import dynamic from "next/dynamic";

// the terminal is large and only used on demand, so keep it out of the first load
const QuakeTerminal = dynamic(
  () => import("./quake-terminal").then((m) => m.QuakeTerminal),
  { ssr: false },
);

export function LazyTerminal() {
  return <QuakeTerminal />;
}
