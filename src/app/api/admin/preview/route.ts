import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "~/lib/server/session";

export const dynamic = "force-dynamic";

/** Only same-site paths ("/projects"), never "//host" or full URLs. */
const safePath = (p: string | null) => (p && /^\/(?!\/)[\w\-./?=&%]*$/.test(p) ? p : "/");

/** Turns on Draft Mode (so the real site renders unpublished content) for the signed-in admin, then shows the page. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse(null, { status: 404 });
  const url = new URL(req.url);
  const dm = await draftMode();
  if (url.searchParams.get("exit") === "1") {
    dm.disable();
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  dm.enable();
  return NextResponse.redirect(new URL(safePath(url.searchParams.get("path")), req.url));
}
