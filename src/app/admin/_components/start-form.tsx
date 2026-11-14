"use client";

import { useState } from "react";
import { post } from "./api";

export function StartForm({ kind }: { kind: "login" | "setup" }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await post("start", { kind, email, token });
    setBusy(false);
    if (r.ok) setSent(true);
    else setErr(r.message ?? "That did not work.");
  }

  if (sent) {
    return (
      <div className="card">
        <h2>Check your inbox</h2>
        <p className="muted">
          If everything matched, a one-time link is on its way. Open it <strong>in this same browser</strong>. It expires in 10 minutes. Nothing here tells you whether the email was right, on purpose.
        </p>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{kind === "setup" ? "First-run setup" : "Sign in"}</h2>
      <label>
        Email
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {kind === "setup" && (
        <label>
          Setup token
          <input type="password" autoComplete="off" required value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <button type="submit" disabled={busy}>{busy ? "Sending…" : "Send me a link"}</button>
    </form>
  );
}
