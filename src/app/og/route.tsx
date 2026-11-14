import { ImageResponse } from "next/og";
import { CASE_STUDIES, PROJECTS, SITE } from "~/lib/content";
import { getPost } from "~/lib/data/blog";

const DEFAULT_SUBTITLE = "Full stack engineer · Java/Spring Boot · TypeScript/Next.js";

function resolve(params: URLSearchParams): { title: string; subtitle: string } {
  const project = params.get("project");
  if (project) {
    const p = PROJECTS.find((x) => x.slug === project);
    if (p) return { title: p.name, subtitle: CASE_STUDIES[p.slug]?.lead ?? p.desc };
  }
  const post = params.get("post");
  if (post) {
    const p = getPost(post);
    if (p) return { title: p.title, subtitle: p.description };
  }
  return { title: SITE.name, subtitle: DEFAULT_SUBTITLE };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { title, subtitle } = resolve(searchParams);

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, background: "#0b0b0b", color: "#ededed" }}>
        <div style={{ fontSize: 22, color: "#4ade80", fontWeight: 700, marginBottom: 24 }}>{SITE.domain}</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02 }}>{title.slice(0, 80)}</div>
        <div style={{ fontSize: 30, color: "#9a9a9a", marginTop: 24, maxWidth: 900 }}>{subtitle.slice(0, 140)}</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
