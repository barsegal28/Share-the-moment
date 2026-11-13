/**
 * Sound library for the FRE flow. Everything is synthesised (no files), so every cue can be tuned in the editor:
 * each sound takes a volume (0–1.5) and a pitch multiplier (0.5–2).
 */
import { ac, isMuted } from "@/lib/audio"

export const SOUND_NAMES = [
  "tap", "pop", "bubble", "boop", "chime", "sparkle", "star", "success", "fanfare", "glow", "burst", "whoosh", "swoosh",
  "send", "stamp", "paper", "notify", "ding", "magic", "boing", "click", "sheet",
] as const
export type SoundName = (typeof SOUND_NAMES)[number]

export const SOUND_LABELS: Record<SoundName, string> = {
  tap: "Tap", pop: "Pop", bubble: "Bubble", boop: "Boop", chime: "Chime", sparkle: "Sparkle", star: "Star stamp", success: "Success arpeggio",
  fanfare: "Fanfare", glow: "Glow rise", burst: "Burst", whoosh: "Whoosh", swoosh: "Swoosh (soft)", send: "Send / fly away", stamp: "Stamp thump",
  paper: "Paper rustle", notify: "Notification", ding: "Ding", magic: "Magic reveal", boing: "Boing", click: "Click", sheet: "Sheet slide",
}

type Osc = OscillatorType
function tone(c: AudioContext, out: AudioNode, freq: number, start: number, dur: number, gain: number, type: Osc = "triangle", glideTo?: number) {
  const o = c.createOscillator()
  const g = c.createGain()
  const t0 = c.currentTime + start
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(out)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

let noiseBuf: AudioBuffer | null = null
function noise(c: AudioContext, out: AudioNode, start: number, dur: number, gain: number, freq = 1200, q = 0.8, sweepTo?: number, type: BiquadFilterType = "bandpass") {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource()
  s.buffer = noiseBuf
  const f = c.createBiquadFilter()
  f.type = type
  f.Q.value = q
  const t0 = c.currentTime + start
  f.frequency.setValueAtTime(freq, t0)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + Math.min(0.03, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  s.connect(f).connect(g).connect(out)
  s.start(t0)
  s.stop(t0 + dur + 0.05)
}

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12)

const RECIPES: Record<SoundName, (c: AudioContext, o: AudioNode, p: number) => void> = {
  tap: (c, o, p) => tone(c, o, 660 * p, 0, 0.12, 0.14, "sine"),
  click: (c, o, p) => { tone(c, o, 1800 * p, 0, 0.04, 0.12, "square"); noise(c, o, 0, 0.03, 0.08, 4000 * p, 2) },
  pop: (c, o, p) => { tone(c, o, 420 * p, 0, 0.09, 0.2, "sine", 900 * p); tone(c, o, 880 * p, 0.04, 0.12, 0.08, "sine") },
  bubble: (c, o, p) => tone(c, o, 300 * p, 0, 0.16, 0.2, "sine", 1100 * p),
  boop: (c, o, p) => tone(c, o, 520 * p, 0, 0.18, 0.18, "sine", 380 * p),
  chime: (c, o, p) => [784, 988, 1175, 1568].forEach((f, i) => tone(c, o, f * p, i * 0.08, 0.7, 0.1, "sine")),
  sparkle: (c, o, p) => [0, 1, 2, 3, 4, 5].forEach((i) => tone(c, o, (1800 + ((i * 1373) % 1600)) * p, i * 0.045, 0.25, 0.05, "sine")),
  star: (c, o, p) => { tone(c, o, 523 * p, 0, 0.4, 0.18); tone(c, o, 1046 * p, 0.04, 0.35, 0.07, "sine"); noise(c, o, 0, 0.06, 0.1, 300, 1, undefined, "lowpass") },
  success: (c, o, p) => [60, 64, 67, 72].forEach((n, i) => tone(c, o, midi(n) * p, i * 0.11, 0.55, 0.15)),
  fanfare: (c, o, p) => { [60, 64, 67].forEach((n, i) => tone(c, o, midi(n) * p, i * 0.12, 0.3, 0.14, "square")); [72, 76, 79].forEach((n) => tone(c, o, midi(n) * p, 0.4, 0.9, 0.08, "triangle")) },
  glow: (c, o, p) => { tone(c, o, 220 * p, 0, 1.6, 0.08, "sine", 880 * p); tone(c, o, 330 * p, 0.1, 1.5, 0.06, "triangle", 1320 * p); noise(c, o, 0, 1.6, 0.05, 800, 3, 6000) },
  burst: (c, o, p) => { noise(c, o, 0, 0.9, 0.35, 2400, 0.5, 200, "lowpass"); [60, 67, 72, 76, 79].forEach((n) => tone(c, o, midi(n) * p, 0.02, 1.2, 0.07, "triangle")); tone(c, o, 90 * p, 0, 0.4, 0.3, "sine", 40) },
  whoosh: (c, o, p) => noise(c, o, 0, 0.45, 0.22, 400 * p, 1.2, 3000 * p),
  swoosh: (c, o, p) => noise(c, o, 0, 0.35, 0.12, 900 * p, 2, 2200 * p),
  send: (c, o, p) => { noise(c, o, 0, 0.7, 0.2, 300 * p, 1.5, 5000 * p); tone(c, o, 400 * p, 0.05, 0.6, 0.08, "sine", 1600 * p) },
  stamp: (c, o, p) => { tone(c, o, 140 * p, 0, 0.18, 0.35, "sine", 60 * p); noise(c, o, 0, 0.08, 0.15, 600, 1, undefined, "lowpass") },
  paper: (c, o, p) => [0, 0.06, 0.13].forEach((t, i) => noise(c, o, t, 0.08, 0.12, (2000 + i * 900) * p, 1.5)),
  notify: (c, o, p) => { tone(c, o, 1175 * p, 0, 0.35, 0.12, "sine"); tone(c, o, 1568 * p, 0.12, 0.5, 0.12, "sine") },
  ding: (c, o, p) => { tone(c, o, 1318 * p, 0, 1.1, 0.13, "sine"); tone(c, o, 2636 * p, 0, 0.5, 0.03, "sine") },
  magic: (c, o, p) => { [72, 76, 79, 84, 88].forEach((n, i) => tone(c, o, midi(n) * p, i * 0.07, 0.8, 0.07, "sine")); noise(c, o, 0, 1, 0.06, 3000, 4, 9000) },
  boing: (c, o, p) => tone(c, o, 200 * p, 0, 0.4, 0.2, "sine", 520 * p),
  sheet: (c, o, p) => { noise(c, o, 0, 0.3, 0.1, 600 * p, 1, 1800 * p); tone(c, o, 330 * p, 0.05, 0.2, 0.05, "sine", 440 * p) },
}

/** Play a sound now (or after `delayMs`). */
export function playSound(name: SoundName | "none" | undefined, { volume = 1, pitch = 1, delayMs = 0 }: { volume?: number; pitch?: number; delayMs?: number } = {}) {
  if (!name || name === "none") return
  const go = () => {
    const c = ac()
    if (!c || isMuted()) return
    const g = c.createGain()
    g.gain.value = volume
    g.connect(c.destination)
    RECIPES[name]?.(c, g, pitch)
    window.setTimeout(() => g.disconnect(), 3000)
  }
  if (delayMs > 0) return window.setTimeout(go, delayMs)
  go()
}
