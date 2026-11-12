import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { GLOW_UP, glowUpFrame, type GlowUpCharacter } from "@/motion/glowUp"

export interface GlowUpProps {
  /** Which sticker character celebrates. */
  character?: GlowUpCharacter
  /** Width and height in px. The sticker border stays 9 px at any size. */
  size?: number
  /** Playback speed. 17 fps ≈ 6.4 s per loop; 12 fps = 9 s. */
  fps?: number
  playing?: boolean
  loop?: boolean
  /** Hold one frame (0–107) instead of playing. Useful for reviews and stills. */
  frame?: number
  /** Called when the last frame is reached. */
  onComplete?: () => void
  className?: string
  style?: CSSProperties
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

/**
 * Glow-up: the character idles, glows, shrinks into a star, bursts into light and comes back.
 * The character stays a sticker; the light effects are torn paper; it moves like stop-motion (stepped frames, no tweening).
 * With reduced motion it holds frame 0. Definition: `src/motion/glowUp.ts`, spec: `docs/MOTION-GLOW-UP.md`.
 */
export function GlowUp({
  character = "stripedPlanet",
  size = 300,
  fps = GLOW_UP.fps,
  playing = true,
  loop = true,
  frame,
  onComplete,
  className,
  style,
}: GlowUpProps) {
  const idPrefix = "gu" + useId().replace(/[^a-zA-Z0-9]/g, "")
  // Every frame is drawn once, up front; playback only swaps strings.
  const frames = useMemo(
    () => Array.from({ length: GLOW_UP.frames }, (_, i) => glowUpFrame(character, i, { size, idPrefix })),
    [character, size, idPrefix],
  )
  const [i, setI] = useState(0)
  const done = useRef(onComplete)
  useEffect(() => { done.current = onComplete }, [onComplete])
  const still = frame !== undefined || !playing || reducedMotion()

  useEffect(() => {
    if (still) return
    let raf = 0, last = performance.now(), acc = 0
    const tick = (now: number) => {
      acc += now - last
      last = now
      const step = 1000 / fps
      if (acc >= step) {
        const n = Math.floor(acc / step)
        acc -= n * step
        setI((prev) => {
          const next = prev + n
          if (next >= GLOW_UP.frames) {
            done.current?.()
            return loop ? next % GLOW_UP.frames : GLOW_UP.frames - 1
          }
          return next
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [still, fps, loop])

  const shown = frame !== undefined ? Math.max(0, Math.min(GLOW_UP.frames - 1, Math.round(frame))) : reducedMotion() ? 0 : i
  return (
    <span
      role="img"
      aria-label={`${character === "ringedPlanet" ? "Ringed" : "Striped"} planet sticker glowing up into a burst of light`}
      className={cn("inline-block shrink-0 select-none", className)}
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: frames[shown] }}
    />
  )
}
