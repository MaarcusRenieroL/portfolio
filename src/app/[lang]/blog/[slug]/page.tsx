import type { Metadata } from "next";
import { Article } from "~/components/site/article";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";
import { getPostBySlug } from "~/lib/posts";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang: l } = await params;
  const lang = await langOf(Promise.resolve({ lang: l }));
  const post = await getPostBySlug("post", slug, lang);
  if (!post) return {};
  const t = DICT[lang].blog;
  const og = `/og?post=${encodeURIComponent(post.slug)}`;
  return { title: post.title, description: post.description, alternates: { canonical: `${t.base}/${post.slug}` }, openGraph: { title: post.title, description: post.description, type: "article", images: [og] } };
}

export default async function Page({ params }: Props) {
  const { slug, lang } = await params;
  return <Article kind="post" slug={slug} lang={await langOf(Promise.resolve({ lang }))} />;
}
