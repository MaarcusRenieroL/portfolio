import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { SITE } from "~/lib/content";
import { jsonLdString } from "~/lib/utils";
import { Toc } from "~/components/site/toc";
import { getHeadings, getPost, getPosts, getRelated, makeIdGenerator } from "~/lib/data/blog";
import { formatLongDate, formatShortDate } from "~/lib/utils/date";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const og = `/og?post=${encodeURIComponent(post.slug)}`;
  return { title: post.title, description: post.description, openGraph: { title: post.title, description: post.description, type: "article", images: [og] } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const body = post.content.replace(/^#\s+.+\n+/, "");
  const headings = getHeadings(body);
  const related = getRelated(slug);

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
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <article className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <header className="stack g24">
        <Link className="back" href="/blog">
          ← Writing
        </Link>
        <h1 className="title col">{post.title}</h1>
        <p className="lead">{post.description}</p>
        <p className="faint small" style={{ textTransform: "capitalize" }}>
          {formatLongDate(post.date)} · {post.readingTime}
        </p>
        {post.tags.length > 0 && (
          <p className="tags">
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
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
              <h2 id="rel-h" className="h2">Related posts</h2>
              <div className="leaders">
                {related.map((p) => (
                  <Link key={p.slug} className="leader" href={`/blog/${p.slug}`}>
                    <span className="name">{p.title}</span>
                    <span className="when">{formatShortDate(p.date)}</span>
                    <span className="desc">{p.description}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="help" style={{ marginTop: 40 }}>
            Want to talk about this? <Link className="link" href="/contact">Get in touch</Link>.
          </p>
        </div>
        <Toc headings={headings} />
      </div>
    </article>
  );
}
