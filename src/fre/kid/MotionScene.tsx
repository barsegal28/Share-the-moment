/**
 * Plays a scene from the "Share the Moment · motion" artifact. Its scene code lives unchanged in
 * src/fre/motion-artifact/ (see that README). This file does what the artifact's embed.js does (load the font
 * and stickers, then draw sheet + scene per frame), with two differences that the prototype needs:
 * - the font and sticker images are bundled into the app as data URIs, so they load inside the claude.ai
 *   artifact frame, which won't load files that a script asks for by path;
 * - the frame shown comes from the prototype's pausable clock, so the scene pauses with the Pause button
 *   and the step's sound cues stay on their frames.
 */
import { useEffect, useRef } from "react"
import { now } from "@/lib/clock"
import { STAGE } from "../motion-artifact/src/glowup.js"
import { makePaperGrain } from "../motion-artifact/src/paint.js"
import { BACKGROUND_ASSETS, createBackground } from "../motion-artifact/src/background.js"
import { LETTERING_FONT } from "../motion-artifact/src/lettering.js"
import { createSuccess } from "../motion-artifact/src/scenes/success.js"
import { createShare, SHARE_ASSETS } from "../motion-artifact/src/scenes/share.js"
import { createShareScreen, SHARE_SCREEN_ASSETS } from "../motion-artifact/src/scenes/share-screen.js"

const IMAGE_URLS = import.meta.glob("../motion-artifact/assets/*/*.webp", { query: "?inline", import: "default", eager: true }) as Record<string, string>
const imageUrl = (name: string, dir = "share") => IMAGE_URLS[`../motion-artifact/assets/${dir}/${name}.webp`]

type Scene = ReturnType<typeof createSuccess>
type Loaded = { scenes: Record<SceneId, Scene>; drawBackground: (ctx: CanvasRenderingContext2D, cut: number) => void }

export const SCENE_FRAMES = { glowup: 108, share: 120, "share-screen-a": 68, "share-screen-b": 68 } as const
export type SceneId = keyof typeof SCENE_FRAMES

const timeout = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<T>((_, no) => setTimeout(() => no(new Error("timeout")), ms))])

let base: Promise<{ paperGrain: unknown; drawBackground: Loaded["drawBackground"] }> | null = null
/** Font + sheet: all the glow-up needs. A slow or blocked font never stops the scene (it falls back to a system font). */
function loadBase() {
  base ??= (async () => {
    // The app already ships Bagel Fat One (index.css), so the scene doesn't load its own copy; it only waits a
    // moment for it to be ready, and never holds the animation for it.
    try {
      await timeout(document.fonts.load(`100px ${LETTERING_FONT}`), 600)
    } catch {
      /* draw with whatever is ready */
    }
    const { width: W, height: H } = STAGE
    // The Figma background (sheet, specks, top bar with Noa and 18/25 · Level 2) — drawn by the scenes.
    const bg = Object.fromEntries((await Promise.all(BACKGROUND_ASSETS.map((n: string) => loadImage(n, "bg")))).filter(([, i]) => i))
    return { paperGrain: makePaperGrain(W, H), drawBackground: createBackground(W, H, bg as Record<string, HTMLImageElement>) }
  })()
  return base
}

function loadImage(name: string, dir = "share") {
  return new Promise<[string, HTMLImageElement | null]>((ok) => {
    const src = imageUrl(name, dir)
    if (!src) return ok([name, null])
    const i = new Image()
    i.onload = () => ok([name, i])
    i.onerror = () => (console.warn("Motion image failed", name), ok([name, null]))
    i.src = src
  })
}

const scenes: Partial<Record<SceneId, Promise<Scene>>> = {}
/** Load one scene. The glow-up never waits for the share scene's images. */
function loadScene(id: SceneId): Promise<Scene> {
  scenes[id] ??= (async () => {
    const { paperGrain } = await loadBase()
    if (id === "glowup") return createSuccess({ paperGrain } as never)
    const names = [...new Set([...SHARE_ASSETS, ...SHARE_SCREEN_ASSETS])]
    const images = Object.fromEntries((await Promise.all(names.map((n) => loadImage(n)))).filter(([, i]) => i))
    if (id === "share") return createShare({ images, paperGrain } as never)
    return createShareScreen({ images, paperGrain, variant: id === "share-screen-b" ? "b" : "a" } as never)
  })()
  return scenes[id]!
}

/** Warm up both scenes (the glow-up first). */
export function loadMotion() {
  return loadScene("glowup").then(() => Promise.all([loadScene("share-screen-a"), loadScene("share")]))
}

export function MotionScene({
  scene,
  run,
  fps = 17,
  endFrame,
  onStart,
  onDone,
  still,
  loop = false,
  sound = true,
}: {
  /** Loop the scene (the share screen invitation). */
  loop?: boolean
  /** Play the scene's built-in sound (share: comet engine + "mom got it" slap + heart pop). */
  sound?: boolean
  /** Show this frame and don't play (e.g. the share panel before the kid taps Share). */
  still?: number
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
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const { width: W, height: H } = STAGE
    const k = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * k
    canvas.height = H * k
    let alive = true
    let raf = 0
    let stopSfx = () => {}
    const last = Math.min(SCENE_FRAMES[scene] - 1, endFrame ?? SCENE_FRAMES[scene] - 1)
    Promise.all([loadBase(), loadScene(scene)])
      .then(([{ drawBackground }, sc]) => {
        if (!alive) return
        const draw = (f: number) => {
          // Same as the artifact's embed.js draw(): sheet, then the scene, on the 3-cut boil.
          const cut = Math.floor(f / 2) % 3
          ctx.setTransform(k, 0, 0, k, 0, 0)
          ctx.clearRect(0, 0, W, H)
          drawBackground(ctx, sc.stillBackground ? 0 : cut)
          sc.draw(ctx, k, f, cut)
        }
        if (still !== undefined) return draw(Math.min(SCENE_FRAMES[scene] - 1, still))
        draw(0)
        cb.current.onStart?.()
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.setTimeout(() => alive && cb.current.onDone?.(), 1500)
          return
        }
        const sfx = sound ? sc.sfx : undefined
        stopSfx = () => sfx?.stop()
        const t0 = now()
        let shown = 0
        const tick = () => {
          if (!alive) return
          const elapsed = Math.floor(((now() - t0) / 1000) * fps)
          const f = loop ? elapsed % SCENE_FRAMES[scene] : Math.min(last, elapsed)
          if (f !== shown) {
            // The scene's own sound, frame by frame (as the artifact's embed.js does).
            if (sfx) for (let g = shown + 1; g <= f; g++) sfx.frame(g)
            if (loop && f < shown) sfx?.stop()
            shown = f
            draw(f)
          }
          if (!loop && f >= last) {
            sfx?.stop()
            return cb.current.onDone?.()
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      })
      .catch((e) => {
        console.error("Motion scene failed to load", e)
        if (alive) cb.current.onDone?.()
      })
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      stopSfx()
    }
  }, [scene, run, fps, endFrame, still, loop, sound])

  return (
    <canvas
      ref={ref}
      style={{ width: STAGE.width, height: STAGE.height }}
      role="img"
      aria-label={scene === "glowup" ? "A planet sticker glows and bursts into paper light under the headline You did it!" : scene === "share" ? "The song crumples into a comet that flies off to Mom: Mom got it!" : "Your song travels from your planet to Mom's planet and becomes a heart"}
    />
  )
}
