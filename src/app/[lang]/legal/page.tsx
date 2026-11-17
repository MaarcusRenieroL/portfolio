import type { Metadata } from "next";
import { Crumb } from "~/components/site/json-ld";
import { LegalPage } from "~/components/site/legal-page";
import { langOf } from "~/lib/lang";
import { pageMeta } from "~/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta("legal", await langOf(params), "/legal");
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <>
      <Crumb params={params} k="legal" />
      <LegalPage kind="legal" lang={await langOf(params)} />
    </>
  );
}
