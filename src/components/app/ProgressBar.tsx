/**
 * Figma "Progress.bar" (92:7906).
 *   media — 18px track in system-white, pink fill, timestamps underneath (Mono/Medium gold, gap 12).
 *           In the mobile players the gap is 8 and the timestamps are Mono/Small (an instance override);
 *           on the green player they are cream.
 *   stage — 12px track in notebook 40%, notebook fill, no timestamps (Reward progress).
 *   scrub — the parent's bottom sheet: 9px track in system-white 40%, system-white fill, an 18px scrubber
 *           knob (Snip/Lifted grain: 0 5 10 black 22%), Mono/Small timestamps, gap 8.
 */
import { cn } from "@/lib/utils"

export type ProgressKind = "media" | "stage" | "scrub"

export function ProgressBar({
  kind = "media",
  value,
  start,
  end,
  compact = false,
  tone = "gold",
  className,
}: {
  kind?: ProgressKind
  /** 0–1 */
  value: number
  /** Left timestamp (media, scrub). */
  start?: string
  /** Right timestamp (media, scrub). */
  end?: string
  /** Mobile-player instance: gap 8, Mono/Small timestamps. */
  compact?: boolean
  /** Timestamp colour: gold, or cream on the green player. */
  tone?: "gold" | "cream"
  className?: string
}) {
  const v = Math.max(0, Math.min(1, value))
  const timestamps = kind !== "stage" && (start !== undefined || end !== undefined)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn("flex w-[296px] flex-col items-center", kind === "media" && !compact ? "gap-3" : "gap-2", className)}
    >
      <div
        className={cn(
          "relative w-full shrink-0 rounded-full",
          kind === "media" && "h-[18px] overflow-hidden bg-system-white",
          kind === "stage" && "h-3 overflow-hidden bg-notebook/40",
          kind === "scrub" && "h-[9px] bg-system-white/40",
        )}
      >
        <div
          className={cn("h-full rounded-full", kind === "media" ? "bg-pink" : kind === "stage" ? "bg-notebook" : "bg-system-white")}
          style={{ width: `${v * 100}%` }}
        />
        {kind === "scrub" && (
          <span
            aria-hidden
            className="absolute top-[-4.5px] size-[18px] -translate-x-1/2 rounded-full bg-system-white shadow-[0_5px_10px_rgb(0_0_0/0.22)]"
            style={{ left: `${v * 100}%` }}
          />
        )}
      </div>
      {timestamps && (
        <div
          className={cn(
            "flex w-full items-center justify-between whitespace-nowrap",
            kind === "media" && !compact ? "text-mono-md" : "text-mono-sm",
            tone === "cream" ? "text-cream" : "text-gold",
          )}
        >
          <span>{start}</span>
          <span>{end}</span>
        </div>
      )}
    </div>
  )
}
