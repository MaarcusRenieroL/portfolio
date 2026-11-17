/** Cloudflare Turnstile: only enforced when TURNSTILE_SECRET is set, so local dev and tests need nothing. */
export async function humanOk(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch {
    return false;
  }
}

/** Sending mail to a visitor-typed address is only safe once a human check is in place. */
export const humanCheckEnabled = () => Boolean(process.env.TURNSTILE_SECRET);
