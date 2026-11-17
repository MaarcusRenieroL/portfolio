import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const ctor = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
    constructor(key: string) {
      ctor(key);
    }
  },
}));

// Never touch a real database from unit tests (vitest loads .env, which may point at one).
const db = { on: false, fail: false };
const queryMock = vi.fn(async () => {
  if (db.fail) throw new Error("db down");
  return { rows: [] };
});
vi.mock("~/lib/server/db", () => ({ hasDb: () => db.on, query: (...a: unknown[]) => queryMock(...(a as [])) }));

import { sendContactMessage, type ContactState } from "~/lib/actions/contact";
import { allowContact, resetContactLimits } from "~/lib/rate-limit";

const prev: ContactState = { status: "idle", message: "" };
const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  org: "",
  reason: "role",
  message: "Hello there, this is long enough.",
};
const fd = (o: Record<string, string> = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...valid, ...o })) f.set(k, v);
  return f;
};
const run = (o: Record<string, string> = {}) => sendContactMessage(prev, fd(o));

beforeEach(() => {
  db.on = false;
  db.fail = false;
  queryMock.mockClear();
  resetContactLimits();
  send.mockReset();
  ctor.mockReset();
  vi.stubEnv("RESEND_API_KEY", "key");
  vi.stubEnv("RESEND_EMAIL", "from@x.dev");
  vi.stubEnv("MY_EMAIL", "me@x.dev");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendContactMessage", () => {
  it("honeypot returns fake success and never sends", async () => {
    expect(await run({ website: "http://spam" })).toEqual({ status: "success", message: "sent" });
    expect(send).not.toHaveBeenCalled();
  });

  it("honeypot short-circuits before validation", async () => {
    expect((await run({ website: "x", name: "" })).status).toBe("success");
  });

  describe("validation", () => {
    it.each([
      ["name", { name: "A" }, "Please enter your name"],
      ["name", { name: "   " }, "Please enter your name"],
      ["email", { email: "nope" }, "Please enter a valid email"],
      ["email", { email: "" }, "Please enter a valid email"],
      ["message", { message: "short" }, "Message should be at least 10 characters"],
      ["message", { message: "          " }, "Message should be at least 10 characters"],
      ["message", { message: "x".repeat(5001) }, "Message is too long"],
    ])("%s: %j", async (field, o, msg) => {
      const r = await run(o);
      expect(r.status).toBe("error");
      expect(r.message).toBe("Please fix the highlighted fields.");
      expect(r.fieldErrors?.[field as "name"]).toBe(msg);
      expect(send).not.toHaveBeenCalled();
    });

    it("name over 100 chars fails with zod's default (non-friendly) message", async () => {
      const r = await run({ name: "n".repeat(101) });
      expect(r.status).toBe("error");
      expect(r.fieldErrors?.name).toBeTruthy();
      expect(r.fieldErrors?.name).not.toBe("Please enter your name");
    });

    it("email over 200 chars fails", async () => {
      const r = await run({ email: `${"a".repeat(195)}@x.com` });
      expect(r.fieldErrors?.email).toBeTruthy();
    });

    it("invalid reason yields error keyed 'reason' (a key the form never renders)", async () => {
      const r = await run({ reason: "bogus" });
      expect(r.status).toBe("error");
      expect(Object.keys(r.fieldErrors!)).toEqual(["reason"]);
    });

    it("missing reason is also keyed 'reason'", async () => {
      const f = fd();
      f.delete("reason");
      const r = await sendContactMessage(prev, f);
      expect(Object.keys(r.fieldErrors!)).toEqual(["reason"]);
    });

    it("org over 150 chars errors but 'org' is not a reported Field key", async () => {
      const r = await run({ org: "o".repeat(151) });
      expect(r.status).toBe("error");
      expect((r.fieldErrors as Record<string, string> | undefined)?.org).toBeTruthy();
    });

    it("reports all failing fields at once, first message each", async () => {
      const r = await run({ name: "", email: "x", message: "" });
      expect(Object.keys(r.fieldErrors!).sort()).toEqual(["email", "message", "name"]);
    });

    it("accepts boundary lengths (name 100, message 10 and 5000)", async () => {
      send.mockResolvedValue({ error: null });
      expect((await run({ name: "n".repeat(100) })).status).toBe("success");
      expect((await run({ message: "m".repeat(10) })).status).toBe("success");
      expect((await run({ message: "m".repeat(5000) })).status).toBe("success");
    });

    it("trims name/message before length check", async () => {
      send.mockResolvedValue({ error: null });
      expect((await run({ name: "  ab  " })).status).toBe("success");
      expect(send.mock.calls[0][0].subject).toContain("from ab");
    });

    it("unicode names are accepted", async () => {
      send.mockResolvedValue({ error: null });
      expect((await run({ name: "李雷 😀" })).status).toBe("success");
    });
  });

  describe("configuration", () => {
    it.each(["RESEND_API_KEY", "RESEND_EMAIL", "MY_EMAIL"])("missing %s", async (k) => {
      vi.stubEnv(k, "");
      const r = await run();
      expect(r).toEqual({ status: "error", message: "Email isn't configured right now. Please reach out directly." });
      expect(ctor).not.toHaveBeenCalled();
    });

    it("validation runs before the config check", async () => {
      vi.stubEnv("RESEND_API_KEY", "");
      expect((await run({ name: "" })).message).toBe("Please fix the highlighted fields.");
    });
  });

  describe("sending", () => {
    it("success payload", async () => {
      send.mockResolvedValue({ error: null });
      const r = await run({ org: "ACME", reason: "freelance" });
      expect(r).toEqual({ status: "success", message: "sent" });
      expect(ctor).toHaveBeenCalledWith("key");
      expect(send).toHaveBeenCalledWith({
        from: "from@x.dev",
        to: "me@x.dev",
        replyTo: "ada@example.com",
        subject: "[A freelance project] portfolio contact from Ada Lovelace",
        text: "Name: Ada Lovelace\nEmail: ada@example.com\nAbout: A freelance project\nOrganisation: ACME\n\nHello there, this is long enough.",
      });
    });

    it("omits Organisation line when org empty", async () => {
      send.mockResolvedValue({ error: null });
      await run();
      expect(send.mock.calls[0][0].text).not.toContain("Organisation");
    });

    it.each([
      ["role", "A full-time role"],
      ["freelance", "A freelance project"],
      ["hi", "Just saying hi"],
    ])("reason %s label", async (reason, label) => {
      send.mockResolvedValue({ error: null });
      await run({ reason });
      expect(send.mock.calls[0][0].subject.startsWith(`[${label}]`)).toBe(true);
    });

    it("Resend error object -> friendly error", async () => {
      send.mockResolvedValue({ error: { message: "boom", name: "x" } });
      expect(await run()).toEqual({ status: "error", message: "Couldn't send right now. Please try again or email me directly." });
    });

    it("thrown error -> generic error", async () => {
      send.mockRejectedValue(new Error("network"));
      expect(await run()).toEqual({ status: "error", message: "Something went wrong. Please try again or email me directly." });
    });

    it("name with CR/LF is rejected so it can never reach the subject", async () => {
      const r = await run({ name: "Eve\r\nBcc: evil@x.com" });
      expect(r.status).toBe("error");
      expect(r.fieldErrors?.name).toBeTruthy();
      expect(send).not.toHaveBeenCalled();
    });

    it("email with CR/LF is rejected by zod", async () => {
      const r = await run({ email: "a@x.com\r\nBcc: e@x.com" });
      expect(r.fieldErrors?.email).toBeTruthy();
    });

    it("message and name HTML is not escaped (text email only)", async () => {
      send.mockResolvedValue({ error: null });
      await run({ message: "<script>alert(1)</script>" });
      expect(send.mock.calls[0][0].text).toContain("<script>");
    });
  });

  it("org over 150 chars returns an org field error the form renders", async () => {
    const r = await run({ org: "x".repeat(151) });
    expect(r.fieldErrors?.org).toBeTruthy();
  });

  it("invalid reason returns a reason error (the form shows the generic message for it)", async () => {
    const r = await run({ reason: "spam" });
    expect(r.status).toBe("error");
    expect(r.fieldErrors?.reason).toBeTruthy();
    expect(r.message).toBe("Please fix the highlighted fields.");
  });

  describe("rate limiting", () => {
    it("allows 3 messages per connection, then refuses the 4th without sending", async () => {
      send.mockResolvedValue({ error: null });
      for (let i = 0; i < 3; i++) expect((await run()).status).toBe("success");
      const r = await run();
      expect(r.status).toBe("error");
      expect(r.message).toMatch(/too many/i);
      expect(send).toHaveBeenCalledTimes(3);
    });

    it("invalid submissions do not use up the allowance", async () => {
      send.mockResolvedValue({ error: null });
      for (let i = 0; i < 5; i++) await run({ message: "short" });
      expect((await run()).status).toBe("success");
    });

    it("window expires after 10 minutes and the global cap applies across clients", () => {
      const t0 = 1_000_000;
      for (let i = 0; i < 3; i++) expect(allowContact("a", t0)).toBe(true);
      expect(allowContact("a", t0)).toBe(false);
      expect(allowContact("a", t0 + 10 * 60_000 + 1)).toBe(true);
      resetContactLimits();
      for (let i = 0; i < 30; i++) expect(allowContact(`ip${i}`, t0)).toBe(true);
      expect(allowContact("fresh", t0)).toBe(false);
    });
  });
  it.todo("SUSPICION: no rate limiting; honeypot is only protection");
});

describe("spam check and auto-reply", () => {
  beforeEach(() => send.mockResolvedValue({ error: null }));

  it("without a Turnstile secret nothing extra is required", async () => {
    expect((await run()).status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("with a secret, a missing token is refused and nothing is sent", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "s");
    const r = await run();
    expect(r.status).toBe("error");
    expect(r.message).toMatch(/spam check/i);
    expect(send).not.toHaveBeenCalled();
  });

  it("with a secret, Cloudflare's verdict decides", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "s");
    const fetchMock = vi.fn().mockResolvedValueOnce({ json: async () => ({ success: false }) }).mockResolvedValueOnce({ json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    expect((await run({ token: "bad" })).status).toBe("error");
    expect(send).not.toHaveBeenCalled();
    expect((await run({ token: "good" })).status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain("challenges.cloudflare.com");
    vi.unstubAllGlobals();
  });

  it("a Cloudflare outage fails closed", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "s");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await run({ token: "x" })).status).toBe("error");
    vi.unstubAllGlobals();
  });

  it("auto-reply is off by default and sends a second email to the sender when enabled", async () => {
    await run();
    expect(send).toHaveBeenCalledTimes(1);

    send.mockClear();
    vi.stubEnv("CONTACT_AUTOREPLY", "1");
    await run({ email: "grace@example.com", name: "Grace Hopper" });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0]).toMatchObject({ to: "grace@example.com", replyTo: "me@x.dev" });
  });

  it("a failing auto-reply never fails the message", async () => {
    vi.stubEnv("CONTACT_AUTOREPLY", "1");
    send.mockResolvedValueOnce({ error: null }).mockRejectedValueOnce(new Error("boom"));
    expect((await run()).status).toBe("success");
  });
});

describe("sendContactMessage with the message store", () => {
  it("keeps a copy and still emails", async () => {
    db.on = true;
    send.mockResolvedValue({ error: null });
    expect(await run()).toEqual({ status: "success", message: "sent" });
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("insert into contact_message"), ["Ada Lovelace", "ada@example.com", null, "role", "Hello there, this is long enough."]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a stored message counts as delivered when email fails", async () => {
    db.on = true;
    send.mockResolvedValue({ error: { message: "down" } });
    expect(await run()).toEqual({ status: "success", message: "sent" });
  });

  it("a stored message counts as delivered when email isn't configured", async () => {
    db.on = true;
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await run()).toEqual({ status: "success", message: "sent" });
    expect(send).not.toHaveBeenCalled();
  });

  it("if storing fails, the email result decides", async () => {
    db.on = true;
    db.fail = true;
    send.mockResolvedValue({ error: { message: "down" } });
    expect((await run()).status).toBe("error");
  });

  it("spam (honeypot) is never stored", async () => {
    db.on = true;
    await run({ website: "http://spam" });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("refuses when the hourly database cap is reached (all senders)", async () => {
    db.on = true;
    queryMock.mockResolvedValueOnce({ rows: [{ all: 20, mine: 0 }] } as never);
    const r = await run();
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });

  it("refuses a fourth message from the same address within an hour", async () => {
    db.on = true;
    queryMock.mockResolvedValueOnce({ rows: [{ all: 4, mine: 3 }] } as never);
    expect((await run()).status).toBe("error");
  });
});
