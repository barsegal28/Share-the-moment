import { Check, Hand, Send } from "lucide-react"
import { FamilyAvatars, type Contact } from "./FamilyAvatars"
import { KidButton } from "./KidButton"
import { cn } from "@/lib/utils"

/**
 * The "Share the moment" prompt. It changes with the kid's history so it feels special
 * early on and never becomes noise. The kid only decides *whether* to share, never with whom.
 *
 * - first:    full onboarding moment, avatars wave, highlighted button
 * - early:    shares 2–5 — same layout, no coaching line
 * - habitual: ~5+ shares — compact, inline, no big animation
 * - better:   already shared this song, played it better now
 * - struggle: 3 stars after many tries — strongest prompt
 * - quiet:    skipped 3 times in a row — a quiet button, never removed
 * - noContact: no grown-up set up yet — "Ask a grown-up"
 */
export type ShareVariant = "first" | "early" | "habitual" | "better" | "struggle" | "quiet" | "noContact"

export interface SharePromptProps {
  variant?: ShareVariant
  contacts?: Contact[]
  /** The share went out: avatars show a check, the button becomes a "Sent" chip. */
  sent?: boolean
  attempts?: number
  onShare?: () => void
  className?: string
}

export function SharePrompt({ variant = "first", contacts = ["mom", "dad"], sent = false, attempts = 6, onShare, className }: SharePromptProps) {
  const who = contacts.length === 2 && contacts.includes("mom") && contacts.includes("dad") ? "Mom & Dad" : contacts.length > 1 ? "family" : contacts[0] === "mom" ? "Mom" : contacts[0] === "dad" ? "Dad" : "Grandma"

  if (sent) {
    return (
      <div className={cn("flex flex-col items-center gap-6", className)}>
        <FamilyAvatars contacts={contacts} state="received" size={variant === "habitual" ? 76 : 112} />
        <span className="font-display flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-2xl text-cream">
          <Check className="size-7" strokeWidth={4} /> Sent to {who}!
        </span>
      </div>
    )
  }

  if (variant === "quiet") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <FamilyAvatars contacts={contacts} size={56} />
        <KidButton tone="cream" size="kid" onClick={onShare} className="h-16 px-7 text-2xl">
          <Send /> Share
        </KidButton>
      </div>
    )
  }

  if (variant === "habitual") {
    return (
      <div className={cn("flex items-center gap-6", className)}>
        <FamilyAvatars contacts={contacts} size={76} />
        <KidButton tone="orange" size="kid" onClick={onShare} aria-label={`Send to ${who}`}>
          <Send /> Send
        </KidButton>
      </div>
    )
  }

  if (variant === "noContact") {
    return (
      <div className={cn("flex flex-col items-center gap-7", className)}>
        <div className="flex items-center gap-4">
          <div className="grid size-28 place-items-center rounded-full border-4 border-dashed border-cream/50 text-5xl text-cream/70" aria-hidden>
            ?
          </div>
        </div>
        <KidButton tone="periwinkle" size="kid-lg" onClick={onShare}>
          <Hand /> Ask a grown-up
        </KidButton>
      </div>
    )
  }

  const banner =
    variant === "better" ? "Even better than last time!" : variant === "struggle" ? `You did it after ${attempts} tries!` : null

  return (
    <div className={cn("flex flex-col items-center gap-7", className)}>
      {banner && (
        <span className="font-display animate-pop-in -rotate-2 rounded-2xl bg-pink px-5 py-2 text-2xl text-ink [--tilt:-2deg]">{banner}</span>
      )}
      <FamilyAvatars contacts={contacts} state={variant === "first" || variant === "struggle" ? "waving" : "idle"} size={variant === "first" ? 124 : 112} />
      <KidButton
        tone="orange"
        size="kid-lg"
        onClick={onShare}
        className={cn(variant === "first" && "animate-wiggle")}
        aria-label={`Send to ${who}`}
      >
        <Send /> {variant === "better" ? "Send the new one" : `Send to ${who}`}
      </KidButton>
      {variant === "first" && <p className="max-w-[360px] text-center text-lg text-cream/80">They can send you a surprise back!</p>}
    </div>
  )
}
