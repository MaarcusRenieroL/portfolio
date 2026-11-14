import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.ADMIN_SECRET = "x".repeat(40);
});

describe("TOTP (RFC 6238)", () => {
  // RFC 6238 appendix B, secret "12345678901234567890", SHA-1.
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  it("matches the RFC test vectors", async () => {
    const { hotp, totpStep } = await import("~/lib/server/crypto");
    expect(hotp(secret, totpStep(59_000))).toBe("287082");
    expect(hotp(secret, totpStep(1_111_111_109_000))).toBe("081804");
    expect(hotp(secret, totpStep(2_000_000_000_000))).toBe("279037");
  });
  it("accepts one step of drift, refuses two, and refuses replay", async () => {
    const { hotp, totpStep, verifyTotp } = await import("~/lib/server/crypto");
    const now = 1_700_000_000_000;
    const step = totpStep(now);
    expect(verifyTotp(secret, hotp(secret, step), 0, now)).toBe(step);
    expect(verifyTotp(secret, hotp(secret, step - 1), 0, now)).toBe(step - 1);
    expect(verifyTotp(secret, hotp(secret, step + 1), 0, now)).toBe(step + 1);
    expect(verifyTotp(secret, hotp(secret, step - 2), 0, now)).toBeNull();
    expect(verifyTotp(secret, hotp(secret, step), step, now)).toBeNull();
    expect(verifyTotp(secret, "12345", 0, now)).toBeNull();
    expect(verifyTotp(secret, "abcdef", 0, now)).toBeNull();
  });
  it("base32 round-trips", async () => {
    const { base32Decode, base32Encode, newTotpSecret } = await import("~/lib/server/crypto");
    expect(base32Decode(secret).toString()).toBe("12345678901234567890");
    const s = newTotpSecret();
    expect(base32Encode(base32Decode(s))).toBe(s);
  });
});

describe("encryption and hashing", () => {
  it("round-trips, uses a fresh IV, and rejects tampering", async () => {
    const { decrypt, encrypt } = await import("~/lib/server/crypto");
    const a = encrypt("secret value");
    expect(decrypt(a)).toBe("secret value");
    expect(encrypt("secret value")).not.toBe(a);
    const [iv, tag, ct] = a.split(".");
    const ctBuf = Buffer.from(ct, "base64url");
    ctBuf[0] ^= 1;
    const flipped = ctBuf.toString("base64url");
    expect(() => decrypt([iv, tag, flipped].join("."))).toThrow();
    expect(() => decrypt("nope")).toThrow();
  });
  it("safeEqual is correct for different lengths and values", async () => {
    const { safeEqual } = await import("~/lib/server/crypto");
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
  it("visitor hash rotates daily and never contains the IP", async () => {
    const { dailyHash } = await import("~/lib/server/crypto");
    const a = dailyHash("1.2.3.4", "ua", "2026-11-14");
    expect(a).toBe(dailyHash("1.2.3.4", "ua", "2026-11-14"));
    expect(a).not.toBe(dailyHash("1.2.3.4", "ua", "2026-11-15"));
    expect(a).not.toContain("1.2.3.4");
  });
  it("recovery codes are 10 distinct xxxxx-xxxxx codes and hash case-insensitively", async () => {
    const { hashRecovery, newRecoveryCodes } = await import("~/lib/server/crypto");
    const codes = newRecoveryCodes();
    expect(new Set(codes).size).toBe(10);
    for (const c of codes) expect(c).toMatch(/^[0-9a-f]{5}-[0-9a-f]{5}$/);
    expect(hashRecovery(codes[0])).toBe(hashRecovery(` ${codes[0].toUpperCase()} `));
  });
});
