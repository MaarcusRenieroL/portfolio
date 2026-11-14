import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { clientKeyFrom } from "~/lib/rate-limit";
import {
  ATTEMPT_COOKIE,
  SESSION_COOKIE,
  STAGE_TTL_MS,
  SESSION_ABSOLUTE_MS,
  consumeMagic,
  cookieOptions,
  finishLogin,
  finishSetup,
  passkeyLoginOptions,
  passkeyLoginVerify,
  revokeSession,
  sameOrigin,
  setupPasskeyOptions,
  setupPasskeyVerify,
  setupTotpBegin,
  startLogin,
  startSetup,
  throttled,
} from "~/lib/server/auth";
import { hasDb } from "~/lib/server/db";

export const dynamic = "force-dynamic";

const NO_STORE = { "cache-control": "no-store" };
const fail = (status = 401) => NextResponse.json({ ok: false, message: "That did not work. Start again." }, { status, headers: NO_STORE });
const ok = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra }, { headers: NO_STORE });

type Body = Record<string, unknown>;
const str = (v: unknown, max = 4000) => (typeof v === "string" && v.length <= max ? v : "");

export async function POST(req: Request, { params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const h = await headers();
  if (!sameOrigin(h)) return fail(403);
  if (!hasDb()) return fail(503);

  const ip = clientKeyFrom(h);
  const ua = h.get("user-agent") ?? "";
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }
  const jar = await cookies();
  const attempt = jar.get(ATTEMPT_COOKIE())?.value;
  const kind = body.kind === "setup" ? "setup" : "login";

  try {
    if (await throttled(ip)) return fail(429);

    switch (step) {
      case "start": {
        const email = str(body.email, 320);
        const r = kind === "setup" ? await startSetup(email, str(body.token, 200), ip) : await startLogin(email, ip);
        jar.set(ATTEMPT_COOKIE(), r.cookie, cookieOptions(STAGE_TTL_MS / 1000));
        // Same answer whether or not anything matched.
        return ok({ message: "If everything matched, a link is on its way. Open it in this browser." });
      }
      case "magic":
        return (await consumeMagic(attempt, str(body.token, 200), kind, ip)) ? ok() : fail();
      case "passkey-options": {
        const o = kind === "setup" ? await setupPasskeyOptions(attempt, ip) : await passkeyLoginOptions(attempt, ip);
        return o ? ok({ options: o }) : fail();
      }
      case "passkey-verify": {
        const response = body.response as never;
        if (!response) return fail(400);
        const good = kind === "setup" ? await setupPasskeyVerify(attempt, response, ip) : await passkeyLoginVerify(attempt, response, ip);
        return good ? ok() : fail();
      }
      case "totp-begin": {
        const t = await setupTotpBegin(attempt, ip);
        return t ? ok(t) : fail();
      }
      case "finish": {
        const code = str(body.code, 40);
        if (kind === "setup") {
          const r = await finishSetup(attempt, code, ip, ua);
          if (!r) return fail();
          jar.set(SESSION_COOKIE(), r.session, cookieOptions(SESSION_ABSOLUTE_MS / 1000));
          jar.delete(ATTEMPT_COOKIE());
          return ok({ recoveryCodes: r.recoveryCodes });
        }
        const session = await finishLogin(attempt, code, ip, ua);
        if (!session) return fail();
        jar.set(SESSION_COOKIE(), session, cookieOptions(SESSION_ABSOLUTE_MS / 1000));
        jar.delete(ATTEMPT_COOKIE());
        return ok();
      }
      case "logout": {
        await revokeSession(jar.get(SESSION_COOKIE())?.value);
        jar.delete(SESSION_COOKIE());
        return ok();
      }
      default:
        return fail(404);
    }
  } catch (e) {
    console.error("[admin auth]", step, e);
    return fail(500);
  }
}
