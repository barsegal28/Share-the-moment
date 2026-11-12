import { useEffect, useState } from "react"
import { Play, RotateCcw, ArrowRight } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { KidButton } from "./KidButton"
import { sfx, speak, stopSpeech } from "@/lib/audio"
import { NAMES, type Reply } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * The reply reveal: the parent's sticker animates in and their voice message plays.
 * Several replies play one after another as a queue ("3 surprises!").
 */
export interface ReplyRevealProps {
  reply: Reply
  index?: number
  total?: number
  /** Auto-play the sound and voice (off in static stories). */
  autoplay?: boolean
  onNext?: () => void
  onDone?: () => void
  className?: string
}

const CONFETTI = [
  { name: "sparkle", x: 120, y: 120, s: 60, t: -12 },
  { name: "star", x: 980, y: 110, s: 80, t: 14 },
  { name: "note", x: 160, y: 560, s: 76, t: 10 },
  { name: "sparkle", x: 1010, y: 540, s: 52, t: 8 },
  { name: "heart", x: 300, y: 300, s: 48, t: -6 },
] as const

export function ReplyReveal({ reply, index = 0, total = 1, autoplay = true, onNext, onDone, className }: ReplyRevealProps) {
  const [speaking, setSpeaking] = useState(false)
  const play = async () => {
    stopSpeech()
    setSpeaking(true)
    await speak(reply.message, reply.from)
    setSpeaking(false)
  }
  useEffect(() => {
    if (!autoplay) return
    sfx.chime()
    const t = window.setTimeout(play, 1100)
    return () => { clearTimeout(t); stopSpeech() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reply, autoplay])

  const last = index >= total - 1
  return (
    <div className={cn("animate-in fade-in absolute inset-0 z-40 overflow-hidden bg-ink/92 duration-300", className)}>
      {CONFETTI.map((c, i) => (
        <Sticker key={i} name={c.name} size={c.s} tilt={c.t} motion="pop" delay={300 + i * 120} className="absolute" style={{ left: c.x, top: c.y }} />
      ))}

      {total > 1 && (
        <div className="absolute top-8 left-1/2 flex -translate-x-1/2 gap-3" aria-label={`Surprise ${index + 1} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={cn("size-4 rounded-full", i <= index ? "bg-orange" : "bg-cream/30")} />
          ))}
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-20 px-20">
        <Sticker name={reply.sticker} size={330} tilt={-8} motion="pop" delay={150} />

        <div className="flex max-w-[460px] flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <Sticker name={reply.from} size={104} tilt={6} motion="pop" delay={500} />
            <p className="font-display text-5xl text-cream">From {NAMES[reply.from]}!</p>
          </div>
          <button
            onClick={() => { sfx.tap(); void play() }}
            className="sticker flex w-full items-center gap-4 rounded-[32px] bg-cream p-4 text-ink [--kiss:var(--sticker-orange)] active:sticker-pressed"
            aria-label={`Play ${NAMES[reply.from]}'s message`}
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-orange">
              <Play className="size-8 fill-ink" />
            </span>
            <Waveform active={speaking} />
          </button>
          <p className="text-sm text-cream/60">for your “{reply.song}”</p>
        </div>
      </div>

      <div className="absolute right-12 bottom-10 flex gap-6">
        <KidButton tone="teal" size="kid-icon" onClick={() => void play()} aria-label="Hear it again">
          <RotateCcw />
        </KidButton>
        <KidButton tone="orange" size="kid" onClick={() => { stopSpeech(); if (last) onDone?.(); else onNext?.() }}>
          {last ? "Yay!" : "Next surprise"} <ArrowRight />
        </KidButton>
      </div>
    </div>
  )
}

function Waveform({ active }: { active: boolean }) {
  const bars = [10, 22, 34, 18, 40, 28, 14, 36, 24, 44, 20, 30, 12, 26, 38, 16, 30, 22]
  return (
    <span className="flex h-12 flex-1 items-center gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn("w-2 rounded-full bg-teal", active && "animate-pulse")}
          style={{ height: h, animationDelay: `${(i % 6) * 120}ms` }}
        />
      ))}
    </span>
  )
}
