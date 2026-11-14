import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** URL-safe random token. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

/** Constant-time string comparison that does not leak length (both sides are hashed first). */
export function safeEqual(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

function secret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SECRET must be set to at least 32 characters");
  return s;
}

const key = () => createHash("sha256").update(`enc:${secret()}`).digest();

/** AES-256-GCM. Output is iv.tag.ciphertext, all base64url. */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), ct].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(blob: string): string {
  const [iv, tag, ct] = blob.split(".").map((p) => Buffer.from(p, "base64url"));
  if (!iv || !tag || !ct) throw new Error("malformed ciphertext");
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

/** A daily-rotating hash, so "unique visitors" can be counted without storing an IP. */
export function dailyHash(ip: string, ua: string, day = new Date().toISOString().slice(0, 10)) {
  return createHmac("sha256", `visitor:${secret()}:${day}`).update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

export const ipHash = (ip: string) => createHmac("sha256", `ip:${secret()}`).update(ip).digest("hex").slice(0, 24);

/* ---------- TOTP (RFC 6238, SHA-1, 6 digits, 30 s: what Google Authenticator expects) ---------- */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error("invalid base32");
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(randomBytes(20));

export function hotp(secretB32: string, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", base32Decode(secretB32)).update(buf).digest();
  const off = h[h.length - 1] & 15;
  const code = ((h[off] & 127) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export const totpStep = (now = Date.now()) => Math.floor(now / 1000 / 30);

/**
 * Returns the matched time step, or null. Accepts one step either side for clock drift, and
 * refuses any step at or before `lastStep` so a code can never be used twice.
 */
export function verifyTotp(secretB32: string, code: string, lastStep: number, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const cur = totpStep(now);
  let hit: number | null = null;
  for (const step of [cur - 1, cur, cur + 1]) {
    // Evaluate all three so timing does not depend on which one matched.
    if (safeEqual(hotp(secretB32, step), code) && step > lastStep && hit === null) hit = step;
  }
  return hit;
}

export const totpUri = (secretB32: string, account: string, issuer: string) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

/* ---------- recovery codes ---------- */

export function newRecoveryCodes(n = 10): string[] {
  return Array.from({ length: n }, () => {
    const raw = randomBytes(8).toString("hex");
    return `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
  });
}

export const normalizeRecovery = (c: string) => c.trim().toLowerCase();
export const hashRecovery = (c: string) => sha256(`recovery:${normalizeRecovery(c)}`);
