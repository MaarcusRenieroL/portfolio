const PER_IP = { max: 3, windowMs: 10 * 60_000 };
const GLOBAL = { max: 30, windowMs: 60 * 60_000 };

const hits = new Map<string, number[]>();
let globalHits: number[] = [];

export function resetContactLimits() {
  hits.clear();
  globalHits = [];
}

export function allowContact(key: string, now = Date.now()) {
  globalHits = globalHits.filter((t) => now - t < GLOBAL.windowMs);
  const mine = (hits.get(key) ?? []).filter((t) => now - t < PER_IP.windowMs);
  if (mine.length >= PER_IP.max || globalHits.length >= GLOBAL.max) {
    hits.set(key, mine);
    return false;
  }
  mine.push(now);
  globalHits.push(now);
  hits.set(key, mine);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= PER_IP.windowMs)) hits.delete(k);
  return true;
}
