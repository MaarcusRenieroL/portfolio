"use client";

// Root layout failed: own <html>/<body>, inline styles only, no fonts, no JS motion.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#ededed", fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif', display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", boxSizing: "border-box" }}>
          <main style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
            <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-.02em" }}>The site couldn&apos;t load.</h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#9a9a9a" }}>A core part of the page failed before anything else could render. Reloading usually fixes it.</p>
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => location.reload()} style={{ minHeight: 48, padding: "0 24px", background: "#4ade80", color: "#052e16", border: 0, borderRadius: 6, font: "600 16px system-ui,sans-serif", cursor: "pointer" }}>
                Reload
              </button>
              <a href="https://github.com/MaarcusRenieroL" style={{ fontSize: 15, color: "#4ade80" }}>GitHub</a>
              <a href="https://linkedin.com/in/maarcusrenierol" style={{ fontSize: 15, color: "#4ade80" }}>LinkedIn</a>
            </div>
            <span style={{ fontSize: 13, color: "#9a9a9a" }}>Error ID {error.digest ?? "n/a"}</span>
          </main>
        </div>
      </body>
    </html>
  );
}
