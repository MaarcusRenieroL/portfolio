"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "~/lib/content";
import type { Action, Status } from "~/lib/status";

type Props = {
  status: Status;
  /** Overrides "Try again": error boundaries pass their reset function. */
  onRetry?: () => void;
  /** Shown under the actions, for server errors. */
  digest?: string;
};

/** A system page: animated code, a request trace that plays back, and a way out. */
export function StatusView({ status, onRetry, digest }: Props) {
  const pathname = usePathname();
  const retry = () => (onRetry ? onRetry() : window.location.reload());
  const lines = [{ text: `GET ${pathname}`, tone: "dim" as const }, ...status.trace];

  const action = (a: Action) => {
    switch (a) {
      case "retry":
        return (
          <button key={a} type="button" className="action primary" onClick={retry}>
            Try again
          </button>
        );
      case "home":
        return (
          <Link key={a} className="action" href="/">
            Back home
          </Link>
        );
      case "projects":
        return (
          <Link key={a} className="action" href="/projects">
            Projects
          </Link>
        );
      case "contact":
        return (
          <a key={a} className="action" href={`mailto:${SITE.email}`}>
            Email me
          </a>
        );
    }
  };

  const bad = status.code.startsWith("5");

  return (
    <section className="wrap page status-page" data-bad={bad ? "" : undefined}>
      <div className="status-grid">
        <div className="stack g24">
          <p className="status-code" aria-label={`Error ${status.code}`}>
            {status.code.split("").map((d, i) => (
              <span key={i} style={{ animationDelay: `${i * 90}ms` }} aria-hidden="true">
                {d}
              </span>
            ))}
          </p>
          <h1 className="title">{status.title}</h1>
          <p className="lead">{status.body}</p>
          <div className="row" style={{ gap: "8px 10px" }}>
            {status.actions.map(action)}
          </div>
          {digest !== undefined && <p className="help">Error ID {digest || "n/a"}</p>}
        </div>

        <figure className="trace" aria-label="Request trace">
          <figcaption>request trace</figcaption>
          <ol>
            {lines.map((l, i) => (
              <li key={i} data-tone={l.tone ?? "ok"} style={{ animationDelay: `${400 + i * 260}ms` }}>
                <span className="mark" aria-hidden="true">
                  {l.tone === "bad" ? "✕" : l.tone === "warn" ? "!" : l.tone === "dim" ? "$" : "✓"}
                </span>
                {l.text}
              </li>
            ))}
            <li className="caret" style={{ animationDelay: `${400 + lines.length * 260}ms` }} aria-hidden="true" />
          </ol>
        </figure>
      </div>
    </section>
  );
}
