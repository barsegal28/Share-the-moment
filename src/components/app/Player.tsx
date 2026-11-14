/**
 * Figma "Player" (100:8655): the kid's recording.
 *   tablet            — periwinkle-light, radius 60, padding 30/40, gap 32; Play M; title Title/Large teal,
 *                       meta Mono/XL gold, details gap 16; progress (media) with Mono/Medium timestamps.
 *   mobile-blue       — 357 wide, padding 20/30, gap 20; Play S; Title/Small teal, Mono/Medium gold, details gap 8;
 *                       compact progress (gap 8, Mono/Small).
 *   mobile-green      — as mobile-blue on teal: notebook title, cream meta and timestamps.
 *   mobile-blue-large — Play M, meta on two lines ("Frozen" / "Played by Noa").
 */
import { cn } from "@/lib/utils"
import { PlayButton, type PlayTone } from "./PlayButton"
import { ProgressBar } from "./ProgressBar"

export type PlayerSurface = "tablet" | "mobile-blue" | "mobile-green" | "mobile-blue-large"

const PLAY: Record<PlayerSurface, { size: "M" | "S"; tone: PlayTone }> = {
  tablet: { size: "M", tone: "tealPaper" },
  "mobile-blue": { size: "S", tone: "tealNotebook" },
  "mobile-green": { size: "S", tone: "periwinkle" },
  "mobile-blue-large": { size: "M", tone: "tealPaper" },
}

export interface PlayerProps {
  surface?: PlayerSurface
  title?: string
  from?: string
  by?: string
  /** 0–1 */
  progress?: number
  current?: string
  total?: string
  playing?: boolean
  onToggle?: () => void
  className?: string
}

export function Player({
  surface = "tablet",
  title = "Let it go",
  from = "Frozen",
  by = "Played by Noa",
  progress = 0.38,
  current = "0:34",
  total = "1:30",
  playing = false,
  onToggle,
  className,
}: PlayerProps) {
  const tablet = surface === "tablet"
  const green = surface === "mobile-green"
  const large = surface === "mobile-blue-large"
  return (
    <div
      className={cn(
        "flex items-center rounded-[60px]",
        green ? "bg-teal" : "bg-periwinkle-light",
        tablet ? "gap-8 px-10 py-[30px]" : "w-[357px] gap-5 px-[30px] py-5",
        className,
      )}
    >
      <PlayButton size={PLAY[surface].size} tone={PLAY[surface].tone} playing={playing} onClick={onToggle} />
      <div className={cn("flex flex-col items-start gap-5", tablet ? "w-[317px] shrink-0" : "min-w-px flex-1")}>
        <div className={cn("flex w-full flex-col items-start", tablet ? "gap-4" : "gap-2")}>
          <p className={cn("w-full", tablet ? "text-title-lg" : "text-title-sm", green ? "text-notebook" : "text-teal")}>{title}</p>
          {large ? (
            <>
              <p className="text-mono-md w-full text-gold">{from}</p>
              <p className="text-mono-md w-full text-gold">{by}</p>
            </>
          ) : (
            <p className={cn("w-full whitespace-nowrap", tablet ? "text-mono-xl" : "text-mono-md", green ? "text-cream" : "text-gold")}>
              {from} · {by}
            </p>
          )}
        </div>
        <ProgressBar kind="media" value={progress} start={current} end={total} compact={!tablet} tone={green ? "cream" : "gold"} className="w-full" />
      </div>
    </div>
  )
}
