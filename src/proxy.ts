import { NextResponse, type NextRequest } from "next/server";
import { LANGS, LANG_COOKIE, isLang, type Lang } from "~/lib/i18n";
import { maintenanceHtml } from "~/lib/maintenance-html";

/** Anything that isn't a localized page: API routes, feeds, generated images, and files with an extension. */
const NOT_A_PAGE = /^\/(api|og|_next|\.well-known)(\/|$)|\.[a-z0-9]+$/i;

/**
 * 1. Maintenance mode: set MAINTENANCE=1 and every page answers a real 503 with
 *    the holding page and a Retry-After header.
 * 2. Language: the URL never carries it. Pages are built under app/[lang], and
 *    each request is rewritten to /en/... or /de/... from the "lang" cookie
 *    (English when there is none). Visiting /de/... or /en/... directly sets
 *    the cookie and redirects to the clean URL, so old German links still work.
 */
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE === "1") {
    return new NextResponse(maintenanceHtml(request.nextUrl.pathname), {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8", "retry-after": "30", "cache-control": "no-store" },
    });
  }

  const url = request.nextUrl.clone();
  const { pathname } = url;
  if (NOT_A_PAGE.test(pathname)) return NextResponse.next();

  const direct = LANGS.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (direct) {
    url.pathname = pathname.slice(direct.length + 1) || "/";
    const res = NextResponse.redirect(url, 308);
    res.cookies.set(LANG_COOKIE, direct, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }

  const saved = request.cookies.get(LANG_COOKIE)?.value;
  const lang: Lang = saved && isLang(saved) ? saved : "en";
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|icon.svg|logos/|certificates/|projects/[^/]+/.+\\.(?:webp|png|jpe?g|svg|mp4)$).*)"],
};
