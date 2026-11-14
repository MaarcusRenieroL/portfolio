"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { post } from "./api";

type Step = "magic" | "passkey" | "totp-setup" | "totp" | "recovery" | "dead";

/**
 * The part after the email link. Login: link -> passkey -> authenticator code. Setup: link ->
 * register passkey -> scan code -> save recovery codes. The server enforces the order; this
 * only mirrors it.
 */
export function Wizard({ kind }: { kind: "login" | "setup" }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("magic");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [totp, setTotp] = useState<{ secret: string; qr: string } | null>(null);
  const [recovery, setRecovery] = useState<string[]>([]);
  const token = useRef("");

  useEffect(() => {
    // Strict mode runs this twice in development; the second run must not overwrite the token it already read.
    const fromUrl = window.location.hash.slice(1);
    if (fromUrl) token.current = fromUrl;
    // Remove the token from the address bar and history as soon as it is read.
    history.replaceState(null, "", window.location.pathname);
    if (!token.current) setStep("dead");
  }, []);

  const dead = () => {
    setStep("dead");
    setMsg("This link did not work. It may have expired, been used, or been opened in a different browser. Start again.");
  };

  async function confirmLink() {
    setBusy(true);
    const r = await post("magic", { kind, token: token.current });
    setBusy(false);
    if (!r.ok) return dead();
    setMsg("");
    setStep("passkey");
  }

  async function passkey() {
    setBusy(true);
    setMsg("");
    try {
      const o = await post<{ options: never }>("passkey-options", { kind });
      if (!o.ok) return dead();
      const response = kind === "setup" ? await startRegistration({ optionsJSON: o.options }) : await startAuthentication({ optionsJSON: o.options });
      const v = await post("passkey-verify", { kind, response });
      if (!v.ok) return setMsg("That passkey was not accepted. Try again.");
      if (kind === "setup") {
        const t = await post<{ secret: string; qr: string }>("totp-begin");
        if (!t.ok) return dead();
        setTotp({ secret: t.secret, qr: t.qr });
        setStep("totp-setup");
      } else setStep("totp");
    } catch {
      setMsg("The passkey prompt was cancelled or failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const r = await post<{ recoveryCodes?: string[] }>("finish", { kind, code });
    setBusy(false);
    if (!r.ok) {
      setCode("");
      return setMsg("That code was not accepted.");
    }
    if (kind === "setup") {
      setRecovery(r.recoveryCodes ?? []);
      setStep("recovery");
    } else router.replace("/admin");
  }

  return (
    <div className="card">
      {step === "magic" && (
        <>
          <h2>Confirm this sign-in</h2>
          <p className="muted">Opening the link does nothing by itself, so email scanners can not use it up. Press continue to confirm.</p>
          <button onClick={confirmLink} disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
        </>
      )}
      {step === "passkey" && (
        <>
          <h2>{kind === "setup" ? "Create your passkey" : "Use your passkey"}</h2>
          <p className="muted">Your device will ask for your fingerprint, face or PIN. It is required, not optional.</p>
          <button onClick={passkey} disabled={busy}>{busy ? "Waiting for your device…" : kind === "setup" ? "Create passkey" : "Use passkey"}</button>
        </>
      )}
      {step === "totp-setup" && totp && (
        <form onSubmit={finish}>
          <h2>Add the authenticator</h2>
          <p className="muted">Scan with Google Authenticator, then type the 6-digit code to confirm.</p>
          <div className="qr" dangerouslySetInnerHTML={{ __html: totp.qr }} aria-label="Authenticator QR code" role="img" />
          <p className="muted small">No camera? Enter this key by hand: <code>{totp.secret}</code></p>
          <label>
            6-digit code
            <input inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Checking…" : "Finish setup"}</button>
        </form>
      )}
      {step === "totp" && (
        <form onSubmit={finish}>
          <h2>Authenticator code</h2>
          <label>
            6-digit code (or a recovery code)
            <input autoComplete="one-time-code" maxLength={11} required value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
        </form>
      )}
      {step === "recovery" && (
        <>
          <h2>Save your recovery codes</h2>
          <p className="muted">
            These are shown <strong>once</strong>. Each works one time if you lose your phone. Store them somewhere safe and offline.
          </p>
          <ul className="codes">{recovery.map((c) => <li key={c}><code>{c}</code></li>)}</ul>
          <button onClick={() => router.replace("/admin")}>I saved them, open the admin</button>
        </>
      )}
      {step === "dead" && (
        <>
          <h2>Start again</h2>
          <a className="btn" href={kind === "setup" ? "/admin/setup" : "/admin/login"}>Back to the start</a>
        </>
      )}
      {msg && <p className="err" role="alert">{msg}</p>}
    </div>
  );
}
