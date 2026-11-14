import type { Metadata } from "next";
import { CHANGELOG } from "~/lib/changelog";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("changelog", await langOf(params), "/changelog");
}

const fmt = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function ChangelogPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Changelog</h1>
        <p className="lead">What changed on this site, newest first.</p>
      </header>
      <ol className="tl" aria-label="Changes">
        {CHANGELOG.map((c) => (
          <li key={c.title}>
            <time className="tl-when" dateTime={c.date}>
              {fmt.format(new Date(`${c.date}T00:00:00Z`))}
            </time>
            <div className="tl-body">
              <h2 className="tl-org">{c.title}</h2>
              <ul className="points">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
