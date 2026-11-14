import { NextResponse, type NextRequest } from "next/server";
import { maintenanceHtml } from "~/lib/maintenance-html";

/**
 * Maintenance mode: set MAINTENANCE=1 and every page answers a real 503 with
 * the holding page and a Retry-After header. Unset it and nothing changes.
 */
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE !== "1") return NextResponse.next();

  return new NextResponse(maintenanceHtml(request.nextUrl.pathname), {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "retry-after": "30", "cache-control": "no-store" },
  });
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|icon.svg|logos/|projects/[^/]+/.+\\.(?:webp|png|jpe?g|svg|mp4)$).*)"],
};
