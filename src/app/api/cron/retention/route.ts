import { NextResponse } from "next/server";
import { hasDb } from "~/lib/server/db";
import { pruneOldData } from "~/lib/server/retention";

/**
 * Daily retention job (vercel.json → crons). Vercel calls it with "Authorization: Bearer $CRON_SECRET";
 * anything else is refused, so the public can't trigger database work.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  if (!hasDb()) return NextResponse.json({ ok: false, reason: "no database" }, { status: 503 });
  const ok = await pruneOldData(Date.now(), true);
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
