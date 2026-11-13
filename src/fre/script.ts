/**
 * The FRE flow script: every step's voice-over, sound cues and the motion of every object, as data.
 * The flow plays this script; the editor (#/editor) edits a copy of it and saves it in the browser.
 * Export the edited JSON from the editor to make it the new default here.
 */
import type { SoundName } from "./sounds"
import type { ClaudeVoice, Voice } from "@/lib/audio"

export type Ease = "spring" | "overshoot" | "out" | "inOut" | "linear" | "bounce"
export const EASES: Ease[] = ["spring", "overshoot", "out", "inOut", "linear", "bounce"]
export type EnterPreset = "none" | "pop" | "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scatter" | "stamp" | "drop" | "zoom" | "unfold"
export const ENTER_PRESETS: EnterPreset[] = ["none", "pop", "fade", "slideUp", "slideDown", "slideLeft", "slideRight", "scatter", "stamp", "drop", "zoom", "unfold"]
export type IdlePreset = "none" | "float" | "wiggle" | "pulse" | "bob" | "spin" | "boil" | "breathe"
export const IDLE_PRESETS: IdlePreset[] = ["none", "float", "wiggle", "pulse", "bob", "spin", "boil", "breathe"]

export interface MotionCfg {
  enter: EnterPreset
  /** ms after the step starts */
  delay: number
  /** ms */
  duration: number
  ease: Ease
  /** px the object travels in (slide, drop) */
  distance: number
  /** scale it starts from (pop, zoom, stamp, scatter) */
  scaleFrom: number
  /** degrees it turns while entering */
  rotateFrom: number
  idle: IdlePreset
  /** px for float/bob, degrees for wiggle/spin, % for pulse/breathe */
  idleAmp: number
  /** seconds per idle cycle */
  idleSpeed: number
}

export interface ObjCfg {
  label: string
  motion: MotionCfg
  enterSound: SoundName | "none"
  enterVolume: number
  enterPitch: number
  /** Sound when the kid/parent taps it (buttons and stickers). */
  tapSound: SoundName | "none"
}

export interface VoiceLine {
  text: string
  voice: Voice
  /** ms of silence before this line */
  delay: number
  rate: number
  /** Browser voice only (Claude voices have no pitch). */
  pitch: number
  /** Claude voice for this line; empty = the role's default. */
  claudeVoice?: ClaudeVoice
}

export interface SoundCue {
  sound: SoundName
  /** ms after the step starts */
  at: number
  volume: number
  pitch: number
}

export type Advance = "auto" | "voice" | "tap" | "motion"
export type RecordingMode = "keep" | "off" | "background" | "play"

export interface StepCfg {
  id: StepId
  title: string
  /** Box on the flow chart this step belongs to. */
  node: NodeId
  device: "ipad" | "phone"
  note: string
  /** auto: after `after` ms · voice: when the voice-over ends + `after` · motion: when the animation ends + `after` · tap: waits for a tap */
  advance: Advance
  after: number
  next: StepId | null
  voice: VoiceLine[]
  sounds: SoundCue[]
  recording: { mode: RecordingMode; volume: number }
  objects: Record<string, ObjCfg>
  /** Step-specific numbers (frame rate, layout move time…). */
  params: Record<string, number>
}

export const STEP_IDS = ["k-glow", "k-scatter", "k-success", "k-share", "k-send", "p-notify", "p-sms", "p-message", "p-listen", "p-reply", "p-sent", "k-notify", "k-reveal"] as const
export type StepId = (typeof STEP_IDS)[number]

/** The flow chart from the plan doc. */
export const NODES = [
  { id: "kid-success", lane: "kid", title: "Success screen", sub: "stars + voice-over" },
  { id: "kid-confirm", lane: "kid", title: "Confirmation", sub: "recording flies to Mom & Dad" },
  { id: "parent-message", lane: "parent", title: "Email or SMS", sub: "listen to your kid" },
  { id: "parent-listen", lane: "parent", title: "Listen widget", sub: "kid's recording" },
  { id: "parent-reply", lane: "parent", title: "Send a reply", sub: "pick a reply type" },
  { id: "parent-confirm", lane: "parent", title: "Confirmation", sub: "reply sent" },
  { id: "kid-reveal", lane: "kid", title: "Reply reveal", sub: "sticker + voice" },
] as const
export type NodeId = (typeof NODES)[number]["id"]

export type Script = Record<StepId, StepCfg>

// ─── helpers ────────────────────────────────────────────────────────────────
const M = (p: Partial<MotionCfg> = {}): MotionCfg => ({
  enter: "pop", delay: 0, duration: 520, ease: "overshoot", distance: 80, scaleFrom: 0.3, rotateFrom: 0, idle: "none", idleAmp: 6, idleSpeed: 3.2, ...p,
})
const O = (label: string, motion: Partial<MotionCfg> = {}, extra: Partial<Omit<ObjCfg, "label" | "motion">> = {}): ObjCfg => ({
  label, motion: M(motion), enterSound: "none", enterVolume: 0.7, enterPitch: 1, tapSound: "none", ...extra,
})
const V = (text: string, voice: Voice = "guide", delay = 0, p: Partial<VoiceLine> = {}): VoiceLine => ({
  text, voice, delay, rate: voice === "guide" ? 1.02 : 0.98, pitch: voice === "guide" ? 1.35 : voice === "mom" ? 1.15 : voice === "dad" ? 0.8 : 1.6, ...p,
})
const S = (sound: SoundName, at: number, volume = 0.8, pitch = 1): SoundCue => ({ sound, at, volume, pitch })
const step = (s: Omit<StepCfg, "sounds" | "voice" | "objects" | "params" | "recording" | "after"> & Partial<StepCfg>): StepCfg => ({
  sounds: [], voice: [], objects: {}, params: {}, recording: { mode: "keep", volume: 0.15 }, after: 0, ...s,
})

/** Kid-scene stickers: scatter out of the planet, staggered. */
const scatterSticker = (label: string, i: number, rot: number, pitch: number) =>
  O(label, { enter: "scatter", delay: 60 + i * 70, duration: 760, ease: "overshoot", scaleFrom: 0.15, rotateFrom: rot, idle: "float", idleAmp: 5 + (i % 3) * 2, idleSpeed: 3 + (i % 4) * 0.45 }, { enterSound: "pop", enterVolume: 0.5, enterPitch: pitch, tapSound: "boing" })

export const DEFAULT_SCRIPT: Script = {
  "k-glow": step({
    id: "k-glow", title: "You did it! · glow-up", node: "kid-success", device: "ipad",
    note: "Figma 1. The planet glows, condenses and bursts into light. The narration plays with the kid's recording very quietly underneath.",
    advance: "motion", after: 0, next: "k-scatter",
    voice: [V("You did it!", "guide", 250, { rate: 0.95 }), V("You played Let It Go with almost no mistakes!", "guide", 150)],
    sounds: [S("success", 0, 0.7), S("glow", 2050, 0.8), S("burst", 3850, 0.9), S("sparkle", 4300, 0.6)],
    recording: { mode: "background", volume: 0.14 },
    params: { fps: 17, endFrame: 78, loopIdle: 0 },
  }),
  "k-scatter": step({
    id: "k-scatter", title: "Stickers scatter", node: "kid-success", device: "ipad",
    note: "Figma 2. After the explosion every sticker flies out of the planet onto the sheet.",
    advance: "auto", after: 1500, next: "k-success",
    sounds: [S("whoosh", 0, 0.5)],
    objects: {
      flash: O("Light flash", { enter: "fade", duration: 500, ease: "out", scaleFrom: 1 }),
      striped: scatterSticker("Striped planet", 0, -140, 0.9),
      ringed: scatterSticker("Ringed planet", 1, 120, 1.0),
      drippy: scatterSticker("Drippy comet", 2, -90, 1.1),
      cloud: scatterSticker("Cloud comet", 3, 160, 0.95),
      burst: scatterSticker("Gold burst", 4, -200, 0.85),
      heart: scatterSticker("Heart", 5, 90, 1.25),
      spark1: scatterSticker("Sparkle top", 6, 180, 1.4),
      spark2: scatterSticker("Sparkle left", 7, -180, 1.5),
      spark3: scatterSticker("Sparkle right", 8, 220, 1.6),
    },
    params: { originX: 577, originY: 527 },
  }),
  "k-success": step({
    id: "k-success", title: "You are a star!", node: "kid-success", device: "ipad",
    note: "Figma 3. The success card pops up and each star is stamped in with what it means.",
    advance: "voice", after: 700, next: "k-share",
    voice: [V("You are a star!", "guide", 500), V("Every note right!", "guide", 250), V("Right on the beat!", "guide", 150), V("Both hands together!", "guide", 150)],
    sounds: [S("fanfare", 350, 0.45)],
    objects: {
      avatar: O("Profile avatar", { enter: "slideDown", delay: 100, duration: 480, distance: 120, ease: "spring" }),
      progress: O("Reward progress", { enter: "slideDown", delay: 180, duration: 480, distance: 120, ease: "spring" }),
      card: O("Card", { enter: "zoom", delay: 200, duration: 620, ease: "spring", scaleFrom: 0.6 }, { enterSound: "paper", enterVolume: 0.6 }),
      title: O("Title · You are a star!", { enter: "pop", delay: 520, duration: 560, ease: "overshoot", scaleFrom: 0.4, rotateFrom: -6, idle: "boil", idleAmp: 1, idleSpeed: 0.35 }, { enterSound: "bubble", enterVolume: 0.5 }),
      star1: O("Star 1 · every note", { enter: "stamp", delay: 1300, duration: 420, ease: "overshoot", scaleFrom: 2.4, rotateFrom: -30, idle: "wiggle", idleAmp: 4, idleSpeed: 2.6 }, { enterSound: "star", enterVolume: 0.8, enterPitch: 1, tapSound: "sparkle" }),
      star2: O("Star 2 · on the beat", { enter: "stamp", delay: 2400, duration: 420, ease: "overshoot", scaleFrom: 2.4, rotateFrom: 25, idle: "wiggle", idleAmp: 4, idleSpeed: 2.9 }, { enterSound: "star", enterVolume: 0.8, enterPitch: 1.26, tapSound: "sparkle" }),
      star3: O("Star 3 · both hands", { enter: "stamp", delay: 3500, duration: 420, ease: "overshoot", scaleFrom: 2.4, rotateFrom: -20, idle: "wiggle", idleAmp: 4, idleSpeed: 2.3 }, { enterSound: "star", enterVolume: 0.8, enterPitch: 1.5, tapSound: "sparkle" }),
      share: O("Share button", { enter: "slideUp", delay: 4300, duration: 460, distance: 40, ease: "spring" }, { tapSound: "pop" }),
      next: O("Play next button", { enter: "slideUp", delay: 4420, duration: 460, distance: 40, ease: "spring" }, { tapSound: "tap" }),
    },
    params: { layoutMs: 900 },
  }),
  "k-share": step({
    id: "k-share", title: "Share the moment (first time)", node: "kid-success", device: "ipad",
    note: "Figma 4. FRE: the card turns into the share screen on its own. The player waits at 0:00 (tap to listen) while the share suggestion is voiced over the quiet background take.",
    advance: "tap", after: 0, next: "k-send",
    voice: [V("Want Mom and Dad to hear you play?", "guide", 900), V("Tap Share, and it goes straight to them!", "guide", 250)],
    sounds: [S("sheet", 0, 0.5)],
    recording: { mode: "keep", volume: 0.14 },
    params: { playerVolume: 0.6 },
    objects: {
      stars: O("Small stars", { enter: "pop", delay: 0, duration: 480, ease: "overshoot", scaleFrom: 1.8 }),
      player: O("Recording player", { enter: "unfold", delay: 220, duration: 620, ease: "spring", scaleFrom: 0.7, distance: 40 }, { enterSound: "bubble", enterVolume: 0.5, enterPitch: 0.8 }),
      close: O("Close button", { enter: "fade", delay: 600, duration: 300, ease: "out" }, { tapSound: "tap" }),
      share: O("Share button", { enter: "slideUp", delay: 700, duration: 420, distance: 30, ease: "spring", idle: "pulse", idleAmp: 6, idleSpeed: 1.4 }, { tapSound: "pop" }),
    },
  }),
  "k-send": step({
    id: "k-send", title: "Sending to Mom & Dad", node: "kid-confirm", device: "ipad",
    note: "Transient overlay. The recording becomes a sticker and flies to Mom and Dad; each gets a check. Closes on its own.",
    advance: "voice", after: 900, next: "p-notify",
    voice: [V("Off it goes!", "guide", 500), V("Mom and Dad will hear you play soon!", "guide", 900), V("When they send something back, it pops up right here!", "guide", 200)],
    sounds: [S("send", 450, 0.8), S("ding", 1450, 0.6), S("ding", 1650, 0.5, 1.2)],
    recording: { mode: "off", volume: 0 },
    objects: {
      dim: O("Dim", { enter: "fade", duration: 300, ease: "out" }),
      mom: O("Mom", { enter: "pop", delay: 150, duration: 520, ease: "overshoot", idle: "bob", idleAmp: 5, idleSpeed: 2.4 }, { enterSound: "pop", enterVolume: 0.5 }),
      dad: O("Dad", { enter: "pop", delay: 260, duration: 520, ease: "overshoot", idle: "bob", idleAmp: 5, idleSpeed: 2.8 }, { enterSound: "pop", enterVolume: 0.5, enterPitch: 0.85 }),
      song: O("Song sticker (flies)", { enter: "pop", delay: 0, duration: 400, ease: "overshoot" }),
      checks: O("Checks", { enter: "stamp", delay: 1450, duration: 360, scaleFrom: 2 }),
    },
    params: { flyAt: 450, flyMs: 950 },
  }),
  "p-notify": step({
    id: "p-notify", title: "Parent gets an SMS", node: "parent-message", device: "phone",
    note: "First message to a parent: it explains what this is. Later messages are compact.",
    advance: "tap", next: "p-sms",
    sounds: [S("notify", 650, 0.7)],
    recording: { mode: "off", volume: 0 },
    objects: {
      clock: O("Lock-screen clock", { enter: "fade", duration: 400, ease: "out" }),
      notif: O("SMS notification", { enter: "slideDown", delay: 600, duration: 520, distance: 160, ease: "spring" }),
    },
  }),
  "p-sms": step({
    id: "p-sms", title: "Mom opens the SMS", node: "parent-message", device: "phone",
    note: "The message thread: a short line from Noa's piano app and a link preview. Tapping the link opens the listen page in the browser.",
    advance: "tap", next: "p-message",
    recording: { mode: "off", volume: 0 },
    objects: {
      header: O("Thread header", { enter: "fade", duration: 300, ease: "out" }),
      bubble: O("Message bubble", { enter: "slideUp", delay: 250, duration: 420, distance: 24, ease: "spring" }),
      link: O("Link preview", { enter: "slideUp", delay: 450, duration: 460, distance: 24, ease: "spring" }, { tapSound: "tap" }),
    },
  }),
  "p-message": step({
    id: "p-message", title: "Listen to your kid", node: "parent-message", device: "phone",
    note: "The link opens in the phone's browser: no app needed. The headline is in the kid's words.",
    advance: "tap", next: "p-listen",
    sounds: [S("paper", 100, 0.5)],
    objects: {
      paper: O("Paper", { enter: "slideUp", delay: 0, duration: 600, distance: 220, ease: "spring" }),
      comet: O("Cloud comet", { enter: "pop", delay: 300, duration: 520, rotateFrom: -40, idle: "float", idleAmp: 5, idleSpeed: 3.4 }, { enterSound: "pop", enterVolume: 0.4 }),
      sparkle: O("Sparkle", { enter: "pop", delay: 420, duration: 520, rotateFrom: 90, idle: "wiggle", idleAmp: 8, idleSpeed: 2.2 }, { enterSound: "pop", enterVolume: 0.4, enterPitch: 1.4 }),
      burst: O("Gold burst", { enter: "pop", delay: 520, duration: 520, rotateFrom: -90, idle: "spin", idleAmp: 8, idleSpeed: 6 }, { enterSound: "pop", enterVolume: 0.4, enterPitch: 0.8 }),
      time: O("Timestamp", { enter: "fade", delay: 200, duration: 400, ease: "out" }),
      headline: O("Headline", { enter: "slideUp", delay: 650, duration: 520, distance: 30, ease: "spring" }),
      player: O("Player", { enter: "slideUp", delay: 800, duration: 520, distance: 30, ease: "spring" }, { tapSound: "tap" }),
      surprise: O("Send a surprise button", { enter: "slideUp", delay: 950, duration: 520, distance: 30, ease: "spring" }, { tapSound: "tap" }),
    },
  }),
  "p-listen": step({
    id: "p-listen", title: "Listen widget", node: "parent-listen", device: "phone",
    note: "The recording plays with the song's sheet and keys, plus the effort story, so the parent can praise something specific.",
    advance: "tap", next: "p-message",
    sounds: [S("sheet", 0, 0.5)],
    recording: { mode: "play", volume: 0.9 },
    objects: {
      sheet: O("Bottom sheet", { enter: "slideUp", duration: 520, distance: 640, ease: "spring", scaleFrom: 1 }),
      cover: O("Song card", { enter: "fade", delay: 250, duration: 400, ease: "out" }),
      details: O("Song details", { enter: "slideUp", delay: 350, duration: 420, distance: 20, ease: "out" }),
      message: O("Effort note", { enter: "slideUp", delay: 500, duration: 420, distance: 20, ease: "out" }),
    },
  }),
  "p-reply": step({
    id: "p-reply", title: "Send Noa a surprise", node: "parent-reply", device: "phone",
    note: "Sticker first: the fastest reply. Voice and video are one tap away.",
    advance: "tap", next: "p-sent",
    sounds: [S("paper", 0, 0.4)],
    recording: { mode: "off", volume: 0 },
    objects: {
      header: O("Header", { enter: "fade", duration: 380, ease: "out" }),
      card: O("Sticker card", { enter: "zoom", delay: 100, duration: 520, scaleFrom: 0.85, ease: "spring" }),
      tag: O("Proud of you! tag", { enter: "pop", delay: 420, duration: 480, rotateFrom: -8 }, { enterSound: "bubble", enterVolume: 0.4 }),
      sticker: O("Sticker", { enter: "stamp", delay: 600, duration: 440, scaleFrom: 1.8, rotateFrom: 20, idle: "breathe", idleAmp: 3, idleSpeed: 2.6 }, { enterSound: "stamp", enterVolume: 0.6, tapSound: "pop" }),
      sparkle: O("Sparkle", { enter: "pop", delay: 760, duration: 420, rotateFrom: 90, idle: "wiggle", idleAmp: 10, idleSpeed: 2 }),
      toolbar: O("Toolbar", { enter: "slideUp", delay: 800, duration: 420, distance: 20 }, { tapSound: "click" }),
      send: O("Send to Noa button", { enter: "slideUp", delay: 900, duration: 420, distance: 30, ease: "spring" }, { tapSound: "tap" }),
    },
  }),
  "p-sent": step({
    id: "p-sent", title: "Reply sent", node: "parent-confirm", device: "phone",
    note: "The sticker card flies off to Noa; the parent can send another.",
    advance: "auto", after: 3200, next: "k-notify",
    sounds: [S("send", 0, 0.7), S("chime", 900, 0.5)],
    objects: {
      fly: O("Card flies away", { enter: "none", duration: 900, ease: "inOut" }),
      done: O("Sent check", { enter: "stamp", delay: 900, duration: 420, scaleFrom: 2 }),
      text: O("Sent text", { enter: "slideUp", delay: 1050, duration: 420, distance: 20 }),
    },
  }),
  "k-notify": step({
    id: "k-notify", title: "A surprise arrives", node: "kid-reveal", device: "ipad",
    note: "The reply arrives as a banner led by Mom's face, with a sound and a voice line, since the kid may not read.",
    advance: "tap", next: "k-reveal",
    voice: [V("Mom sent you a surprise!", "guide", 900), V("Tap to open it!", "guide", 200)],
    sounds: [S("chime", 450, 0.7)],
    recording: { mode: "off", volume: 0 },
    objects: {
      banner: O("Notification banner", { enter: "slideDown", delay: 400, duration: 560, distance: 220, ease: "spring", idle: "wiggle", idleAmp: 1.5, idleSpeed: 2.2 }, { tapSound: "pop" }),
    },
  }),
  "k-reveal": step({
    id: "k-reveal", title: "Reply reveal", node: "kid-reveal", device: "ipad",
    note: "Mom's sticker pops in with her voice message. The end of the exchange: the kid doesn't reply back.",
    advance: "tap", next: null,
    voice: [V("Proud of you, Noa! I loved hearing you play!", "mom", 1300), V("Mom loved it!", "guide", 400)],
    sounds: [S("magic", 300, 0.7), S("burst", 900, 0.6), S("sparkle", 1100, 0.6)],
    objects: {
      dim: O("Dim", { enter: "fade", duration: 350, ease: "out" }),
      mom: O("Mom", { enter: "drop", delay: 200, duration: 600, distance: 200, ease: "bounce", idle: "bob", idleAmp: 4, idleSpeed: 2.6 }),
      tag: O("Proud of you! tag", { enter: "pop", delay: 650, duration: 520, rotateFrom: -10, idle: "boil", idleAmp: 1, idleSpeed: 0.35 }),
      sticker: O("Mom's sticker", { enter: "stamp", delay: 900, duration: 520, scaleFrom: 3, rotateFrom: -40, idle: "float", idleAmp: 8, idleSpeed: 3 }, { tapSound: "boing" }),
      confetti: O("Confetti", { enter: "fade", delay: 900, duration: 200 }),
      next: O("Play next button", { enter: "slideUp", delay: 2200, duration: 460, distance: 40, ease: "spring" }, { tapSound: "tap" }),
    },
  }),
}
