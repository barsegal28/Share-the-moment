/**
 * Prototype audio: tap feedback, cues, the kid's "recording" and voice-over.
 *
 * Everything is synthesised in the browser so the prototype needs no audio files:
 * - tap / pop / chime / whoosh: short Web Audio tones (every tap gets sound — design rule)
 * - the recording: a short original tune played on a soft piano-ish synth (a stand-in for the kid's take;
 *   the song title shown in the UI comes from DEMO_SONG in config.ts)
 * - voice-over: the Web Speech API, with every line also published as a caption (text is a backup, never the only cue)
 */
import { useSyncExternalStore } from "react"

let ctx: AudioContext | null = null
let muted = false

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

/** Call from a user gesture (the "tap to start" curtain) so browsers allow sound. */
export function unlockAudio() {
  ac()
  if ("speechSynthesis" in window) {
    // A silent utterance unlocks speech on iOS Safari.
    const u = new SpeechSynthesisUtterance("")
    u.volume = 0
    window.speechSynthesis.speak(u)
  }
}

export function setMuted(m: boolean) {
  muted = m
  if (m) stopAll()
}

function tone(freq: number, start: number, dur: number, gain = 0.15, type: OscillatorType = "triangle", dest?: AudioNode) {
  const c = ac()
  if (!c || muted) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(dest ?? c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.05)
}

export const sfx = {
  tap: () => tone(660, 0, 0.12, 0.12, "sine"),
  pop: () => { tone(520, 0, 0.1, 0.14, "sine"); tone(880, 0.05, 0.14, 0.1, "sine") },
  star: (i = 0) => { const base = [523, 659, 784][i % 3]; tone(base, 0, 0.35, 0.16); tone(base * 2, 0.06, 0.3, 0.06, "sine") },
  chime: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.6, 0.1, "sine")),
  whoosh: () => { [300, 420, 600, 860].forEach((f, i) => tone(f, i * 0.05, 0.18, 0.06, "sawtooth")) },
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.5, 0.14)),
  gentle: () => { tone(440, 0, 0.3, 0.08, "sine"); tone(554, 0.12, 0.4, 0.08, "sine") },
}

// ─── The kid's recording ──────────────────────────────────────────────────────
// An original 8-bar demo tune in C major. [midi, beats]
const MELODY: [number, number][] = [
  [64, 1], [67, 1], [69, 1], [67, 1], [64, 1], [62, 1], [60, 2],
  [62, 1], [64, 1], [67, 1], [64, 1], [62, 2], [60, 1], [62, 1],
  [64, 1], [67, 1], [69, 1], [72, 1], [71, 1], [69, 1], [67, 2],
  [69, 1], [67, 1], [64, 1], [62, 1], [60, 4],
]
const BASS: Record<number, number> = { 0: 48, 7: 43, 14: 53, 22: 45, 26: 48 }
const BEAT = 0.42
export const RECORDING_SECONDS = MELODY.reduce((s, [, b]) => s + b, 0) * BEAT

let recording: { stop: () => void; startedAt: number; volume: number } | null = null

/** Play the recording. volume 1 = listening, ~0.18 = "very quietly in the background". */
export function playRecording({ volume = 1, loop = false, onEnd }: { volume?: number; loop?: boolean; onEnd?: () => void } = {}) {
  stopRecording()
  const c = ac()
  if (!c || muted) return
  const master = c.createGain()
  master.gain.value = volume
  master.connect(c.destination)
  let t = 0.05
  const timers: number[] = []
  const schedule = () => {
    MELODY.forEach(([n, beats], i) => {
      const f = 440 * 2 ** ((n - 69) / 12)
      tone(f, t, beats * BEAT * 1.6, 0.18, "triangle", master)
      tone(f * 2, t, beats * BEAT * 0.6, 0.03, "sine", master)
      if (BASS[i]) tone(440 * 2 ** ((BASS[i] - 69) / 12), t, BEAT * 3, 0.07, "sine", master)
      t += beats * BEAT
    })
  }
  schedule()
  const total = RECORDING_SECONDS * 1000
  if (loop) {
    timers.push(window.setInterval(() => { t = 0.05; schedule() }, total + 600))
  } else {
    timers.push(window.setTimeout(() => { recording = null; emitRec(); onEnd?.() }, total + 200))
  }
  recording = {
    startedAt: performance.now(),
    volume,
    stop: () => {
      timers.forEach((id) => { clearTimeout(id); clearInterval(id) })
      master.gain.setTargetAtTime(0, c.currentTime, 0.05)
      window.setTimeout(() => master.disconnect(), 300)
    },
  }
  emitRec()
}
export function stopRecording() {
  recording?.stop()
  recording = null
  emitRec()
}
const recListeners = new Set<() => void>()
function emitRec() { recListeners.forEach((l) => l()) }
export function useRecordingPlaying() {
  return useSyncExternalStore(
    (l) => { recListeners.add(l); return () => recListeners.delete(l) },
    () => recording !== null && recording.volume > 0.5,
    () => false,
  )
}

// ─── Voice-over ───────────────────────────────────────────────────────────────
export type Voice = "guide" | "mom" | "dad" | "grandma"
type Caption = { text: string; voice: Voice } | null
let caption: Caption = null
const capListeners = new Set<() => void>()
function setCaption(c: Caption) { caption = c; capListeners.forEach((l) => l()) }
export function useCaption() {
  return useSyncExternalStore(
    (l) => { capListeners.add(l); return () => capListeners.delete(l) },
    () => caption,
    () => null,
  )
}

/** Speak a line and show it as a caption. Resolves when done (or after a reading-time fallback). */
export function speak(text: string, voice: Voice = "guide"): Promise<void> {
  setCaption({ text, voice })
  return new Promise((resolve) => {
    const fallback = window.setTimeout(done, 900 + text.length * 55)
    function done() { clearTimeout(fallback); setCaption(null); resolve() }
    if (muted || !("speechSynthesis" in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.rate = voice === "guide" ? 1.02 : 0.98
    u.pitch = voice === "guide" ? 1.35 : voice === "dad" ? 0.8 : 1.15
    const en = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"))
    if (en.length) u.voice = en[voice === "dad" ? Math.min(1, en.length - 1) : 0]
    u.onend = done
    u.onerror = done
    window.speechSynthesis.speak(u)
  })
}
export function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel()
  setCaption(null)
}

/** "The sequence never blocks the kid: tapping any action stops it." */
export function stopAll() {
  stopSpeech()
  stopRecording()
}
