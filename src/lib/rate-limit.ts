/**
 * In-memory sliding-window limiters. They are per server instance, which is
 * enough to stop a script hammering one instance but not a determined abuser
 * across many serverless instances; a shared store (Neon/Upstash) would be the
 * next step if that ever matters.
 */
type Rule = { max: number; windowMs: number };

function createLimiter(perKey: Rule, global: Rule) {
  const hits = new Map<string, number[]>();
  let globalHits: number[] = [];

  return {
    reset() {
      hits.clear();
      globalHits = [];
    },
    /** Returns true when the request is allowed (and counts it). */
    allow(key: string, now = Date.now()) {
      globalHits = globalHits.filter((t) => now - t < global.windowMs);
      const mine = (hits.get(key) ?? []).filter((t) => now - t < perKey.windowMs);
      if (mine.length >= perKey.max || globalHits.length >= global.max) {
        hits.set(key, mine);
        return false;
      }
      mine.push(now);
      globalHits.push(now);
      hits.set(key, mine);
      if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= perKey.windowMs)) hits.delete(k);
      return true;
    },
  };
}

const contact = createLimiter({ max: 3, windowMs: 10 * 60_000 }, { max: 30, windowMs: 60 * 60_000 });
/** Generated images are CPU work: a normal visitor or link-preview bot needs a handful. */
const og = createLimiter({ max: 20, windowMs: 60_000 }, { max: 600, windowMs: 60 * 60_000 });

export const resetContactLimits = contact.reset;
export const allowContact = contact.allow;
export const resetOgLimits = og.reset;
export const allowOg = og.allow;

/** Client address as set by the platform (Vercel sets x-vercel-forwarded-for itself; other headers are spoofable). */
export function clientKeyFrom(h: Pick<Headers, "get">) {
  return h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
