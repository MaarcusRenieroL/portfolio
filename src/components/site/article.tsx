import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Toc } from "~/components/site/toc";
import { SITE } from "~/lib/content";
import { getHeadings, makeIdGenerator } from "~/lib/data/blog";
import { DICT } from "~/lib/dict";
import type { Lang } from "~/lib/i18n";
import { getPostBySlug, getRelatedPosts, type ArticleKind } from "~/lib/posts";
import { jsonLdString } from "~/lib/utils";
import { formatLongDate, formatShortDate } from "~/lib/utils/date";

/** One article page for a post or a note: title, body, the "On this page" navigation on the right, related items. */
export async function Article({ kind, slug, lang }: { kind: ArticleKind; slug: string; lang: Lang }) {
  const post = await getPostBySlug(kind, slug, lang);
  if (!post) notFound();
  const t = DICT[lang][kind === "post" ? "blog" : "notes"];
  const body = post.content.replace(/^#\s+.+\n+/, "");
  const headings = getHeadings(body);
  const related = await getRelatedPosts(kind, slug, lang);

  const nextId = makeIdGenerator();
  const heading = (Tag: "h2" | "h3") =>
    function H({ children }: { children?: React.ReactNode }) {
      const text = String(Array.isArray(children) ? children.join("") : children ?? "");
      return <Tag id={nextId(text)}>{children}</Tag>;
    };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}${t.base}/${post.slug}`,
  };

  return (
    <article className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <header className="stack g24">
        <Link className="back" href={t.base}>{t.back}</Link>
        <h1 className="title col">{post.title}</h1>
        <p className="lead">{post.description}</p>
        <p className="faint small" style={{ textTransform: "capitalize" }}>
          {formatLongDate(post.date)} · {post.readingTime}
        </p>
        {post.tags.length > 0 && (
          <p className="tags">{post.tags.map((x) => <span key={x}>#{x}</span>)}</p>
        )}
      </header>

      <div className="article-grid">
        <div>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ h2: heading("h2"), h3: heading("h3") }}>
              {body}
            </ReactMarkdown>
          </div>

          {related.length > 0 && (
            <section className="related" aria-labelledby="rel-h">
              <h2 id="rel-h" className="h2">{t.related}</h2>
              <div className="leaders">
                {related.map((p) => (
                  <Link key={p.slug} className="leader" href={`${t.base}/${p.slug}`}>
                    <span className="name">{p.title}</span>
                    <span className="when">{formatShortDate(p.date)}</span>
                    <span className="desc">{p.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="help" style={{ marginTop: 40 }}>
            {t.talk} <Link className="link" href="/contact">{t.touch}</Link>.
          </p>
        </div>
        <Toc headings={headings} label={t.onThisPage} />
      </div>
    </article>
  );
}
