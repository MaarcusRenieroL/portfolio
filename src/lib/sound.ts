/**
 * Sword-themed UI sounds, synthesised with the Web Audio API (no audio files).
 *
 *   click        tsuba click: a short metallic tick
 *   tap          typing: a very quiet wooden tick
 *   unsheathe    sound turned on: a rising blade ring
 *   sheathe      sound turned off: a low clack
 *   swish-open   dialog/palette opens: a fast blade swish
 *   swish-close  dialog/palette closes: a shorter, lower swish
 *
 * Off by default. The choice is remembered; storage failures (private mode) are ignored.
 * Toggling fires SOUND_EVENT so every toggle UI stays in sync.
 */

export type SoundType = "click" | "tap" | "unsheathe" | "sheathe" | "swish-open" | "swish-close";
export const SOUND_EVENT = "sound:change";
const KEY = "portfolio-sound";

function readPref() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "true" : "false");
  } catch {
    /* storage blocked: the setting just won't persist */
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private on = readPref();

  private context() {
    if (this.ctx) return this.ctx;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.55;
      this.out.connect(this.ctx.destination);
      // One second of white noise, reused by every swish and transient.
      this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }

  isEnabled() {
    return this.on;
  }

  /** Flip sound on/off; plays the unsheathe/sheathe cue. Returns the new state. */
  toggle() {
    this.on = !this.on;
    writePref(this.on);
    this.cue(this.on ? "unsheathe" : "sheathe");
    window.dispatchEvent(new Event(SOUND_EVENT));
    return this.on;
  }

  play(type: SoundType) {
    if (this.on) this.cue(type);
  }

  private cue(type: SoundType) {
    const ctx = this.context();
    if (!ctx || !this.out) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const t = ctx.currentTime + 0.005;
    try {
      switch (type) {
        case "click":
          this.ring(t, [3150, 4720], 0.06, 0.09);
          this.burst(t, 6000, 0.012, 0.05);
          break;
        case "tap":
          this.ring(t, [900 * (0.9 + Math.random() * 0.2)], 0.025, 0.04);
          break;
        case "unsheathe":
          this.sweep(t, 1400, 7200, 0.32, 0.2);
          this.ring(t + 0.24, [2093, 3951, 5587], 0.9, 0.07);
          break;
        case "sheathe":
          this.sweep(t, 5000, 1200, 0.14, 0.12);
          this.ring(t + 0.13, [180, 410], 0.08, 0.16);
          this.burst(t + 0.13, 2500, 0.02, 0.08);
          break;
        case "swish-open":
          this.sweep(t, 900, 5200, 0.16, 0.16);
          break;
        case "swish-close":
          this.sweep(t, 3800, 800, 0.11, 0.11);
          break;
      }
    } catch {
      /* audio failures are never worth an error */
    }
  }

  /** Inharmonic sine partials with a fast attack and exponential decay: metal ringing. */
  private ring(t: number, freqs: number[], decay: number, level: number) {
    const ctx = this.ctx!;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level / (i + 1), t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay * (1 + i * 0.15));
      osc.connect(g).connect(this.out!);
      osc.start(t);
      osc.stop(t + decay * 1.5 + 0.05);
    });
  }

  /** Band-passed noise whose centre frequency glides: the air-cut of a blade. */
  private sweep(t: number, from: number, to: number, dur: number, level: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(from, t);
    bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.out!);
    src.start(t, Math.random() * 0.5, dur + 0.02);
  }

  /** A very short filtered noise transient: the contact click. */
  private burst(t: number, freq: number, dur: number, level: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(hp).connect(g).connect(this.out!);
    src.start(t, Math.random() * 0.5, dur + 0.01);
  }
}

/** Client-only singleton (null during server rendering). */
export const soundEngine: SoundEngine | null = typeof window !== "undefined" ? new SoundEngine() : null;
