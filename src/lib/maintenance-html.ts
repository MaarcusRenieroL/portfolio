import { MAINTENANCE } from "./status";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * The holding page, as a self-contained document. The proxy serves it with a
 * real 503 when MAINTENANCE=1, so it needs no app code, fonts or assets to work.
 */
export function maintenanceHtml(path: string, retrySeconds = 30) {
  const s = MAINTENANCE;
  const lines = [{ text: `GET ${path}`, tone: "dim" }, ...s.trace];
  const mark = (t?: string) => (t === "bad" ? "✕" : t === "warn" ? "!" : t === "dim" ? "$" : "✓");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(s.name)}</title>
<style>
:root{--bg:#0b0b0b;--fg:#ededed;--fg2:#9a9a9a;--fg3:#6b6b6b;--line:#232323;--line2:#333;--hover:#141414;--green:#4ade80;--ink:#052e16;--amber:#fbbf24;--bad:#f87171;--ease:cubic-bezier(.16,1,.3,1);color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--fg);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:880px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,22rem);gap:clamp(28px,6vw,64px);align-items:center}
.code{display:flex;margin:0 0 20px;font:600 clamp(4.5rem,15vw,8rem)/.95 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:-.04em;color:var(--bad)}
.code span{display:inline-block;animation:in 520ms var(--ease) both}
h1{margin:0 0 12px;font-size:clamp(1.5rem,4vw,2rem);line-height:1.2;letter-spacing:-.02em;font-weight:600}
p{margin:0 0 22px;color:var(--fg2);font-size:15px;max-width:34em}
button{font:inherit;font-size:12px;height:30px;padding:0 12px;border-radius:6px;border:1px solid var(--green);background:var(--green);color:var(--ink);font-weight:600;cursor:pointer;transition:opacity 160ms var(--ease)}
button:hover{opacity:.88}
.timer{margin-top:22px;max-width:16rem;font:12px ui-monospace,Menlo,monospace;color:var(--fg3)}
.bar{height:2px;margin-top:8px;border-radius:2px;background:var(--line);overflow:hidden}
.bar i{display:block;height:100%;background:var(--green);transform-origin:left;animation:drain ${retrySeconds}s linear forwards}
figure{margin:0;border:1px solid var(--line);border-radius:8px;background:var(--hover);overflow:hidden}
figcaption{padding:8px 14px;border-bottom:1px solid var(--line);font:500 11px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--fg3)}
ol{list-style:none;margin:0;padding:16px 14px 18px;display:grid;gap:8px;font:12.5px/1.4 ui-monospace,Menlo,monospace}
li{display:flex;gap:10px;color:var(--fg2);animation:line 360ms var(--ease) both}
li b{width:1ch;font-weight:400;color:var(--green)}
li.warn{color:var(--amber)}li.bad{color:var(--bad)}li.dim{color:var(--fg3)}
li.warn b,li.bad b,li.dim b{color:inherit}
@keyframes in{from{opacity:0;transform:translateY(40%)}}
@keyframes line{from{opacity:0;transform:translateX(-8px)}}
@keyframes drain{to{transform:scaleX(0)}}
@media (max-width:760px){main{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important}}
</style></head><body><main>
<div>
<p class="code" role="img" aria-label="Error ${esc(s.code)}">${s.code.split("").map((d, i) => `<span style="animation-delay:${i * 90}ms">${d}</span>`).join("")}</p>
<h1>${esc(s.title)}</h1>
<p>${esc(s.body)}</p>
<button type="button" onclick="location.reload()">Try again</button>
<div class="timer">Retrying in <span id="s">${retrySeconds}</span>s<div class="bar"><i></i></div></div>
</div>
<figure><figcaption>request trace</figcaption><ol>
${lines.map((l, i) => `<li class="${l.tone ?? "ok"}" style="animation-delay:${400 + i * 260}ms"><b>${mark(l.tone)}</b>${esc(l.text)}</li>`).join("\n")}
</ol></figure>
</main>
<script>var n=${retrySeconds},e=document.getElementById("s");setInterval(function(){n--;e.textContent=Math.max(n,0);if(n<=0)location.reload()},1000)</script>
</body></html>`;
}
