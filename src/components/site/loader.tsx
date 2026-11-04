"use client";

import { useEffect, useState } from "react";

/**
 * Three slashes, then the page. Plays once per browser session, never for
 * reduced motion, and can be skipped with a click.
 */
export function Loader() {
  const [show, setShow] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("loaded") === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const fade = setTimeout(() => setOut(true), 1500);
    const done = setTimeout(() => finish(), 1900);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, []);

  function finish() {
    try {
      sessionStorage.setItem("loaded", "1");
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  const skip = () => {
    setOut(true);
    setTimeout(finish, 250);
  };

  return (
    <div className="loader" data-out={out ? "" : undefined} onClick={skip} role="presentation" aria-hidden="true">
      <svg className="trails" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor">
        <path className="slash s1" d="M-4 104L104 -4" vectorEffect="non-scaling-stroke" />
        <path className="slash s2" d="M-14 104L94 -4" vectorEffect="non-scaling-stroke" />
        <path className="slash s3" d="M6 104L114 -4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flyer">
        <Swordsman />
      </div>
      <span className="loader-name">Maarcus Reniero L</span>
    </div>
  );
}

/** A leaping three-sword fighter, drawn as a few thick strokes: two blades in hand, one in the teeth. */
function Swordsman() {
  return (
    <svg viewBox="0 0 120 100" width="240" height="200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* blades */}
      <g strokeWidth="2.2" className="blades">
        <path d="M84 30L118 10" />
        <path d="M76 44L112 30" />
        <path d="M60 30L84 24" />
      </g>
      {/* head, bandana and its tail */}
      <circle cx="58" cy="28" r="7" fill="currentColor" stroke="none" />
      <path d="M51 24h14" strokeWidth="3" className="band" />
      <path d="M51 25C44 24 40 28 34 26" strokeWidth="3" className="band" />
      {/* torso and arms */}
      <path d="M54 36L38 60" strokeWidth="11" />
      <path d="M56 40L84 30M54 44L76 44" strokeWidth="5" />
      {/* legs */}
      <path d="M38 60L52 74L44 92M38 60L20 70L8 86" strokeWidth="6" />
    </svg>
  );
}
