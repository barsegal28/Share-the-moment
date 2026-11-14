/**
 * Plays a scene from the "Share the Moment · motion" artifact (public/motion/, copied as-is; see its README).
 * The scenes are drawn by the artifact's own embed API. This wrapper only drives which frame shows, from the
 * prototype's pausable clock, so the scene pauses with the Pause button and its sound cues stay in sync.
 */
import { useEffect, useRef } from "react"
import { now } from "@/lib/clock"

type Motion = {
  showFrame: (id: string, frame: number) => void
  stop: () => void
  destroy: () => void
}
type Embed = { createMotion: (canvas: HTMLCanvasElement, o?: { base?: string; background?: boolean }) => Promise<Motion> }

// Resolved against the page (not this module), so it works on a sub-path and inside the claude.ai artifact.
const BASE = typeof document === "undefined" ? "./motion/" : new URL(`${import.meta.env.BASE_URL}motion/`, document.baseURI).href
let embed: Promise<Embed> | null = null
/** Load the motion module (and warm its assets) once. */
export function loadMotion() {
  embed ??= import(/* @vite-ignore */ `${BASE}src/embed.js`) as Promise<Embed>
  return embed
}

export const SCENE_FRAMES = { glowup: 108, share: 128 } as const
export type SceneId = keyof typeof SCENE_FRAMES

export function MotionScene({
  scene,
  run,
  fps = 17,
  endFrame,
  onStart,
  onDone,
}: {
  scene: SceneId
  /** Changes restart the scene. */
  run: number
  fps?: number
  /** Stop here (default: the last frame). */
  endFrame?: number
  /** When the first frame is on screen: the step's sound cues start from here. */
  onStart?: () => void
  onDone?: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const cb = useRef({ onStart, onDone })
  cb.current = { onStart, onDone }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let alive = true
    let raf = 0
    let motion: Motion | null = null
    const last = Math.min(SCENE_FRAMES[scene] - 1, endFrame ?? SCENE_FRAMES[scene] - 1)
    loadMotion()
      .then((m) => m.createMotion(canvas, { base: BASE }))
      .then((mo) => {
        if (!alive) return mo.destroy()
        motion = mo
        mo.showFrame(scene, 0)
        cb.current.onStart?.()
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.setTimeout(() => alive && cb.current.onDone?.(), 1500)
          return
        }
        const t0 = now()
        let shown = 0
        const tick = () => {
          if (!alive) return
          const f = Math.min(last, Math.floor(((now() - t0) / 1000) * fps))
          if (f !== shown) {
            shown = f
            mo.showFrame(scene, f)
          }
          if (f >= last) return cb.current.onDone?.()
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      })
      .catch(() => alive && cb.current.onDone?.())
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      motion?.destroy()
    }
  }, [scene, run, fps, endFrame])

  // The embed sizes the canvas to its parent's on-screen box; the stage is already scaled, so pin it to the stage size.
  return <canvas ref={ref} className="!h-[834px] !w-[1194px]" role="img" aria-label={scene === "glowup" ? "A planet sticker glows and bursts into paper light under the headline You did it!" : "The song crumples into a comet that flies off to Mom: Mom got it!"} />
}
