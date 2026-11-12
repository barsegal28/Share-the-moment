import { useEffect } from "react"
import { Sticker, type StickerName } from "@/art/stickers"
import { sfx } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * The three stars, each standing for one part of a mistake-free performance.
 * They tell the kid *what* they got right, not just how many stars they earned.
 */
export type StarKey = "notes" | "beat" | "hands"
export const STAR_INFO: Record<StarKey, { icon: StickerName; label: string; voice: string; hint: string }> = {
  notes: { icon: "note", label: "Every note", voice: "Every note right!", hint: "Almost! Try every note." },
  beat: { icon: "drum", label: "On the beat", voice: "Right on the beat!", hint: "Almost! Try it on the beat." },
  hands: { icon: "hands", label: "Both hands", voice: "Both hands together!", hint: "Almost! Try both hands." },
}
const ORDER: StarKey[] = ["notes", "beat", "hands"]
const TILTS = [-10, 4, 12]
const STAR_ART = ["ratingStar1", "ratingStar2", "ratingStar3"] as const

export interface StarScoreProps {
  earned?: Partial<Record<StarKey, boolean>>
  /** Pop the stars in one by one, with a sound each. */
  animate?: boolean
  /** ms between stars */
  stagger?: number
  size?: "lg" | "md" | "sm"
  /** Show the label under each star. */
  labels?: boolean
  className?: string
}

export function StarScore({ earned = { notes: true, beat: true, hands: true }, animate = false, stagger = 650, size = "lg", labels = true, className }: StarScoreProps) {
  const px = size === "lg" ? 150 : size === "md" ? 104 : 56
  useEffect(() => {
    if (!animate) return
    const ids = ORDER.map((k, i) => window.setTimeout(() => (earned[k] ? sfx.star(i) : sfx.gentle()), 250 + i * stagger))
    return () => ids.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate])

  return (
    <div className={cn("flex items-end", size === "sm" ? "gap-4" : "gap-10", className)}>
      {ORDER.map((k, i) => {
        const got = earned[k] !== false
        const info = STAR_INFO[k]
        return (
          <div key={k} className="flex flex-col items-center gap-3" style={{ marginBottom: size !== "sm" && i === 1 ? px * 0.22 : 0 }}>
            <div className="relative">
              <Sticker
                name={got ? STAR_ART[i] : "starEmpty"}
                size={px}
                tilt={TILTS[i]}
                motion={animate ? "pop" : "none"}
                delay={animate ? 250 + i * stagger : 0}
                title={got ? `${info.label}: star earned` : `${info.label}: not yet`}
              />
              <Sticker
                name={info.icon}
                size={px * 0.42}
                tilt={-TILTS[i]}
                motion={animate ? "pop" : "none"}
                delay={animate ? 450 + i * stagger : 0}
                className="absolute -right-2 -bottom-2"
              />
            </div>
            {labels && (
              <span
                className={cn(
                  "font-display tracking-wide",
                  size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-xs",
                  got ? "text-cream" : "text-periwinkle",
                  animate && "animate-in fade-in fill-mode-both",
                )}
                style={animate ? { animationDelay: `${500 + i * stagger}ms` } : undefined}
              >
                {got ? info.label : info.hint}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
