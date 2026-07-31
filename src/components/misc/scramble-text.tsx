"use client"

import { useEffect, useState } from "react"
import { useScramble } from "use-scramble"

export function ScrambleText({
  text,
  className = "",
  speed = 0.5,
  tick = 1,
  step = 1,
  scramble = 5,
  seed = 3,
}: {
  text: string
  className?: string
  speed?: number
  tick?: number
  step?: number
  scramble?: number
  seed?: number
}) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(query.matches)

    const handler = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches)
    query.addEventListener("change", handler)

    return () => query.removeEventListener("change", handler)
  }, [])

  const { ref } = useScramble({
    text,
    speed,
    tick,
    step,
    scramble,
    seed,
    overdrive: false,
  })

  // safety net: if the animation stalls (backgrounded tab, low-power mode,
  // rAF throttling) the name must still end up readable.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (ref.current && ref.current.textContent !== text) {
        ref.current.textContent = text
      }
    }, 2500)
    return () => clearTimeout(timeout)
  }, [text, ref])

  // honor reduced-motion: render the text statically instead of animating it.
  if (reducedMotion) {
    return <span className={className}>{text}</span>
  }

  return <span ref={ref} className={className} />
}
