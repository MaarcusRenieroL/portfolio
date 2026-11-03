"use client";

// Root layout failed: own <html>/<body>, inline styles only, no fonts, no JS motion.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ minHeight: "100vh", background: "#050A07", color: "#E7F1EA", fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif', display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", boxSizing: "border-box" }}>
          <main style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 24 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M7 27L27 7M19 35L35 19" stroke="#E7F1EA" strokeWidth="2.6" />
              <path d="M11 33L33 11" stroke="#C8F031" strokeWidth="2.6" />
              <path d="M8 22l4 4M12 28l4 4M20 30l4 4" stroke="#3FB950" strokeWidth="2.6" />
            </svg>
            <div style={{ height: 1, background: "linear-gradient(90deg,#3FB950,transparent)" }} />
            <span style={{ font: "12px ui-monospace,Menlo,monospace", letterSpacing: ".14em", textTransform: "uppercase", color: "#7A9483" }}>maarcus.dev · unavailable</span>
            <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.15, fontWeight: 800, letterSpacing: "-.01em" }}>The site couldn&apos;t load.</h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#A3BBAA" }}>A core part of the page failed before anything else could render. Reloading usually fixes it.</p>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => location.reload()} style={{ minHeight: 48, padding: "0 22px", background: "#C8F031", color: "#071006", border: 0, font: "600 13px ui-monospace,Menlo,monospace", letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer" }}>
                Reload
              </button>
              <a href="https://github.com/MaarcusRenieroL" style={{ fontSize: 15, color: "#3FB950", textDecoration: "none" }}>GitHub</a>
              <a href="https://linkedin.com/in/maarcus-reniero-l" style={{ fontSize: 15, color: "#3FB950", textDecoration: "none" }}>LinkedIn</a>
            </div>
            <span style={{ font: "12px ui-monospace,Menlo,monospace", color: "#7A9483" }}>Error ID {error.digest ?? "[digest]"}</span>
          </main>
        </div>
      </body>
    </html>
  );
}
