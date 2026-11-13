/**
 * Flow runtime: plays the script step by step — sound cues, voice-over, the recording and auto-advance —
 * and hands every <Obj> its motion config.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { playRecording, recordingProgress, setRecordingVolume, speak, stopRecording, stopSpeech } from "@/lib/audio"
import { playSound } from "./sounds"
import { cancelLater, later as clockLater, setPaused, sleep } from "@/lib/clock"
import { STEP_IDS, type Script, type StepCfg, type StepId } from "./script"

export interface FlowCtx {
  script: Script
  step: StepId
  cfg: StepCfg
  /** Bumps every time a step (re)starts. */
  run: number
  /** False when coming back to a step already seen (e.g. closing the listen sheet): no enter animations. */
  animate: boolean
  edit: boolean
  /** Editor: click objects to select them instead of using them. */
  selecting: boolean
  selected: { step: StepId; obj: string } | null
  select: (step: StepId, obj: string | null) => void
  go: (id: StepId | null) => void
  next: () => void
  replay: () => void
  restart: () => void
  /** Steps call this when their own animation has finished (advance: "motion"). */
  signal: (name: "motionDone") => void
  /** Set of steps already played this session. */
  seen: (id: StepId) => boolean
  hold: boolean
  /** Call `cb` when voice line `i` of the current step starts (at once if it already has). */
  whenLine: (i: number, cb: () => void) => () => void
}

const Ctx = createContext<FlowCtx | null>(null)
export const useFlow = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error("useFlow outside <FlowProvider>")
  return c
}
export const useFlowOptional = () => useContext(Ctx)

export const stepIndex = (id: StepId) => STEP_IDS.indexOf(id)

export function FlowProvider({
  script,
  initial = "k-glow",
  started = true,
  edit = false,
  selecting = false,
  hold = false,
  selected = null,
  onSelect,
  onStep,
  children,
}: {
  script: Script
  initial?: StepId
  /** Nothing plays until the viewer taps Start (browsers need a tap before sound). */
  started?: boolean
  edit?: boolean
  selecting?: boolean
  /** Don't auto-advance (editor). */
  hold?: boolean
  selected?: { step: StepId; obj: string } | null
  onSelect?: (s: { step: StepId; obj: string } | null) => void
  onStep?: (id: StepId) => void
  children: ReactNode
}) {
  const [step, setStep] = useState<StepId>(initial)
  const [run, setRun] = useState(0)
  const [animate, setAnimate] = useState(true)
  const seenRef = useRef(new Set<StepId>())
  const motionDone = useRef<() => void>(() => {})
  // Voice lines that have started in this run, and who is waiting for them (objects synced to a line).
  const linesRef = useRef(new Set<number>())
  const lineWaiters = useRef(new Map<number, Set<() => void>>())
  const runKey = `${step}:${run}`
  const keyRef = useRef("")
  if (keyRef.current !== runKey) {
    keyRef.current = runKey
    linesRef.current = new Set()
  }
  const startLine = (i: number) => {
    linesRef.current.add(i)
    lineWaiters.current.get(i)?.forEach((cb) => cb())
    lineWaiters.current.delete(i)
  }
  const whenLine = useCallback((i: number, cb: () => void) => {
    if (linesRef.current.has(i)) {
      cb()
      return () => {}
    }
    const set = lineWaiters.current.get(i) ?? new Set()
    set.add(cb)
    lineWaiters.current.set(i, set)
    return () => set.delete(cb)
  }, [])
  const cfg = script[step]

  // Keep the editor's chosen step in sync.
  useEffect(() => setStep(initial), [initial])
  useEffect(() => onStep?.(step), [step, onStep])

  const go = useCallback((id: StepId | null) => {
    if (!id) return
    setPaused(false)
    setAnimate(!seenRef.current.has(id))
    setStep(id)
    setRun((r) => r + 1)
  }, [])
  const replay = useCallback(() => {
    setPaused(false)
    setAnimate(true)
    setRun((r) => r + 1)
  }, [])
  const restart = useCallback(() => {
    setPaused(false)
    seenRef.current.clear()
    stopRecording()
    setAnimate(true)
    setStep("k-glow")
    setRun((r) => r + 1)
  }, [])

  // ─── play the step ──────────────────────────────────────────────────────
  // Keep the latest script in a ref so editing a field doesn't restart playback; the editor replays explicitly.
  const live = useRef(script)
  live.current = script
  useEffect(() => {
    if (!started) return
    const s = live.current[step]
    let alive = true
    const timers: number[] = []
    const later = (ms: number, fn: () => void) => timers.push(clockLater(() => alive && fn(), ms))
    const advance = () => {
      if (hold || !s.next) return
      go(s.next)
    }
    seenRef.current.add(step)
    stopSpeech()

    // Recording
    const rec = s.recording
    if (rec.mode === "off") stopRecording()
    else if (rec.mode === "background" || rec.mode === "play") playRecording({ volume: rec.volume, loop: true })
    else if (rec.mode === "keep") setRecordingVolume(rec.volume)

    // Sound cues
    if (animate) for (const c of s.sounds) timers.push(playSound(c.sound, { volume: c.volume, pitch: c.pitch, delayMs: c.at }) ?? 0)

    // Voice-over: lines in order, each after its own pause.
    ;(async () => {
      for (const [i, line] of s.voice.entries()) {
        await wait(line.delay)
        if (!alive) return
        startLine(i)
        await speak(line.text, line.voice, { rate: line.rate, pitch: line.pitch, claudeVoice: line.claudeVoice })
        if (!alive) return
      }
      if (s.advance === "voice") later(s.after, advance)
    })()

    if (s.advance === "auto") later(s.after, advance)
    motionDone.current = () => {
      if (s.advance === "motion") later(s.after, advance)
    }
    return () => {
      alive = false
      timers.forEach((t) => cancelLater(t))
      motionDone.current = () => {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, run, started, hold])

  useEffect(() => () => { stopSpeech(); stopRecording() }, [])

  const value = useMemo<FlowCtx>(
    () => ({
      script,
      step,
      cfg,
      run,
      animate,
      edit,
      selecting,
      selected,
      select: (st, obj) => onSelect?.(obj ? { step: st, obj } : null),
      go: (id) => {
        stopSpeech()
        go(id)
      },
      next: () => {
        stopSpeech()
        go(cfg.next)
      },
      replay,
      restart,
      signal: (n) => n === "motionDone" && motionDone.current(),
      seen: (id) => seenRef.current.has(id),
      hold,
      whenLine,
    }),
    [script, step, cfg, run, animate, edit, selecting, selected, onSelect, go, replay, restart, hold, whenLine],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

const wait = sleep

/** 0–1 progress of the playing recording, updated every frame while `active`. */
export function useRecordingProgress(active = true) {
  const [p, setP] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      const v = recordingProgress()
      if (v !== null) setP(Math.min(1, v))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return p
}
