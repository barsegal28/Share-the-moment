import { useEffect, useState } from "react"
import { Sticker } from "@/art/stickers"
import { FamilyAvatars, type Contact } from "./FamilyAvatars"
import { sfx, speak } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * Transient overlay on the success screen: the recording flies to Mom and Dad as a shooting star.
 * No actions — it closes on its own.
 *
 * status
 * - sending: the paper plane flies along its trail
 * - sent:    avatars get a check, voice line "Mom and Dad will hear it soon!"
 * - offline: identical for the kid (queued, the app retries silently; failures only show in parent settings)
 */
export type SendStatus = "sending" | "sent" | "offline"

const FLIGHT = "M150 610 C 330 260, 560 760, 720 450 S 820 330, 860 320"

export interface SendOverlayProps {
  contacts?: Contact[]
  /** Drive the animation yourself (Storybook); omit to run sending → sent → onDone. */
  status?: SendStatus
  firstTime?: boolean
  onDone?: () => void
  /** Speak the voice lines (off in static stories). */
  voice?: boolean
  className?: string
}

export function SendOverlay({ contacts = ["mom", "dad"], status, firstTime = false, onDone, voice = true, className }: SendOverlayProps) {
  const [phase, setPhase] = useState<"sending" | "sent">(status === "sent" ? "sent" : "sending")
  const controlled = status !== undefined && onDone === undefined
  useEffect(() => {
    if (controlled) {
      setPhase(status === "sent" ? "sent" : "sending")
      return
    }
    sfx.whoosh()
    const t = window.setTimeout(async () => {
      setPhase("sent")
      sfx.chime()
      const who = contacts.includes("mom") && contacts.includes("dad") ? "Mom and Dad" : contacts.length === 1 ? (contacts[0] === "mom" ? "Mom" : contacts[0] === "dad" ? "Dad" : "Grandma") : "Your family"
      const started = Date.now()
      if (voice) {
        await speak(`${who} will hear it soon!`)
        if (firstTime) await speak("When they listen, they might send you a surprise!")
      }
      const left = 2200 - (Date.now() - started)
      window.setTimeout(() => onDone?.(), Math.max(400, left))
    }, 1700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const who = contacts.includes("mom") && contacts.includes("dad") ? "Mom & Dad" : "your family"

  return (
    <div className={cn("animate-in fade-in absolute inset-0 z-40 bg-ink/95 duration-300", className)} role="status" aria-live="polite">
      <svg viewBox="0 0 1180 820" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d={FLIGHT}
          fill="none"
          stroke="var(--sticker-cream)"
          strokeWidth={6}
          strokeDasharray="4 22"
          strokeLinecap="round"
          opacity={0.7}
          style={{ strokeDashoffset: 0, animation: phase === "sending" ? "draw-trail 1.7s ease-out both" : undefined }}
        />
      </svg>
      <style>{`
        @keyframes draw-trail { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
        @keyframes fly { from { offset-distance: 0% } to { offset-distance: 100% } }
      `}</style>

      <div className="absolute -translate-x-1/2" style={{ left: 880, top: 244 }}>
        <FamilyAvatars contacts={contacts} state={phase === "sent" ? "received" : "idle"} size={124} />
      </div>

      {phase === "sending" && (
        <div
          className="absolute top-0 left-0"
          style={{ offsetPath: `path("${FLIGHT}")`, offsetRotate: "auto 90deg", animation: "fly 1.7s cubic-bezier(.45,.05,.4,1) both" }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">
            <Sticker name="drippyComet" size={170} />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-3 text-center">
        <p className="font-display text-6xl text-cream">{phase === "sending" ? "Whoosh!" : `On its way to ${who}!`}</p>
        {status === "offline" && controlled && (
          <p className="text-base text-cream/60">(Offline: queued. The kid sees exactly the same thing; the app retries quietly.)</p>
        )}
      </div>
    </div>
  )
}
