import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send: (...a: unknown[]) => send(...a) }; } }));
const db = { rows: [{ all: 0, mine: 0 }] as unknown[], insertFails: false };
const queryMock = vi.fn(async (sql: string) => {
  if (sql.startsWith("insert")) {
    if (db.insertFails) throw new Error("full");
    return { rows: [] };
  }
  return { rows: db.rows };
});
vi.mock("~/lib/server/db", () => ({ hasDb: () => true, query: (...a: unknown[]) => queryMock(...(a as [string])) }));
vi.mock("~/lib/server/analytics", () => ({ record: vi.fn(async () => true) }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-real-ip": "5.5.5.5" }) }));

import { sendContactMessage } from "~/lib/actions/contact";
import { resetContactLimits } from "~/lib/rate-limit";

const fd = (o: Record<string, string> = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ name: "Ada Lovelace", email: "ada@example.com", reason: "role", message: "Hello there, this is long enough.", ...o })) f.set(k, v);
  return f;
};
const run = (o: Record<string, string> = {}) => sendContactMessage({ status: "idle", message: "" }, fd(o));

beforeEach(() => {
  db.rows = [{ all: 0, mine: 0 }];
  db.insertFails = false;
  queryMock.mockClear();
  send.mockReset();
  resetContactLimits();
  vi.stubEnv("RESEND_API_KEY", "key");
  vi.stubEnv("RESEND_EMAIL", "from@x.dev");
  vi.stubEnv("MY_EMAIL", "me@x.dev");
  vi.stubEnv("TURNSTILE_SECRET", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("contact: database caps and failure paths", () => {
  it("allows exactly one below the global cap and refuses at it, storing nothing when refused", async () => {
    send.mockResolvedValue({ error: null });
    db.rows = [{ all: 19, mine: 0 }];
    expect((await run()).status).toBe("success");
    db.rows = [{ all: 20, mine: 0 }];
    queryMock.mockClear();
    const r = await run();
    expect(r.status).toBe("error");
    expect(queryMock.mock.calls.some((c) => c[0].startsWith("insert"))).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("the per-sender cap is 3 and the lookup is case-insensitive in SQL", async () => {
    send.mockResolvedValue({ error: null });
    db.rows = [{ all: 3, mine: 2 }];
    expect((await run()).status).toBe("success");
    db.rows = [{ all: 3, mine: 3 }];
    expect((await run({ email: "ADA@example.com" })).status).toBe("error");
    expect(String(queryMock.mock.calls[0][0])).toContain("lower(email) = lower($1)");
  });

  it("a missing count row does not block the message", async () => {
    send.mockResolvedValue({ error: null });
    db.rows = [];
    expect((await run()).status).toBe("success");
  });

  it("an unexpected throw while mailing still counts as delivered once the message is stored", async () => {
    send.mockRejectedValue(new Error("network"));
    expect(await run()).toEqual({ status: "success", message: "sent" });
  });

  it("an unexpected throw with nothing stored is reported as an error", async () => {
    send.mockRejectedValue(new Error("network"));
    db.insertFails = true;
    const r = await run();
    expect(r.status).toBe("error");
    expect(r.message).toMatch(/something went wrong/i);
  });

  it("reports one error per field even when a field fails several rules", async () => {
    const r = await run({ name: "\n", message: "" });
    expect(r.status).toBe("error");
    expect(Object.keys(r.fieldErrors ?? {}).sort()).toEqual(expect.arrayContaining(["message", "name"]));
    expect(typeof r.fieldErrors?.name).toBe("string");
  });
});
