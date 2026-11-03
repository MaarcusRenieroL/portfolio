import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CopyLink, PostProgress, Toc } from "~/components/site/blog-client";
import { getPost, getPosts } from "~/lib/data/blog";
import { formatLongDate } from "~/lib/utils/date";

type Props = { params: Promise<{ slug: string }> };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const og = `/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.description)}`;
  return { title: post.title, description: post.description, openGraph: { title: post.title, description: post.description, type: "article", images: [og] } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const toc = [...post.content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => ({ depth: m[1].length, text: m[2].trim(), id: slugify(m[2]) }));
  const more = getPosts().filter((p) => p.slug !== slug).slice(0, 2);
  const heading = (Tag: "h2" | "h3") =>
    function H({ children }: { children?: React.ReactNode }) {
      const text = String(Array.isArray(children) ? children.join("") : children ?? "");
      return <Tag id={slugify(text)}>{children}</Tag>;
    };

  return (
    <>
      <PostProgress />
      <header className="section-sm" style={{ paddingBottom: 56 }}>
        <div className="atmos" />
        <div className="wrap-narrow stack" style={{ gap: 24, position: "relative" }}>
          <Link className="link-arrow rise" href="/blog">← All posts</Link>
          <div className="row rise" style={{ gap: 14, flexWrap: "wrap" }}>
            <span className="label">{formatLongDate(post.date)}</span>
            <span className="label">·</span>
            <span className="label">{post.readingTime}</span>
            {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <h1 className="h1 wipe">{post.title}</h1>
          <p className="lead rise" style={{ animationDelay: "200ms" }}>{post.description}</p>
        </div>
      </header>
      <div className="wrap-narrow"><div className="katana"><span className="tsuka" /><span className="tsuba" /><span className="ha" /></div></div>

      <section className="section-sm" style={{ paddingTop: 56 }}>
        <div className="wrap post-grid">
          <article className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{ h2: heading("h2"), h3: heading("h3") }}>
              {post.content.replace(/^#\s+.+\n+/, "")}
            </ReactMarkdown>
            <div className="row stack-m" style={{ gap: 12, marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
              <span className="small" style={{ flex: 1 }}>Written by Maarcus</span>
              <CopyLink />
              <Link className="btn btn-ghost btn-sm" href="/contact">Discuss</Link>
            </div>
          </article>
          <Toc items={toc} />
        </div>
      </section>

      {more.length > 0 && (
        <section className="section-sm" style={{ borderTop: "1px solid var(--line)", background: "var(--bg-1)" }}>
          <div className="wrap stack" style={{ gap: 24 }}>
            <span className="label">Keep reading</span>
            <div className="grid-2">
              {more.map((p) => (
                <Link key={p.slug} className="card stack" href={`/blog/${p.slug}`} style={{ gap: 10, color: "inherit" }} data-tilt>
                  <span className="label">{formatLongDate(p.date)}</span>
                  <span className="h3">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
