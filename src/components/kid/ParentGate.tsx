import { useEffect, useRef, useState } from "react"
import { Hand, Lock } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { KidButton } from "./KidButton"
import { Button } from "@/components/ui/button"
import { sfx, speak } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * "Ask a grown-up" — shown when no parent contact is set up.
 * A 6–9 year old shouldn't type an email, so a grown-up unlocks setup by pressing and holding.
 * Until then the recording waits on the "Ready to send" shelf.
 */
export interface ParentGateProps {
  holdMs?: number
  onUnlock?: () => void
  onLater?: () => void
  /** Start on the grown-up's side (after the hold). */
  unlocked?: boolean
  onAddFamily?: () => void
  voice?: boolean
  className?: string
}

export function ParentGate({ holdMs = 2000, onUnlock, onLater, unlocked = false, onAddFamily, voice = true, className }: ParentGateProps) {
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(unlocked)
  const raf = useRef<number | null>(null)
  const start = useRef(0)

  useEffect(() => {
    if (voice && !unlocked) void speak("Ask a grown-up to press and hold the lock.")
  }, [voice, unlocked])

  const tick = () => {
    const p = Math.min(1, (performance.now() - start.current) / holdMs)
    setProgress(p)
    if (p >= 1) {
      sfx.success()
      setOpen(true)
      onUnlock?.()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }
  const down = () => {
    sfx.tap()
    start.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }
  const up = () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    if (progress < 1) setProgress(0)
  }

  const R = 70
  const circ = 2 * Math.PI * R

  return (
    <div className={cn("absolute inset-0 z-40 grid place-items-center bg-ink/95", className)}>
      {!open ? (
        <div className="flex flex-col items-center gap-8 text-center">
          <p className="font-display text-6xl text-cream">Ask a grown-up!</p>
          <p className="max-w-md text-xl text-cream/80">Grown-ups: press and hold the lock to add family.</p>
          <button
            className="relative grid size-44 touch-none place-items-center rounded-full"
            onPointerDown={down}
            onPointerUp={up}
            onPointerLeave={up}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Grown-ups: press and hold to unlock"
          >
            <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
              <circle cx={80} cy={80} r={R} fill="var(--sticker-periwinkle)" />
              <circle cx={80} cy={80} r={R} fill="none" stroke="var(--sticker-cream)" strokeWidth={12} strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" />
            </svg>
            <Lock className="relative size-16 text-ink" strokeWidth={2.5} />
          </button>
          <KidButton tone="teal" size="kid" onClick={onLater}>
            <Hand /> Later
          </KidButton>
        </div>
      ) : (
        <div className="w-[560px] rounded-3xl bg-paper p-10 text-ink shadow-2xl" data-sheet="paper">
          <p className="text-sm font-semibold tracking-widest text-teal uppercase">For grown-ups</p>
          <h2 className="mt-2 text-3xl font-bold">Who should hear Noa play?</h2>
          <p className="mt-3 text-base opacity-75">
            Recordings go to the family you add here. Noa only chooses whether to share, never who receives it. You can change this any time in Settings.
          </p>
          <div className="mt-6 flex gap-3">
            {(["mom", "dad", "grandma"] as const).map((c) => (
              <div key={c} className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-ink/10 p-4">
                <Sticker name={c} size={64} lift={false} />
                <span className="text-sm font-semibold">+ Add {c === "mom" ? "Mom" : c === "dad" ? "Dad" : "Grandma"}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" size="lg" onClick={onLater}>Not now</Button>
            <Button size="lg" variant="secondary" onClick={onAddFamily}>Add family (demo)</Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Where a recording waits when there's no contact yet. */
export function ReadyShelf({ count = 1, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-full bg-muted py-2 pr-6 pl-2", className)}>
      <Sticker name="piano" size={64} tilt={-6} lift={false} />
      <div>
        <p className="font-display text-xl text-cream">Ready to send</p>
        <p className="text-sm text-cream/70">{count === 1 ? "1 song is waiting for a grown-up" : `${count} songs are waiting for a grown-up`}</p>
      </div>
    </div>
  )
}
