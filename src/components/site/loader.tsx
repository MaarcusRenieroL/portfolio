/**
 * Intro loader: three-sword style.
 *
 * Three katana cross into an emblem, three blade-light slashes cut across the
 * screen, then the screen splits along the last cut and slides apart to reveal
 * the page. Original artwork, pure SVG + CSS (keyframes in globals.css), no JS,
 * rendered in the server HTML so nothing flashes beneath it. Gone in ~1.1s.
 *
 * Never blocks input (pointer-events: none). Skipped for reduced motion, print
 * and repeat visits in the same tab (INTRO_SCRIPT in layout.tsx).
 */

const WRAP = [16, 28, 40, 52, 64, 76, 88];

function Katana({ handle, wrap, className }: { handle: string; wrap: string; className: string }) {
  return (
    <svg className={`zl-katana ${className}`} viewBox="0 0 400 24" aria-hidden="true">
      {/* kashira (pommel) */}
      <rect x="0" y="6.5" width="9" height="11" rx="2.5" className="zl-metal" />
      {/* tsuka (handle) with diamond wrap */}
      <rect x="8" y="6" width="89" height="12" rx="2" fill={handle} className="zl-handle" />
      {WRAP.map((x) => (
        <path key={x} d={`M${x} 12l5-4.5 5 4.5-5 4.5z`} fill={wrap} />
      ))}
      {/* tsuba (guard) and habaki (collar) */}
      <rect x="96" y="1.5" width="7" height="21" rx="3" className="zl-guard" />
      <rect x="103" y="8" width="8" height="8" rx="1" fill="#c99a3a" />
      {/* blade with a curved tip and hamon line */}
      <path d="M111 8L330 7Q372 6 397 2.5Q381 10.5 330 15.5L111 16Z" className="zl-blade" />
      <path d="M116 13.4q8-1.6 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0 14-.6" className="zl-hamon" />
    </svg>
  );
}

export function Loader() {
  return (
    <div className="zoro-loader" aria-hidden="true">
      <div className="zl-half zl-top" />
      <div className="zl-half zl-bot" />

      <div className="zl-emblem">
        <div className="zl-swords">
          <Katana className="zl-k1" handle="#f4f4f5" wrap="rgba(0,0,0,.4)" />
          <Katana className="zl-k2" handle="#a3161a" wrap="rgba(0,0,0,.45)" />
          <Katana className="zl-k3" handle="#141414" wrap="rgba(255,255,255,.28)" />
        </div>
        <span className="zl-kanji">三刀流</span>
      </div>

      <i className="zl-slash zl-s1" />
      <i className="zl-slash zl-s2" />
      <i className="zl-slash zl-s3" />
    </div>
  );
}
