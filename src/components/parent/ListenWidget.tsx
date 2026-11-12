import { useEffect, useRef, useState } from "react"
import { Pause, Sparkles } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { STAR_INFO, type StarKey } from "@/components/kid/StarScore"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { playRecording, RECORDING_SECONDS, stopRecording } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { DEMO_SONG } from "@/config"

/**
 * The parent's listen page: the kid's recording with its context — the song, the same three
 * star icons the kid saw (so the parent can praise something specific) and the effort story.
 * Mobile-first; adapts to larger screens.
 */
export interface ListenWidgetProps {
  kid?: string
  song?: string
  attempts?: number
  /** Already replied: shows the reply sent, and the parent can send another. */
  replied?: boolean
  onReply?: () => void
  className?: string
}

export function ListenWidget({ kid = "Noa", song = DEMO_SONG.title, attempts = 6, replied = false, onReply, className }: ListenWidgetProps) {
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const timer = useRef<number | null>(null)

  const stop = () => {
    stopRecording()
    if (timer.current) clearInterval(timer.current)
    setPlaying(false)
  }
  const toggle = () => {
    if (playing) return stop()
    setT(0)
    setPlaying(true)
    const started = performance.now()
    playRecording({ volume: 1, onEnd: () => { setPlaying(false); setT(RECORDING_SECONDS) } })
    timer.current = window.setInterval(() => setT(Math.min(RECORDING_SECONDS, (performance.now() - started) / 1000)), 100)
  }
  useEffect(() => () => stop(), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!playing && timer.current) clearInterval(timer.current) }, [playing])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

  return (
    <div className={cn("flex flex-col gap-6 px-6 pt-6 pb-8 text-ink", className)}>
      <div className="flex items-center gap-4">
        <Sticker name="kid" size={68} tilt={-6} />
        <div>
          <p className="text-sm font-semibold text-teal">Just for you</p>
          <h1 className="font-display text-[28px] leading-tight">{kid} played this for you</h1>
        </div>
      </div>

      {/* Player */}
      <div className="sticker rounded-[28px] bg-ink p-5 text-cream [--kiss:var(--sticker-orange)]">
        <div className="flex items-center gap-3">
          <Sticker name="piano" size={56} tilt={-4} lift={false} />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{song}</p>
            <p className="text-sm text-cream/70">Recorded today · audio only</p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={toggle}
            className="grid size-16 shrink-0 place-items-center rounded-full transition active:scale-95"
            aria-label={playing ? "Pause" : `Play ${kid}'s recording`}
          >
            {playing ? (
              <span className="grid size-16 place-items-center rounded-full bg-cream text-orange ring-[3px] ring-teal">
                <Pause className="size-7 fill-orange" />
              </span>
            ) : (
              <Sticker name="playS" size={64} lift={false} />
            )}
          </button>
          <div className="flex-1">
            <Progress value={(t / RECORDING_SECONDS) * 100} className="h-2.5 bg-cream/20" indicatorClassName="bg-orange" />
            <div className="mt-1.5 flex justify-between text-xs text-cream/60">
              <span>{fmt(t)}</span>
              <span>{fmt(RECORDING_SECONDS)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* What the stars mean */}
      <div>
        <p className="mb-3 text-sm font-semibold">3 stars — {kid} played it with no mistakes</p>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(STAR_INFO) as StarKey[]).map((k, i) => (
            <div key={k} className="flex flex-col items-center gap-2 rounded-2xl bg-muted px-2 py-3 text-center">
              <Sticker name={STAR_INFO[k].icon} size={44} tilt={i === 1 ? 6 : -6} lift={false} />
              <span className="text-[13px] leading-tight font-semibold">{STAR_INFO[k].voice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Effort story */}
      {attempts > 2 && (
        <div className="flex items-start gap-3 rounded-2xl bg-periwinkle/35 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-teal" />
          <p className="text-[15px] leading-snug">
            <b>It took {attempts} tries.</b> {kid} kept going on the tricky part in the middle until both hands were together.
          </p>
        </div>
      )}

      {replied && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-teal/30 p-3">
          <Sticker name="heart" size={40} lift={false} />
          <p className="text-sm">You sent a heart and a voice note. {kid} has heard it.</p>
        </div>
      )}

      <Button variant="sticker" tone="orange" className="h-16 rounded-[22px] text-xl" onClick={() => { stop(); onReply?.() }}>
        {replied ? "Send another surprise" : `Send ${kid} a surprise`}
      </Button>
      <p className="-mt-3 text-center text-xs text-ink/55">{kid} only hears it if you send something. There's no “not opened” signal on their side.</p>
    </div>
  )
}
