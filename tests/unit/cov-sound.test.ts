import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** The sound engine against a fake Web Audio graph. Nothing real is played; nothing may ever throw. */

type Call = [string, unknown[]];
type Node = { kind: string; calls: Call[]; [k: string]: unknown };
const made: Node[] = [];

function param() {
  const calls: Call[] = [];
  return { value: 0, calls, setValueAtTime: (...a: unknown[]) => calls.push(["set", a]), exponentialRampToValueAtTime: (...a: unknown[]) => calls.push(["ramp", a]) };
}
function node(kind: string): Node {
  const n: Node = {
    kind,
    calls: [],
    connect: (to: unknown) => {
      n.calls.push(["connect", [to]]);
      return to;
    },
    start: (...a: unknown[]) => n.calls.push(["start", a]),
    stop: (...a: unknown[]) => n.calls.push(["stop", a]),
    gain: param(),
    frequency: param(),
    Q: { value: 0 },
  };
  made.push(n);
  return n;
}

type Opts = { state?: string; resumeRejects?: boolean; throwOn?: string };
let opts: Opts = {};
let instances: FakeCtx[] = [];
class FakeCtx {
  state: string;
  currentTime = 10;
  sampleRate = 8;
  destination = { kind: "destination" };
  resume = vi.fn(() => (opts.resumeRejects ? Promise.reject(new Error("blocked")) : Promise.resolve()));
  constructor() {
    if (opts.throwOn === "ctor") throw new Error("no audio");
    this.state = opts.state ?? "running";
    instances.push(this);
  }
  createGain() {
    if (opts.throwOn === "gain") throw new Error("gain");
    return node("gain");
  }
  createBuffer(_c: number, len: number) {
    const data = new Float32Array(len);
    return { getChannelData: () => data, data };
  }
  createOscillator() {
    if (opts.throwOn === "osc") throw new Error("osc");
    return node("osc");
  }
  createBufferSource() {
    return node("src");
  }
  createBiquadFilter() {
    return node("filter");
  }
}

function fakeStorage(seed: Record<string, string> = {}, throwing = false) {
  const store = { ...seed };
  return {
    store,
    getItem: (k: string) => {
      if (throwing) throw new Error("denied");
      return store[k] ?? null;
    },
    setItem: (k: string, v: string) => {
      if (throwing) throw new Error("denied");
      store[k] = v;
    },
  };
}
const ON = () => fakeStorage({ "portfolio-sound": "true" });

function setup(o: { ctx?: "std" | "webkit" | "none"; storage?: ReturnType<typeof fakeStorage>; opts?: Opts } = {}) {
  opts = o.opts ?? {};
  const events: string[] = [];
  const win: Record<string, unknown> = { dispatchEvent: (e: Event) => events.push(e.type) };
  if (o.ctx !== "none") win[o.ctx === "webkit" ? "webkitAudioContext" : "AudioContext"] = FakeCtx;
  vi.stubGlobal("window", win);
  vi.stubGlobal("localStorage", o.storage ?? fakeStorage());
  return { events, win };
}
const load = async () => (await import("~/lib/sound")).soundEngine!;
const oscs = () => made.filter((n) => n.kind === "osc");
const srcs = () => made.filter((n) => n.kind === "src");
const firstCall = (n: Node, name: string) => n.calls.find(([k]) => k === name)![1];

beforeEach(() => {
  vi.resetModules();
  made.length = 0;
  instances = [];
});
afterEach(() => vi.unstubAllGlobals());

describe("module load", () => {
  it("exports a null engine on the server (no window)", async () => {
    vi.stubGlobal("window", undefined);
    const mod = await import("~/lib/sound");
    expect(mod.soundEngine).toBeNull();
    expect(mod.SOUND_EVENT).toBe("sound:change");
  });
  it("is off by default and does not create an AudioContext until a sound plays", async () => {
    setup();
    const e = await load();
    expect(e.isEnabled()).toBe(false);
    e.play("click");
    expect(instances).toHaveLength(0);
    expect(made).toHaveLength(0);
  });
  it("restores the saved preference, and only the exact string true counts", async () => {
    setup({ storage: ON() });
    expect((await load()).isEnabled()).toBe(true);
    for (const v of ["TRUE", "1", "false", ""]) {
      vi.resetModules();
      setup({ storage: fakeStorage({ "portfolio-sound": v }) });
      expect((await load()).isEnabled()).toBe(false);
    }
  });
  it("treats unreadable storage (private mode) as off", async () => {
    setup({ storage: fakeStorage({}, true) });
    expect((await load()).isEnabled()).toBe(false);
  });
});

describe("toggle", () => {
  it("flips state, persists, plays the cue, and notifies listeners", async () => {
    const s = fakeStorage();
    const { events } = setup({ storage: s });
    const e = await load();
    expect(e.toggle()).toBe(true);
    expect(s.store["portfolio-sound"]).toBe("true");
    expect(events).toEqual(["sound:change"]);
    expect(oscs()).toHaveLength(3); // unsheathe: three ring partials
    expect(srcs()).toHaveLength(1); // plus one sweep
    expect(e.toggle()).toBe(false);
    expect(s.store["portfolio-sound"]).toBe("false");
    expect(events).toEqual(["sound:change", "sound:change"]);
  });
  it("still toggles and notifies when storage writes fail", async () => {
    const { events } = setup({ storage: fakeStorage({}, true) });
    const e = await load();
    expect(() => e.toggle()).not.toThrow();
    expect(e.isEnabled()).toBe(true);
    expect(events).toHaveLength(1);
  });
  it("still toggles and notifies when audio is unavailable", async () => {
    const { events } = setup({ ctx: "none" });
    const e = await load();
    expect(e.toggle()).toBe(true);
    expect(events).toHaveLength(1);
    expect(made).toHaveLength(0);
  });
});

describe("play", () => {
  it("is silent while off, whatever the type", async () => {
    setup();
    const e = await load();
    for (const t of ["click", "tap", "unsheathe", "sheathe", "swish-open", "swish-close"] as const) e.play(t);
    expect(made).toHaveLength(0);
  });
  it.each([
    ["click", 2, 1],
    ["tap", 1, 0],
    ["unsheathe", 3, 1],
    ["sheathe", 2, 2],
    ["swish-open", 0, 1],
    ["swish-close", 0, 1],
  ] as const)("%s builds %i oscillator(s) and %i noise source(s), all started", async (type, o, s) => {
    setup({ storage: ON() });
    const e = await load();
    e.play(type);
    expect(oscs()).toHaveLength(o);
    expect(srcs()).toHaveLength(s);
    for (const n of [...oscs(), ...srcs()]) expect(n.calls.some(([k]) => k === "start")).toBe(true);
    for (const n of oscs()) expect(n.calls.some(([k]) => k === "stop")).toBe(true);
  });
  it("routes through one master gain at 0.55 into the destination and reuses the context", async () => {
    setup({ storage: ON() });
    const e = await load();
    e.play("click");
    e.play("tap");
    expect(instances).toHaveLength(1);
    const master = made.find((n) => n.kind === "gain")!;
    expect((master.gain as { value: number }).value).toBe(0.55);
    expect(master.calls[0]).toEqual(["connect", [instances[0].destination]]);
  });
  it("fills the noise buffer with values in [-1, 1)", async () => {
    setup({ storage: ON() });
    const e = await load();
    e.play("swish-open");
    const buf = srcs()[0].buffer as { data: Float32Array };
    expect(buf.data.length).toBe(8);
    for (const v of buf.data) expect(v >= -1 && v < 1).toBe(true);
    expect(new Set(buf.data).size).toBeGreaterThan(1);
  });
  it("tap pitch is randomised within +-10% of 900 Hz", async () => {
    setup({ storage: ON() });
    const e = await load();
    for (let i = 0; i < 30; i++) e.play("tap");
    expect(oscs()).toHaveLength(30);
    for (const o of oscs()) {
      const f = firstCall(o.frequency as unknown as Node, "set")[0] as number;
      expect(f).toBeGreaterThanOrEqual(810);
      expect(f).toBeLessThanOrEqual(990);
    }
  });
  it("schedules just ahead of the context clock", async () => {
    setup({ storage: ON() });
    const e = await load();
    e.play("tap");
    expect(firstCall(oscs()[0], "start")[0]).toBeCloseTo(10.005);
  });
  it("falls back to webkitAudioContext", async () => {
    setup({ ctx: "webkit", storage: ON() });
    (await load()).play("click");
    expect(instances).toHaveLength(1);
  });
  it("resumes a suspended context (autoplay policy) and swallows a rejected resume", async () => {
    setup({ storage: ON(), opts: { state: "suspended", resumeRejects: true } });
    const e = await load();
    expect(() => e.play("click")).not.toThrow();
    await new Promise((r) => setTimeout(r, 0)); // an unhandled rejection would fail the run
    expect(instances[0].resume).toHaveBeenCalledTimes(1);
  });
  it("does not call resume on a running context", async () => {
    setup({ storage: ON() });
    (await load()).play("click");
    expect(instances[0].resume).not.toHaveBeenCalled();
  });
  it("is a silent no-op without AudioContext, and creates one on a later call once available", async () => {
    const { win } = setup({ ctx: "none", storage: ON() });
    const e = await load();
    expect(() => e.play("click")).not.toThrow();
    expect(made).toHaveLength(0);
    win.AudioContext = FakeCtx;
    e.play("click");
    expect(oscs().length).toBeGreaterThan(0);
  });
  it("never throws when the constructor throws, and recovers later", async () => {
    setup({ storage: ON(), opts: { throwOn: "ctor" } });
    const e = await load();
    expect(() => e.play("click")).not.toThrow();
    opts = {};
    e.play("click");
    expect(instances).toHaveLength(1);
  });
  it("never throws when the graph fails while building the context or synthesising", async () => {
    setup({ storage: ON(), opts: { throwOn: "gain" } });
    const e = await load();
    expect(() => e.play("click")).not.toThrow();
    vi.resetModules();
    setup({ storage: ON(), opts: { throwOn: "osc" } });
    const e2 = await load();
    for (const t of ["click", "tap", "unsheathe", "sheathe"] as const) expect(() => e2.play(t)).not.toThrow();
  });
  it("ignores an unknown sound type", async () => {
    setup({ storage: ON() });
    const e = await load();
    expect(() => e.play("bogus" as never)).not.toThrow();
    expect(oscs()).toHaveLength(0);
  });
});
