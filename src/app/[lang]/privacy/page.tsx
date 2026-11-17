import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import { LegalPage } from "~/components/site/legal-page";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("privacy", await langOf(params), "/privacy");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <>
      <Crumb params={params} k="privacy" />
      <LegalPage kind="privacy" lang={await langOf(params)} />
    </>
  );
}
