import { BlogClient } from "~/components/site/blog-client";
import { DICT } from "~/lib/dict";
import type { Lang } from "~/lib/i18n";
import { getPostList, type ArticleKind } from "~/lib/posts";

/** The list page for Blog and Notes. */
export async function ArticleList({ kind, lang }: { kind: ArticleKind; lang: Lang }) {
  const t = DICT[lang][kind === "post" ? "blog" : "notes"];
  const posts = await getPostList(kind, lang);

  const kicker =
    kind === "post"
      ? lang === "de"
        ? "TECHNISCHE ARTIKEL · SYSTEME & CLOUD"
        : "TECHNICAL ESSAYS · SYSTEMS & CLOUD"
      : lang === "de"
        ? "ARBEITSNOTIZEN · TIL & CODE-SCHNIPSEL"
        : "WORKING NOTES · TIL & CODE SNIPPETS";

  return (
    <div className="wrap page">
      <header className="stack g24">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="blog-kicker-badge">
            <span className="blog-kicker-dot" aria-hidden="true" />
            {kicker}
          </span>
          {posts.length > 0 && (
            <span className="pill live" style={{ fontSize: 11, padding: "2px 8px" }}>
              {posts.length} {kind === "post" ? (posts.length === 1 ? "article" : "articles") : (posts.length === 1 ? "note" : "notes")}
            </span>
          )}
        </div>
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>
      <BlogClient posts={posts} kind={kind === "post" ? "blog" : "notes"} />
    </div>
  );
}
