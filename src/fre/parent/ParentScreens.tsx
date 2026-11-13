/**
 * Parent flow, phone web (Figma "Parent.Mobile", 393 × 650 content inside an iPhone + Safari shell).
 * SMS → listen page → listen sheet → send a surprise → sent.
 */
import { useEffect, useRef, useState, type ReactNode } from "react"
import { BatteryFull, ChevronLeft, ChevronRight, Lock, RotateCw, Signal, Wifi, BookOpen, Copy, Share } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { MELODY, playRecording, stopRecording } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { DEMO_SONG } from "@/config"
import { Obj, EASING } from "../Obj"
import { useFlow, useRecordingProgress } from "../runtime"
import { CameraIcon, CollectionsAddIcon, DismissIcon, MicAddIcon, StarIcon, StickerIcon } from "../icons"
import { ParentButton, SONG_SECONDS, fmt, replyChoice, useReplyChoice } from "../shared"
import { playSound } from "../sounds"
import type { StepId } from "../script"

export const PHONE = { w: 393, h: 852 }
const PARENT_STEPS: StepId[] = ["p-notify", "p-message", "p-listen", "p-reply", "p-sent"]
export const isParentStep = (s: StepId) => PARENT_STEPS.includes(s)

export function ParentScreens() {
  const flow = useFlow()
  const s = flow.step
  if (s === "p-notify") return <LockScreen />
  return (
    <PhoneChrome dark={s === "p-message" || s === "p-listen"}>
      {(s === "p-message" || s === "p-listen") && <MessagePage />}
      {s === "p-listen" && <ListenSheet />}
      {s === "p-reply" && <ReplyComposer />}
      {s === "p-sent" && <ReplySent />}
    </PhoneChrome>
  )
}

// ─── iPhone + Safari shell (Figma annotation: "add iphone mobile browser shell") ───
function StatusBar({ light }: { light?: boolean }) {
  return (
    <div className={cn("flex h-[54px] items-center justify-between px-8 pt-1 text-[17px] font-semibold", light ? "text-white" : "text-black")}>
      <span className="w-14 text-center">14:05</span>
      <span className="h-[34px] w-[124px] rounded-full bg-black" aria-hidden />
      <span className="flex w-14 items-center justify-end gap-1">
        <Signal className="size-4" strokeWidth={3} />
        <Wifi className="size-4" strokeWidth={3} />
        <BatteryFull className="size-5" />
      </span>
    </div>
  )
}

function PhoneChrome({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-[#f2f2f7] font-sans">
      <div className={cn(dark ? "bg-pink" : "bg-cream")}>
        <StatusBar light={false} />
      </div>
      <div className="relative h-[650px] w-[393px] shrink-0 overflow-hidden">{children}</div>
      {/* Safari bottom bar */}
      <div className="flex flex-1 flex-col items-center gap-2 border-t border-black/10 bg-[#f9f9f9]/95 px-3 pt-2.5 backdrop-blur">
        <div className="flex h-11 w-full items-center gap-2 rounded-[14px] bg-[#e3e3e8] px-3 text-[15px] text-black/80">
          <span className="text-[13px] font-semibold text-black/60">AA</span>
          <span className="flex flex-1 items-center justify-center gap-1.5">
            <Lock className="size-3.5" /> pianopals.app
          </span>
          <RotateCw className="size-4 text-black/60" />
        </div>
        <div className="flex w-full items-center justify-between px-3 text-[#0a84ff]">
          <ChevronLeft className="size-7" />
          <ChevronRight className="size-7 opacity-30" />
          <Share className="size-6" />
          <BookOpen className="size-6" />
          <Copy className="size-6" />
        </div>
        <div className="mt-auto mb-2 h-[5px] w-[134px] rounded-full bg-black" />
      </div>
    </div>
  )
}

// ─── Lock screen with the SMS (first message: explains what this is) ───
function LockScreen() {
  const flow = useFlow()
  return (
    <div className="relative h-[852px] w-[393px] overflow-hidden font-sans text-white" style={{ background: "linear-gradient(160deg, #8ba1ef 0%, #ec70bb 55%, #fd6117 120%)" }}>
      <StatusBar light />
      <Obj step="p-notify" id="clock" className="absolute inset-x-0 top-[96px] text-center">
        <p className="text-[19px] font-semibold opacity-90">Friday, November 13</p>
        <p className="text-[96px] leading-none font-bold tracking-tight">14:05</p>
      </Obj>
      <Obj step="p-notify" id="notif" hint onTap={() => flow.go("p-message")} className="absolute rounded-[22px]" style={{ left: 10, top: 300, width: 373 }}>
        <div className="flex gap-3 rounded-[22px] bg-white/75 p-3.5 text-black shadow-[0_8px_30px_rgb(0_0_0/0.18)] backdrop-blur-xl">
          <div className="grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-[#34c759]">
            <svg viewBox="0 0 24 24" className="size-6 fill-white" aria-hidden>
              <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1-.2 1.3-.9 2.6-2 3.4 2 0 3.8-.7 5.1-1.8 1.1.3 2.3.5 3.5.5 5.5 0 10-3.6 10-8.1S17.5 3 12 3z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-semibold">Piano Pals · Noa</p>
              <p className="text-[13px] text-black/50">now</p>
            </div>
            <p className="text-[15px] leading-snug">
              🎹 Noa just got 3 stars on “{DEMO_SONG.title}” and wants you to hear it! Tap to listen, no app needed. You can send a little surprise back.
            </p>
            <p className="mt-0.5 text-[13px] text-black/50">pianopals.app/noa</p>
          </div>
        </div>
      </Obj>
      <p className="absolute inset-x-0 bottom-10 text-center text-[13px] opacity-70">Tap the message to open it</p>
      <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white" />
    </div>
  )
}

// ─── Listen to your kid (Figma Parent.Mobile 1) ───
function MessagePage() {
  const flow = useFlow()
  const listened = flow.seen("p-listen")
  return (
    <div className="absolute inset-0 overflow-hidden bg-pink">
      <Grain />
      <Obj step="p-message" id="paper" className="absolute inset-0">
        <svg className="absolute top-0 left-0" width={393} height={650} viewBox="0 0 393 650" aria-hidden style={{ filter: "drop-shadow(0 5px 5px rgb(0 0 0 / 0.2))" }}>
          <path d="M-24 88.5 L464 270 V700 H-24 Z" fill="var(--sticker-cream)" />
        </svg>
      </Obj>
      <Obj step="p-message" id="comet" className="absolute" style={{ left: 47, top: 26, width: 182, height: 182 }}>
        <Sticker name="cloudComet" size={182} tilt={-8} />
      </Obj>
      <Obj step="p-message" id="sparkle" className="absolute" style={{ left: 251, top: 28, width: 86, height: 86 }}>
        <Sticker name="sparkle" size={86} tilt={12} />
      </Obj>
      <Obj step="p-message" id="burst" className="absolute" style={{ left: 219, top: 105, width: 151, height: 151 }}>
        <Sticker name="burst" size={151} tilt={10} />
      </Obj>
      <Obj step="p-message" id="time" className="absolute top-4 left-4">
        <p className="font-mono text-[20px] leading-[0.98] font-medium text-cream">Today at 14:05</p>
      </Obj>
      <Obj step="p-message" id="headline" className="absolute" style={{ left: 39, top: 279, width: 306 }}>
        <p className="font-display text-[36px] leading-[40px] text-teal uppercase">
          I got 3 stars on this song, <span className="text-orange">mom!</span>
        </p>
      </Obj>
      <Obj step="p-message" id="player" hint={!listened} onTap={() => flow.go("p-listen")} className="absolute rounded-[60px]" style={{ left: 36, top: 417, width: 340 }}>
        <div className="flex items-center gap-5 rounded-[60px] py-5 pr-[30px] pl-3">
          <PlayDisc size={70} />
          <SongMeta size="sm" />
        </div>
      </Obj>
      <Obj step="p-message" id="surprise" hint={listened} onTap={() => flow.go("p-reply")} className="absolute rounded-[24px]" style={{ left: 60, top: 559, width: 274 }}>
        <ParentButton>Send Noa a surprise</ParentButton>
      </Obj>
    </div>
  )
}

function Grain({ opacity = 0.25 }: { opacity?: number }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply" style={{ opacity }}>
      <filter id="parent-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1" />
      </filter>
      <rect width="100%" height="100%" filter="url(#parent-grain)" />
    </svg>
  )
}

function PlayDisc({ size = 70, playing = false }: { size?: number; playing?: boolean }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-orange shadow-[0_5px_10px_rgb(0_0_0/0.22)]" style={{ width: size, height: size }}>
      {playing ? (
        <span className="flex gap-[18%]" style={{ height: size * 0.36 }}>
          <span className="w-[7px] rounded bg-white" />
          <span className="w-[7px] rounded bg-white" />
        </span>
      ) : (
        <svg viewBox="0 0 24 24" style={{ width: size * 0.46, marginLeft: size * 0.06 }} fill="white" aria-hidden>
          <path d="M6 3.6v16.8c0 .9 1 1.4 1.7.9l12.6-8.4c.6-.4.6-1.4 0-1.8L7.7 2.7C7 2.2 6 2.7 6 3.6z" />
        </svg>
      )}
    </span>
  )
}

function SongMeta({ size }: { size: "sm" | "lg" }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className={cn("font-display leading-[0.98] text-teal", size === "sm" ? "text-[24px] tracking-[0.96px]" : "text-[32px] tracking-[1.28px]")}>Let it go</p>
      <div className="flex flex-col gap-2 font-mono text-[16px] leading-[0.98] font-medium text-gold">
        <p className="whitespace-nowrap tracking-[-0.2px]">
          {DEMO_SONG.from} · Played by Noa
        </p>
        <div className="flex items-center gap-2">
          <span className="w-12">Score</span>
          <span className="flex gap-1.5 text-orange">
            <StarIcon size={20} />
            <StarIcon size={20} />
            <StarIcon size={20} />
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Listen widget (Figma Parent.Mobile 2: bottom sheet) ───
function ListenSheet() {
  const flow = useFlow()
  const p = useRecordingProgress(true)
  const [paused, setPaused] = useState(false)
  const vol = flow.script["p-listen"].recording.volume
  const toggle = () => {
    if (paused) playRecording({ volume: vol, loop: true })
    else stopRecording()
    setPaused(!paused)
  }
  const close = () => {
    stopRecording()
    flow.go("p-message")
  }
  return (
    <>
      <div className="absolute inset-0 bg-black/25" onClick={close} />
      <Obj step="p-listen" id="sheet" className="absolute inset-x-0 bottom-0" style={{ height: 630 }}>
        <div className="relative flex h-[630px] flex-col gap-10 rounded-t-[20px] bg-cream px-6 pt-12 pb-10 shadow-[0_-2px_10px_2px_rgb(0_0_0/0.25)]">
          <button type="button" aria-label="Close" onClick={close} className="absolute top-2 right-2 grid size-10 place-items-center text-ink">
            <DismissIcon size={20} />
          </button>
          <div className="flex flex-col gap-5">
            <Obj step="p-listen" id="cover">
              <SheetMusic progress={paused ? p : p} />
            </Obj>
            <Obj step="p-listen" id="details" className="px-1">
              <SongMeta size="lg" />
              <div className="mt-5 flex items-end gap-5">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="relative h-[9px] rounded-full bg-[rgb(255_253_247/0.4)]">
                    <div className="h-full rounded-full bg-surface" style={{ width: `${p * 100}%` }} />
                    <span className="absolute top-[-4.5px] size-[18px] -translate-x-1/2 rounded-full bg-surface shadow-[0_2px_6px_rgb(0_0_0/0.25)]" style={{ left: `${p * 100}%` }} />
                  </div>
                  <div className="flex justify-between font-mono text-[14px] font-medium text-gold">
                    <span>{fmt(p * SONG_SECONDS)}</span>
                    <span>{fmt(SONG_SECONDS)}</span>
                  </div>
                </div>
                <button type="button" onClick={toggle} aria-label={paused ? "Play" : "Pause"} className="active:scale-95">
                  <PlayDisc size={70} playing={!paused} />
                </button>
              </div>
            </Obj>
          </div>
          <Obj step="p-listen" id="message" className="flex w-[320px] flex-col gap-2 px-1 font-mono text-[16px] leading-[19px] font-medium">
            <p className="text-gold">Noa got 3 stars!</p>
            <p className="text-gold/90">It took 6 tries but they kept going until both hands were together!</p>
          </Obj>
        </div>
      </Obj>
    </>
  )
}

/** The song card: staves + keys. The playhead follows the recording; notes light up the keys. */
const LOW = 48 // C3
const WHITE = [0, 2, 4, 5, 7, 9, 11]
function SheetMusic({ progress }: { progress: number }) {
  const total = MELODY.reduce((s, [, b]) => s + b, 0)
  const tBeats = progress * total
  let acc = 0
  let current = -1
  const notes = MELODY.map(([n, b], i) => {
    const start = acc
    acc += b
    if (tBeats >= start && tBeats < start + b) current = i
    return { n, start, b }
  })
  const now = current >= 0 ? notes[current].n : -1
  const W = 300
  const whites: number[] = []
  for (let m = LOW; m < LOW + 36; m++) if (WHITE.includes(m % 12)) whites.push(m)
  const kw = W / whites.length
  const pxPerBeat = 34
  const staffY = (n: number) => 60 - (diatonic(n) - diatonic(64)) * 3.4 // E4 sits on the bottom treble line
  return (
    <div className="h-[210px] w-full overflow-hidden rounded-[20px] border border-gold bg-white">
      <svg viewBox="0 0 345 210" className="h-full w-full" aria-label={`Sheet music and keys for ${DEMO_SONG.title}`}>
        {/* staves */}
        {[0, 1].map((st) =>
          [0, 1, 2, 3, 4].map((l) => <line key={`${st}-${l}`} x1="20" x2="325" y1={33 + st * 58 + l * 6.8} y2={33 + st * 58 + l * 6.8} stroke="#111" strokeWidth="0.8" />),
        )}
        <text x="22" y="62" fontSize="38" fontFamily="serif">𝄞</text>
        <text x="24" y="114" fontSize="24" fontFamily="serif">𝄢</text>
        <text x="48" y="47" fontSize="11" fontWeight="700">4</text>
        <text x="48" y="58" fontSize="11" fontWeight="700">4</text>
        <text x="48" y="105" fontSize="11" fontWeight="700">4</text>
        <text x="48" y="116" fontSize="11" fontWeight="700">4</text>
        {/* notes scroll past the playhead */}
        <g clipPath="url(#staff-clip)">
          {notes.map((nt, i) => {
            const x = 70 + (nt.start - tBeats) * pxPerBeat
            if (x < 40 || x > 340) return null
            const y = staffY(nt.n)
            const on = i === current
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx="4.6" ry="3.4" transform={`rotate(-20 ${x} ${y})`} fill={on ? "#0b7563" : "#111"} />
                <line x1={x + 4.2} x2={x + 4.2} y1={y} y2={y - 20} stroke={on ? "#0b7563" : "#111"} strokeWidth="1" />
              </g>
            )
          })}
        </g>
        <clipPath id="staff-clip">
          <rect x="60" y="0" width="285" height="140" />
        </clipPath>
        {/* playhead */}
        <rect x="66" y="22" width="8" height="104" fill="#5ad1f0" opacity="0.35" rx="3" />
        <rect x="69" y="22" width="2" height="104" fill="#22b8e0" />
        {/* keys */}
        <g transform="translate(22 138)">
          {whites.map((m, i) => (
            <rect key={m} x={i * kw} y="0" width={kw} height="62" fill={m === now ? "#ec70bb" : "white"} stroke="#111" strokeWidth="0.8" />
          ))}
          {whites.map((m, i) => {
            const black = m + 1
            if (!(WHITE.includes(m % 12) && !WHITE.includes(black % 12)) || i === whites.length - 1) return null
            return <rect key={`b${m}`} x={(i + 1) * kw - kw * 0.32} y="0" width={kw * 0.64} height="38" fill={black === now ? "#ec70bb" : "#111"} />
          })}
        </g>
      </svg>
    </div>
  )
}
function diatonic(n: number) {
  const o = Math.floor(n / 12)
  const s = n % 12
  const idx = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][s]
  return o * 7 + idx
}

// ─── Send Noa a surprise (Figma Parent.Mobile 3) ───
type Tool = "sticker" | "voice" | "video"
function ReplyComposer() {
  const flow = useFlow()
  const choice = useReplyChoice()
  const [tool, setTool] = useState<Tool>("sticker")
  const pick = (t: Tool) => {
    setTool(t)
    playSound("click", { volume: 0.6 })
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden bg-cream px-5 pt-5 pb-10">
      <Grain opacity={0.18} />
      <Obj step="p-reply" id="header" className="relative w-full font-mono font-medium">
        <p className="text-[20px] leading-[30px] text-gold">Send Noa a surprise</p>
        <p className="text-[16px] leading-[19px] text-gold/80">It pops up for Noa with a sound.</p>
      </Obj>
      <div className="relative flex flex-col items-center gap-7">
        <Obj step="p-reply" id="card">
          <div className="relative flex h-[328px] w-[319px] flex-col items-center justify-between rounded-[40px] border-2 border-periwinkle bg-[rgb(247_242_230/0.6)] px-5 pt-10 pb-5">
            <Obj step="p-reply" id="tag" onTap={() => replyChoice.set({ phrase: choice.index.phrase + 1 })}>
              <span className="relative inline-flex items-center border border-[#006ee7] px-1.5 py-0.5">
                <span className="font-display text-[32px] leading-[30px] whitespace-nowrap text-teal uppercase">{choice.phrase}</span>
                <span className="absolute top-[12px] -left-[3.5px] size-1.5 rounded-full border border-[#006ee7] bg-white" />
                <span className="absolute top-[12px] -right-1 size-1.5 rounded-full border border-[#006ee7] bg-white" />
                <span className="absolute top-[-4px] right-1 h-[42px] w-px animate-pulse bg-[#818181]" />
              </span>
            </Obj>
            {tool === "sticker" ? (
              <Obj step="p-reply" id="sticker" onTap={() => replyChoice.set({ sticker: choice.index.sticker + 1 })}>
                <div className="grid size-[229px] place-items-center">
                  <Sticker name={choice.sticker} size={203} tilt={-8} />
                </div>
              </Obj>
            ) : (
              <div className="grid size-[229px] place-items-center text-center font-mono text-[16px] text-gold">
                <div className="flex flex-col items-center gap-3">
                  <span className="grid size-24 place-items-center rounded-full bg-orange text-white shadow-[0_5px_10px_rgb(0_0_0/0.2)]">{tool === "voice" ? <MicAddIcon size={44} /> : <CameraIcon size={44} />}</span>
                  {tool === "voice" ? "Hold to record a message" : "Tap to record a short video"}
                </div>
              </div>
            )}
            <Obj step="p-reply" id="sparkle" className="absolute" style={{ left: 26, top: 230, width: 71, height: 71 }}>
              <Sticker name="sparkle" size={71} />
            </Obj>
            <span className="absolute right-[14px] bottom-[13.5px] text-ink">
              <CollectionsAddIcon size={24} />
            </span>
          </div>
        </Obj>
        <Obj step="p-reply" id="toolbar">
          <div className="flex items-center gap-4 pr-1.5 text-ink">
            {(
              [
                ["sticker", <StickerIcon key="s" size={32} />, "Sticker"],
                ["voice", <MicAddIcon key="v" size={32} />, "Voice message"],
                ["video", <CameraIcon key="c" size={32} />, "Video"],
              ] as const
            ).map(([t, icon, label]) => (
              <button key={t} type="button" aria-label={label} aria-pressed={tool === t} onClick={() => pick(t)} className={cn("grid size-11 place-items-center rounded-[12px] transition-colors", tool === t && "bg-[#c8b880]")}>
                {icon}
              </button>
            ))}
          </div>
        </Obj>
      </div>
      <Obj step="p-reply" id="send" hint onTap={() => flow.go("p-sent")} className="relative rounded-[24px]">
        <ParentButton>Send to Noa</ParentButton>
      </Obj>
    </div>
  )
}

// ─── Reply sent ───
function ReplySent() {
  const flow = useFlow()
  const choice = useReplyChoice()
  const ref = useRef<HTMLDivElement>(null)
  const m = flow.script["p-sent"].objects.fly.motion
  useEffect(() => {
    if (!flow.animate) return
    const a = ref.current?.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
        { transform: "translate(10px, 30px) scale(0.92) rotate(-4deg)", opacity: 1, offset: 0.25 },
        { transform: "translate(160px, -620px) scale(0.3) rotate(24deg)", opacity: 0 },
      ],
      { duration: m.duration, delay: m.delay, easing: EASING[m.ease], fill: "both" },
    )
    return () => a?.cancel()
  }, [flow.run, flow.animate, m.duration, m.delay, m.ease])
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden bg-cream px-8 text-center">
      <Grain opacity={0.18} />
      {flow.animate && (
        <div ref={ref} className="pointer-events-none absolute" style={{ left: 37, top: 110 }}>
          <div className="flex h-[328px] w-[319px] flex-col items-center justify-center gap-4 rounded-[40px] border-2 border-periwinkle bg-paper">
            <span className="font-display text-[32px] text-teal uppercase">{choice.phrase}</span>
            <Sticker name={choice.sticker} size={180} tilt={-8} />
          </div>
        </div>
      )}
      <Obj step="p-sent" id="done">
        <span className="sticker grid size-24 place-items-center rounded-full bg-teal text-cream [--kiss:var(--sticker-orange)]">
          <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      </Obj>
      <Obj step="p-sent" id="text" className="flex flex-col items-center gap-3">
        <p className="font-display text-[34px] leading-none text-teal uppercase">Sent to Noa!</p>
        <p className="font-mono text-[16px] leading-[20px] font-medium text-gold">It pops up for Noa with a sound, next time the app is open.</p>
        <button type="button" onClick={() => flow.go("p-reply")} className="mt-2 font-mono text-[16px] text-orange underline underline-offset-4">
          Send another
        </button>
      </Obj>
    </div>
  )
}
