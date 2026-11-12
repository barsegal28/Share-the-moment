import type { ReactNode } from "react"
import { ArrowRight, RotateCcw, X } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { Sheet } from "@/components/sticker/Sheet"
import { KidButton } from "./KidButton"
import { StarScore, type StarKey } from "./StarScore"
import { SharePrompt, type ShareVariant } from "./SharePrompt"
import { VoiceCaption } from "./VoiceCaption"
import { ReadyShelf } from "./ParentGate"
import type { Contact } from "./FamilyAvatars"
import { cn } from "@/lib/utils"

/**
 * The main "Share the moment" screen (iPad landscape, 1180 × 820).
 * Success → stars → share suggestion, with three actions: share, play again, next song.
 * Compact variants (habitual, quiet) put the share inline with the stars.
 */
export interface SuccessScreenProps {
  song?: string
  variant?: ShareVariant
  earned?: Partial<Record<StarKey, boolean>>
  contacts?: Contact[]
  /** Stars and prompt pop in (the live sequence). */
  animate?: boolean
  /** Show the share prompt (the live flow reveals it after the stars). */
  showShare?: boolean
  sent?: boolean
  shelf?: boolean
  attempts?: number
  onShare?: () => void
  onPlayAgain?: () => void
  onNextSong?: () => void
  onClose?: () => void
  /** Static caption for stories; the live flow uses the voice-over caption. */
  caption?: string
  /** Overlays (send animation, gate, reveal) and banners. */
  children?: ReactNode
  className?: string
}

const DECOR = [
  { name: "sparkle", x: 560, y: 92, s: 44, t: 10 },
  { name: "note", x: 1076, y: 196, s: 52, t: 14 },
] as const

export function SuccessScreen({
  song = "Twinkle Twinkle Little Star",
  variant = "first",
  earned,
  contacts = ["mom", "dad"],
  animate = false,
  showShare = true,
  sent = false,
  shelf = false,
  attempts = 6,
  onShare,
  onPlayAgain,
  onNextSong,
  onClose,
  caption,
  children,
  className,
}: SuccessScreenProps) {
  const compact = variant === "habitual" || variant === "quiet"

  return (
    <Sheet ground="ink" className={cn("h-[820px] w-[1180px] font-sans", className)}>
      {DECOR.map((d, i) => (
        <Sticker key={i} name={d.name} size={d.s} tilt={d.t} motion={animate ? "pop" : "none"} delay={2400 + i * 140} className="absolute" style={{ left: d.x, top: d.y }} />
      ))}

      {/* Top bar */}
      <div className="absolute inset-x-10 top-8 flex items-center justify-between">
        <div className="flex items-center gap-4 rounded-full bg-muted py-2 pr-6 pl-2">
          <Sticker name="piano" size={64} tilt={-6} lift={false} />
          <span className="text-xl font-semibold text-cream">{song}</span>
        </div>
        <KidButton tone="cream" size="kid-icon" className="size-16" onClick={onClose} aria-label="Close">
          <X className="size-7" />
        </KidButton>
      </div>

      {compact ? (
        <div className="absolute inset-x-0 top-[150px] flex flex-col items-center gap-10">
          <h1 className={cn("font-display text-[96px] leading-none text-cream", animate && "animate-pop-in")}>You did it!</h1>
          <StarScore earned={earned} animate={animate} size="md" />
          {showShare && (
            <SharePrompt variant={variant} contacts={contacts} sent={sent} onShare={onShare} className={cn(animate && "animate-in fade-in slide-in-from-bottom-4 duration-500")} />
          )}
        </div>
      ) : (
        <>
          <div className="absolute top-[150px] left-[72px] flex w-[560px] flex-col items-start gap-14">
            <h1 className={cn("font-display text-[120px] leading-[0.9] text-cream", animate && "animate-pop-in")}>
              You
              <br />
              did it!
            </h1>
            <StarScore earned={earned} animate={animate} size="lg" className="-ml-2" />
          </div>

          <div className="absolute top-[140px] right-[48px] bottom-[150px] flex w-[500px] items-center justify-center">
            {showShare &&
              (shelf ? (
                <div className="flex flex-col items-center gap-8">
                  <ReadyShelf />
                  <SharePrompt variant="noContact" onShare={onShare} />
                </div>
              ) : (
                <SharePrompt
                  variant={variant}
                  contacts={contacts}
                  sent={sent}
                  attempts={attempts}
                  onShare={onShare}
                  className={cn(animate && "animate-in fade-in zoom-in-75 duration-500")}
                />
              ))}
          </div>
        </>
      )}

      {/* Bottom actions: never blocked by the voice-over */}
      <div className="absolute inset-x-12 bottom-10 flex items-end justify-between gap-6">
        <KidButton tone="teal" size="kid" onClick={onPlayAgain}>
          <RotateCcw /> Play again
        </KidButton>
        <div className="flex min-h-16 flex-1 justify-center">
          <VoiceCaption static={caption ? { text: caption, voice: "guide" } : undefined} />
        </div>
        <KidButton tone="periwinkle" size="kid" onClick={onNextSong}>
          Next song <ArrowRight />
        </KidButton>
      </div>

      {children}
    </Sheet>
  )
}
