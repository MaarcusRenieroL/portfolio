import { ImageResponse } from "next/og";
import { SITE } from "~/lib/content";
import { getSiteContent } from "~/lib/site-content";
import { getPostBySlug } from "~/lib/posts";
import { DICT } from "~/lib/dict";
import { OG_PAGES, type OgPage } from "~/lib/seo";
import { allowOg, clientKeyFrom } from "~/lib/rate-limit";

const DEFAULT_SUBTITLE = "Full stack engineer · Java/Spring Boot · TypeScript/Next.js";

async function resolve(params: URLSearchParams): Promise<{ title: string; subtitle: string }> {
  const page = params.get("page");
  if (page && Object.hasOwn(OG_PAGES, page)) {
    if (params.get("lang") === "de" && Object.hasOwn(DICT.de.meta.pages, page)) {
      const [title, subtitle] = (DICT.de.meta.pages as Record<string, string[]>)[page];
      return { title, subtitle };
    }
    return OG_PAGES[page as OgPage];
  }
  const project = params.get("project");
  if (project) {
    const p = (await getSiteContent("en")).projects.find((x) => x.slug === project);
    if (p) return { title: p.name, subtitle: p.desc };
  }
  const post = params.get("post");
  if (post) {
    const p = (await getPostBySlug("post", post, "en")) ?? (await getPostBySlug("note", post, "en"));
    if (p) return { title: p.title, subtitle: p.description };
  }
  return { title: SITE.name, subtitle: DEFAULT_SUBTITLE };
}

export async function GET(request: Request) {
  if (!allowOg(clientKeyFrom(request.headers))) {
    return new Response("Too many requests", { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  }
  const { searchParams } = new URL(request.url);
  const { title, subtitle } = await resolve(searchParams);

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
