/**
 * Parent flow, phone web (Figma "Parent.Mobile", 393 × 650 content inside an iPhone + Safari shell).
 * SMS → listen page → listen sheet → send a surprise → sent.
 */
import { useEffect, useRef, useState, type ReactNode } from "react"
import { BatteryFull, ChevronLeft, ChevronRight, Lock, RotateCw, Signal, Wifi, BookOpen, Copy, Share } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { stopRecording } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { DEMO_SONG } from "@/config"
import { Obj } from "../Obj"
import { useFlow } from "../runtime"
import { ListenSheet, ParentSendBack, ParentShareMoment, type SendState } from "@/components/app"
import { LittlePianist, type LittlePianistHandle } from "@/components/app/parent/LittlePianist"
import { cancelLater, later } from "@/lib/clock"
import { fmt, replyChoice, useReplyChoice } from "../shared"
import type { StepId } from "../script"

export const PHONE = { w: 393, h: 852 }
const PARENT_STEPS: StepId[] = ["p-notify", "p-sms", "p-message", "p-listen", "p-reply", "p-sent"]
export const isParentStep = (s: StepId) => PARENT_STEPS.includes(s)

export function ParentScreens() {
  const flow = useFlow()
  const s = flow.step
  if (s === "p-notify") return <LockScreen />
  if (s === "p-sms") return <SmsThread />
  return (
    <PhoneChrome dark={s === "p-message" || s === "p-listen"}>
      {(s === "p-message" || s === "p-listen") && <MessagePage />}
      {s === "p-listen" && <ListenSheetStep />}
      {s === "p-reply" && <ReplyComposer />}
      {s === "p-sent" && <ReplySent />}
    </PhoneChrome>
  )
}

// ─── iPhone + Safari shell (Figma annotation: "add iphone mobile browser shell") ───
function StatusBar({ light }: { light?: boolean }) {
  return (
    <div className={cn("font-ios flex h-[54px] items-center justify-between px-8 pt-1 text-[17px] font-semibold", light ? "text-white" : "text-black")}>
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
    <div className="relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-[#f2f2f7] font-ios">
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
    <div className="relative h-[852px] w-[393px] overflow-hidden font-ios text-white" style={{ background: "linear-gradient(160deg, #8ba1ef 0%, #ec70bb 55%, #fd6117 120%)" }}>
      <StatusBar light />
      <Obj step="p-notify" id="clock" className="absolute inset-x-0 top-[96px] text-center">
        <p className="text-[19px] font-semibold opacity-90">Friday, November 13</p>
        <p className="text-[96px] leading-none font-bold tracking-tight">14:05</p>
      </Obj>
      <Obj step="p-notify" id="notif" hint onTap={() => flow.go("p-sms")} className="absolute rounded-[22px]" style={{ left: 10, top: 300, width: 373 }}>
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
              🎹 Noa just got 3 stars on “{DEMO_SONG.title}” and wants you to hear it! Tap to listen. You can send a little surprise back.
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

// ─── The SMS thread (Messages app) ───
function SmsThread() {
  const flow = useFlow()
  return (
    <div className="relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-white font-ios text-black">
      <StatusBar />
      <Obj step="p-sms" id="header" className="border-b border-black/10 bg-[#f6f6f6]/90 pb-2">
        <div className="relative flex flex-col items-center gap-1 pt-1">
          <ChevronLeft className="absolute top-3 left-2 size-8 text-[#0a84ff]" />
          <span className="grid size-[54px] place-items-center rounded-full bg-gradient-to-b from-[#b4b4bb] to-[#8e8e93]">
            <Sticker name="ratingStar1" size={40} lift={false} />
          </span>
          <span className="flex items-center gap-0.5 text-[12px]">
            Piano Pals <ChevronRight className="size-3 text-black/40" />
          </span>
        </div>
      </Obj>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4">
        <p className="mb-2 text-center text-[11px] text-black/45">
          <span className="font-semibold">Text Message</span> · Today 14:05
        </p>
        <Obj step="p-sms" id="bubble" className="max-w-[78%]">
          <p className="rounded-[18px] rounded-bl-[4px] bg-[#e9e9eb] px-3 py-2 text-[16px] leading-snug">
            🎹 Noa just got 3 stars on “{DEMO_SONG.title}” and wants you to hear it! Tap to listen. You can send a little surprise back.
          </p>
        </Obj>
        <Obj step="p-sms" id="link" hint onTap={() => flow.go("p-message")} className="w-[78%] rounded-[18px]">
          <div className="overflow-hidden rounded-[18px] rounded-bl-[4px] bg-[#e9e9eb]">
            {/* The listen page's hero (Figma Parent.Mobile 1, top 393 × 250), scaled into the preview. */}
            <div className="relative h-[184px] overflow-hidden bg-pink">
              <div className="absolute top-0 left-0 h-[250px] w-[393px] origin-top-left" style={{ transform: "scale(0.733)" }}>
                <svg className="absolute top-0 left-0" width={393} height={250} viewBox="0 0 393 250" aria-hidden style={{ filter: "drop-shadow(0 5px 5px rgb(0 0 0 / 0.2))" }}>
                  <path d="M-24 88.5 L464 270 V300 H-24 Z" fill="var(--sticker-cream)" />
                </svg>
                <span className="absolute" style={{ left: 47, top: 26 }}><Sticker name="cloudComet" size={182} tilt={-8} /></span>
                <span className="absolute" style={{ left: 251, top: 28 }}><Sticker name="sparkle" size={86} tilt={12} /></span>
                <span className="absolute" style={{ left: 219, top: 105 }}><Sticker name="burst" size={151} tilt={10} /></span>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-[15px] leading-tight font-semibold">Listen to Noa play “{DEMO_SONG.title}”</p>
              <p className="text-[13px] text-black/50">pianopals.app</p>
            </div>
          </div>
        </Obj>
      </div>
      <div className="flex items-center gap-2 px-3 pb-8">
        <span className="grid size-9 place-items-center rounded-full bg-[#e9e9eb] text-[22px] leading-none text-black/50">+</span>
        <span className="flex h-9 flex-1 items-center rounded-full border border-black/15 px-3 text-[15px] text-black/35">Text Message</span>
      </div>
      <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black" />
    </div>
  )
}

// ─── Listen to your kid · Figma Parent.Mobile "share the moment" ───
/** Wraps a component part in an editable, animated object of this step. */
const objSlot = (step: StepId, opts: Record<string, { onTap?: () => void; hint?: boolean; className?: string }> = {}) =>
  (part: string, node: ReactNode) => (
    <Obj key={part} step={step} id={part} onTap={opts[part]?.onTap} hint={opts[part]?.hint} className={opts[part]?.className}>
      {node}
    </Obj>
  )

function MessagePage() {
  const flow = useFlow()
  const listened = flow.seen("p-listen")
  return (
    <div className="absolute inset-0">
      <ParentShareMoment
        slot={objSlot("p-message", {
          paper: { className: "absolute inset-0" },
          song: { onTap: () => flow.go("p-listen"), hint: !listened, className: "rounded-[60px]" },
          sendBack: { onTap: () => flow.go("p-reply"), hint: listened, className: "rounded-[24px]" },
        })}
      />
    </div>
  )
}

// ─── Listen widget · Figma Parent.Mobile "play" (bottom sheet) ───
function ListenSheetStep() {
  const flow = useFlow()
  // Mom's player: "Little Pianist" plays the take with its own piano sound, and drives the sheet's progress.
  const pianist = useRef<LittlePianistHandle>(null)
  const [state, setState] = useState({ t: 0, end: 0, playing: false })
  useEffect(() => {
    stopRecording()
    const start = later(() => pianist.current?.play(), 350) // after the sheet slides up; Mom's tap allows sound
    let raf = 0
    const poll = () => {
      const p = pianist.current
      if (p) setState((s) => (Math.abs(s.t - p.time) > 0.05 || s.playing !== p.playing || s.end !== p.end ? { t: p.time, end: p.end, playing: p.playing } : s))
      raf = requestAnimationFrame(poll)
    }
    raf = requestAnimationFrame(poll)
    return () => {
      cancelLater(start)
      cancelAnimationFrame(raf)
    }
  }, [flow.run])
  const toggle = () => (state.playing ? pianist.current?.pause() : pianist.current?.play())
  const close = () => {
    pianist.current?.pause()
    flow.go("p-message")
  }
  const end = state.end || 1
  return (
    <>
      <div className="absolute inset-0" onClick={close} />
      <Obj step="p-listen" id="sheet" className="absolute inset-0 pointer-events-none" innerClassName="[&>*]:pointer-events-auto">
        <ListenSheet
          cover={<LittlePianist ref={pianist} className="absolute inset-x-0 top-0" />}
          progress={Math.min(1, Math.max(0, state.t) / end)}
          current={fmt(Math.max(0, Math.min(state.t, end)))}
          total={fmt(state.end)}
          playing={state.playing}
          onPlay={toggle}
          onClose={close}
          slot={objSlot("p-listen", { cover: { className: "w-full" }, playback: { className: "w-full" } })}
        />
      </Obj>
    </>
  )
}

// ─── Send Noa a surprise · Figma Parent.Mobile "send back" ───
function ReplyComposer() {
  const flow = useFlow()
  const choice = useReplyChoice()
  return (
    <div className="absolute inset-0">
      <ParentSendBack
        message={choice.index.text ?? choice.phrase}
        onMessage={(text) => replyChoice.set({ text })}
        sticker={choice.sticker}
        onSticker={() => replyChoice.set({ sticker: choice.index.sticker + 1 })}
        slot={objSlot("p-reply", { send: { onTap: () => flow.go("p-sent"), hint: true, className: "rounded-[24px]" }, back: { onTap: () => flow.go("p-message"), className: "rounded-[12px]" }, header: { className: "w-full" } })}
      />
    </div>
  )
}

// ─── Reply sent · Figma Parent.Mobile 187:9339 (send confirmation) ───
/** The composer stays; "Send to Noa" spins, then the check pops in and it reads "Sent". */
function ReplySent() {
  const flow = useFlow()
  const choice = useReplyChoice()
  const spinMs = flow.script["p-sent"].params.spinMs ?? 1100
  const [state, setState] = useState<SendState>(flow.animate ? "sending" : "sent")
  useEffect(() => {
    if (!flow.animate) return setState("sent")
    setState("sending")
    const t = later(() => setState("sent"), spinMs)
    return () => cancelLater(t)
  }, [flow.run, flow.animate, spinMs])
  return (
    <div className="absolute inset-0">
      <ParentSendBack message={choice.index.text ?? choice.phrase} sticker={choice.sticker} sendState={state} />
    </div>
  )
}
