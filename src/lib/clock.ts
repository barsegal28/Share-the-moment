/**
 * A pausable clock for the prototype: timers, animations, sound and speech all stop together on pause
 * and carry on from where they were on resume.
 */
import { useSyncExternalStore } from "react"

let paused = false
let pausedAt = 0
let offset = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Like performance.now(), but frozen while paused. */
export const now = () => (paused ? pausedAt : performance.now()) - offset
export const isPaused = () => paused

type Timer = { fn: () => void; due: number; handle: number | null }
const timers = new Map<number, Timer>()
let nextId = 1

function arm(id: number, t: Timer) {
  t.handle = window.setTimeout(() => {
    timers.delete(id)
    t.fn()
  }, Math.max(0, t.due - now()))
}

/** setTimeout that waits while paused. Returns an id for cancelLater(). */
export function later(fn: () => void, ms: number): number {
  const id = nextId++
  const t: Timer = { fn, due: now() + ms, handle: null }
  timers.set(id, t)
  if (!paused) arm(id, t)
  return id
}
export function cancelLater(id: number | undefined | null) {
  if (!id) return
  const t = timers.get(id)
  if (t?.handle) clearTimeout(t.handle)
  timers.delete(id)
}
export const sleep = (ms: number) => new Promise<void>((r) => later(r, ms))

type Hooks = { pause?: () => void; resume?: () => void }
const hooks = new Set<Hooks>()
/** Let a module (audio, speech) pause and resume with the clock. */
export function onPauseChange(h: Hooks) {
  hooks.add(h)
  return () => hooks.delete(h)
}

let held: Animation[] = []
export function setPaused(p: boolean) {
  if (p === paused) return
  if (p) {
    pausedAt = performance.now()
    paused = true
    timers.forEach((t) => {
      if (t.handle) clearTimeout(t.handle)
      t.handle = null
    })
    held = document.getAnimations().filter((a) => a.playState === "running")
    held.forEach((a) => a.pause())
    hooks.forEach((h) => h.pause?.())
  } else {
    offset += performance.now() - pausedAt
    paused = false
    timers.forEach((t, id) => arm(id, t))
    held.forEach((a) => {
      try {
        a.play()
      } catch {
        /* animation was cancelled meanwhile */
      }
    })
    held = []
    hooks.forEach((h) => h.resume?.())
  }
  emit()
}

export function usePaused() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => paused,
    () => false,
  )
}
