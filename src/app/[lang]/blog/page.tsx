import type { Metadata } from "next";
import { ArticleList } from "~/components/site/article-list";
import { DICT } from "~/lib/dict";
import { langOf } from "~/lib/lang";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = DICT[await langOf(params)].blog;
  return { title: t.title, description: t.lead, alternates: { canonical: t.base } };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return <ArticleList kind="post" lang={await langOf(params)} />;
}
