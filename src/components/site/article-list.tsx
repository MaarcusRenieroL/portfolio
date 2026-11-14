import { BlogClient } from "~/components/site/blog-client";
import { DICT } from "~/lib/dict";
import type { Lang } from "~/lib/i18n";
import { getPostList, type ArticleKind } from "~/lib/posts";

/** The list page for Blog and Notes. */
export async function ArticleList({ kind, lang }: { kind: ArticleKind; lang: Lang }) {
  const t = DICT[lang][kind === "post" ? "blog" : "notes"];
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">{t.title}</h1>
        <p className="lead">{t.lead}</p>
      </header>
      <BlogClient posts={await getPostList(kind, lang)} kind={kind === "post" ? "blog" : "notes"} />
    </div>
  );
}
