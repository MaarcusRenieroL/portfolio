import { NextResponse } from "next/server";
import { record } from "~/lib/server/analytics";
import { sameOrigin } from "~/lib/server/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/** First-party event beacon: {k: kind, p: path, t: target}. Always answers 204 so it never shows up as an error. */
export async function POST(req: Request) {
  const empty = new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });
  if (!sameOrigin(await headers())) return empty;
  let body: { k?: unknown; p?: unknown; t?: unknown } = {};
  try {
    const text = await req.text();
    if (text.length > 1000) return empty;
    const parsed: unknown = JSON.parse(text);
    // null, numbers, strings and arrays are valid JSON but not an event.
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return empty;
    body = parsed as typeof body;
  } catch {
    return empty;
  }
  if (typeof body.k === "string") await record(body.k, body.p, body.t);
  return empty;
}
