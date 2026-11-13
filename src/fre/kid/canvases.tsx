/**
 * Canvas pieces of the kid screens, drawn with the same code as the glow-up motion study:
 * the ink sheet (boils with the stop-motion cut) and the full-screen glow-up.
 */
import { useEffect, useRef } from "react"
import { isPaused, later, now } from "@/lib/clock"
import { buildFrames, FRAME_COUNT, STAGE } from "../glowup/glowup"
import { createBackground, drawHeadline, HEADLINE_FONT, makePaperGrain, paintLayers } from "../glowup/paint"

const { width: W, height: H } = STAGE

function useHiDpiCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = W * dpr
    c.height = H * dpr
  }, [ref, dpr])
  return dpr
}

let bgCache: ((ctx: CanvasRenderingContext2D, cut: number) => void) | null = null
const background = () => (bgCache ??= createBackground(W, H))

/** The ink sheet with riso grain and specks. Re-cuts every `1000/fps` ms like the rest of the stop-motion. */
export function InkSheetCanvas({ fps = 8.5, className }: { fps?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const dpr = useHiDpiCanvas(ref)
  useEffect(() => {
    const ctx = ref.current?.getContext("2d")
    if (!ctx) return
    let cut = 0
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      background()(ctx, cut)
    }
    draw()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || fps <= 0) return
    const id = window.setInterval(() => {
      if (isPaused()) return
      cut = (cut + 1) % 3
      draw()
    }, 1000 / fps)
    return () => clearInterval(id)
  }, [dpr, fps])
  return <canvas ref={ref} className={className} style={{ width: W, height: H }} aria-hidden />
}

let grainCache: HTMLCanvasElement | null = null

/**
 * The "You did it!" glow-up: plays frames 0 → endFrame at `fps`, then calls onDone.
 * The headline sits on top of the light, as in the motion spec.
 */
export function GlowUpCanvas({
  playing,
  fps = 17,
  endFrame = 78,
  run = 0,
  onDone,
  className,
}: {
  playing: boolean
  fps?: number
  endFrame?: number
  run?: number
  onDone?: () => void
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const dpr = useHiDpiCanvas(ref)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const ctx = ref.current?.getContext("2d")
    if (!ctx) return
    const frames = buildFrames()
    grainCache ??= makePaperGrain(W, H)
    const last = Math.max(0, Math.min(FRAME_COUNT - 1, endFrame))
    let frame = 0
    let raf = 0
    let t0 = 0
    let finished = false
    const render = (f: number) => {
      const cut = Math.floor(f / 2) % 3
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      background()(ctx, cut)
      paintLayers(ctx, dpr, frames[f], grainCache)
      drawHeadline(ctx, dpr, cut)
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const start = () => {
      render(0)
      if (!playing) return
      if (reduce) {
        later(() => done.current?.(), 2500)
        return
      }
      const tick = () => {
        const t = now()
        if (!t0) t0 = t
        const f = Math.min(last, Math.floor(((t - t0) / 1000) * fps))
        if (f !== frame) {
          frame = f
          render(f)
        }
        if (f >= last) {
          if (!finished) {
            finished = true
            done.current?.()
          }
          return
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    // The headline font must be loaded before the first frame.
    document.fonts.load(`100px ${HEADLINE_FONT}`).finally(start)
    return () => cancelAnimationFrame(raf)
  }, [dpr, playing, fps, endFrame, run])

  return <canvas ref={ref} className={className} style={{ width: W, height: H }} role="img" aria-label="A planet sticker glows, bursts into paper light and confetti, under the headline You did it!" />
}
