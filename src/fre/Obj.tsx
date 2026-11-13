/**
 * <Obj>: one animated object on a screen. Its enter motion, idle loop and sounds come from the script,
 * so the editor can change them live. Outer box = position + enter; inner box = idle loop.
 */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { playSound } from "./sounds"
import { cancelLater } from "@/lib/clock"
import { useFlow } from "./runtime"
import type { Ease, MotionCfg, StepId } from "./script"

export const EASING: Record<Ease, string> = {
  spring: "linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1)",
  overshoot: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  out: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  linear: "linear",
  bounce: "linear(0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 13.6%, 0.25, 0.391, 0.563, 0.765, 1, 0.891 40.9%, 0.848, 0.813, 0.785, 0.766, 0.754, 0.75, 0.754, 0.766, 0.785, 0.813, 0.848, 0.891 68.2%, 1 72.7%, 0.973, 0.953, 0.941, 0.938, 0.941, 0.953, 0.973, 1, 0.988, 0.984, 0.988, 1)",
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Keyframes for an enter preset. `origin` is the vector from the object to the scatter point, in stage px. */
export function enterKeyframes(m: MotionCfg, origin: [number, number] = [0, 0]): Keyframe[] {
  const { distance: d, scaleFrom: s, rotateFrom: r } = m
  const end: Keyframe = { transform: "none", opacity: 1 }
  switch (m.enter) {
    case "pop":
      return [{ transform: `scale(${s}) rotate(${r}deg)`, opacity: 0 }, end]
    case "zoom":
      return [{ transform: `scale(${s})`, opacity: 0 }, end]
    case "fade":
      return [{ opacity: 0 }, { opacity: 1 }]
    case "slideUp":
      return [{ transform: `translateY(${d}px) rotate(${r}deg)`, opacity: 0 }, end]
    case "slideDown":
      return [{ transform: `translateY(${-d}px) rotate(${r}deg)`, opacity: 0 }, end]
    case "slideLeft":
      return [{ transform: `translateX(${d}px) rotate(${r}deg)`, opacity: 0 }, end]
    case "slideRight":
      return [{ transform: `translateX(${-d}px) rotate(${r}deg)`, opacity: 0 }, end]
    case "drop":
      return [{ transform: `translateY(${-d}px) rotate(${r}deg)`, opacity: 1 }, end]
    case "stamp":
      return [{ transform: `scale(${s}) rotate(${r}deg)`, opacity: 0 }, { transform: "scale(0.9)", opacity: 1, offset: 0.7 }, end]
    case "unfold":
      return [{ transform: `translateY(${d}px) scaleY(${s})`, opacity: 0 }, end]
    case "scatter":
      return [
        { transform: `translate(${origin[0]}px, ${origin[1]}px) scale(${s}) rotate(${r}deg)`, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        end,
      ]
    default:
      return []
  }
}

export function idleKeyframes(m: MotionCfg): Keyframe[] {
  const a = m.idleAmp
  switch (m.idle) {
    case "float":
      return [{ transform: "translateY(0)" }, { transform: `translateY(${-a}px)` }, { transform: "translateY(0)" }]
    case "bob":
      return [{ transform: "translateY(0) scale(1,1)" }, { transform: `translateY(${-a}px) scale(0.98,1.02)` }, { transform: "translateY(0) scale(1.02,0.98)", offset: 0.9 }, { transform: "translateY(0) scale(1,1)" }]
    case "wiggle":
      return [{ transform: "rotate(0)" }, { transform: `rotate(${a}deg)` }, { transform: `rotate(${-a}deg)` }, { transform: "rotate(0)" }]
    case "pulse":
      return [{ transform: "scale(1)" }, { transform: `scale(${1 + a / 100})` }, { transform: "scale(1)" }]
    case "breathe":
      return [{ transform: "scale(1,1)" }, { transform: `scale(${1 + a / 100},${1 - a / 200})` }, { transform: "scale(1,1)" }]
    case "spin":
      return [{ transform: "rotate(0)" }, { transform: `rotate(${a >= 0 ? 360 : -360}deg)` }]
    case "boil": {
      // Stop-motion: 3 cuts, a new one every third of the cycle.
      const cut = (x: number, y: number, rr: number, offset: number): Keyframe => ({ transform: `translate(${x * a}px, ${y * a}px) rotate(${rr * a}deg)`, offset, easing: "step-end" })
      return [cut(0, 0, 0, 0), cut(1.2, -1, -0.7, 1 / 3), cut(-1, 1, 0.6, 2 / 3), cut(0, 0, 0, 1)]
    }
    default:
      return []
  }
}

export function Obj({
  step,
  id,
  className,
  style,
  innerClassName,
  children,
  onTap,
  hint,
  disabled,
}: {
  step: StepId
  id: string
  className?: string
  style?: CSSProperties
  innerClassName?: string
  children?: ReactNode
  /** Makes it a button. */
  onTap?: () => void
  /** Pulse a "tap here" ring when the step is waiting for this tap. */
  hint?: boolean
  disabled?: boolean
}) {
  const flow = useFlow()
  const cfg = flow.script[step].objects[id]
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const isCurrent = flow.step === step
  const m = cfg?.motion
  const key = m ? JSON.stringify(m) : ""

  // Enter + idle
  useLayoutEffect(() => {
    const el = outer.current
    const inEl = inner.current
    if (!el || !inEl || !m || !cfg) return
    const anims: Animation[] = []
    const animating = isCurrent && flow.animate && m.enter !== "none" && !reduced()
    if (animating) {
      let origin: [number, number] = [0, 0]
      if (m.enter === "scatter") {
        const stage = el.closest<HTMLElement>("[data-fre-stage]")
        const p = flow.script[step].params
        if (stage) {
          const sr = stage.getBoundingClientRect()
          const k = sr.width / Number(stage.dataset.w || sr.width)
          const r = el.getBoundingClientRect()
          const cx = (r.left + r.width / 2 - sr.left) / k
          const cy = (r.top + r.height / 2 - sr.top) / k
          origin = [(p.originX ?? 597) - cx, (p.originY ?? 417) - cy]
        }
      }
      anims.push(el.animate(enterKeyframes(m, origin), { duration: Math.max(1, m.duration), delay: m.delay, easing: EASING[m.ease], fill: "backwards" }))
      if (cfg.enterSound !== "none") {
        const t = playSound(cfg.enterSound, { volume: cfg.enterVolume, pitch: cfg.enterPitch, delayMs: m.delay + Math.min(120, m.duration * 0.25) })
        if (t) anims.push({ cancel: () => cancelLater(t) } as unknown as Animation)
      }
    }
    if (m.idle !== "none" && !reduced()) {
      anims.push(
        inEl.animate(idleKeyframes(m), {
          duration: Math.max(200, m.idleSpeed * 1000),
          delay: animating ? m.delay + m.duration : 0,
          iterations: Infinity,
          easing: m.idle === "spin" ? "linear" : m.idle === "boil" ? "linear" : "ease-in-out",
        }),
      )
    }
    return () => anims.forEach((a) => a.cancel())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.run, isCurrent, key, cfg?.enterSound, cfg?.enterVolume, cfg?.enterPitch])

  const isSelected = flow.edit && flow.selected?.step === step && flow.selected.obj === id
  const selectable = flow.edit && flow.selecting
  const waiting = hint && isCurrent && flow.cfg.advance === "tap" && !flow.edit
  const interactive = !!onTap || selectable

  const handle = (e: React.MouseEvent) => {
    if (selectable) {
      e.stopPropagation()
      flow.select(step, id)
      return
    }
    if (!onTap || disabled) return
    e.stopPropagation()
    if (cfg?.tapSound) playSound(cfg.tapSound, { volume: 0.8 })
    onTap()
  }

  return (
    <div
      ref={outer}
      data-obj={id}
      className={cn(className, interactive && "cursor-pointer", isSelected && "fre-selected", selectable && "fre-selectable")}
      style={style}
      onClick={interactive ? handle : undefined}
      role={onTap && !selectable ? "button" : undefined}
      tabIndex={onTap && !selectable ? 0 : undefined}
      onKeyDown={onTap && !selectable ? (e) => (e.key === "Enter" || e.key === " ") && handle(e as unknown as React.MouseEvent) : undefined}
    >
      <div ref={inner} className={cn("h-full w-full", innerClassName, waiting && "fre-hint")}>
        {children}
      </div>
    </div>
  )
}
