/**
 * Three-sword intro. Pure CSS, rendered in the server HTML so there is no flash
 * of the page beneath it. Three green cuts draw across the screen, then the
 * screen splits along the middle one and slides apart. It never blocks input
 * (pointer-events: none), removes itself, and is skipped for reduced motion and
 * for repeat visits in the same tab (see INTRO_SCRIPT in layout.tsx).
 */
export function Loader() {
  return (
    <div className="zoro" aria-hidden="true">
      <span className="zoro-half zoro-a" />
      <span className="zoro-half zoro-b" />
      <svg className="zoro-slashes" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M84 0 L0 84" style={{ "--d": "0.28s" } as React.CSSProperties} />
        <path d="M100 0 L0 100" style={{ "--d": "0.42s" } as React.CSSProperties} />
        <path d="M100 16 L16 100" style={{ "--d": "0.56s" } as React.CSSProperties} />
      </svg>
      <span className="zoro-mark">ML</span>
    </div>
  );
}
