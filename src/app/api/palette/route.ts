import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { isLang } from "~/lib/i18n";
import { getPaletteItems } from "~/lib/server/palette";

/** Command palette entries for one language. Public data only; cached with the content. */
export async function GET(req: Request) {
  const lang = new URL(req.url).searchParams.get("lang") ?? "en";
  if (!isLang(lang)) return NextResponse.json([], { status: 400 });
  const items = await getPaletteItems(lang);
  // With draft mode on (the owner previewing), items include unpublished titles: never let a CDN keep those.
  const draft = (await draftMode()).isEnabled;
  return NextResponse.json(items, {
    headers: { "Cache-Control": draft ? "private, no-store" : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400", Vary: "Cookie" },
  });
}
