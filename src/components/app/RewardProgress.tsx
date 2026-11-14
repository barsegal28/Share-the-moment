/**
 * Figma "Reward progress/Dark" (68:1660): "18/25 · Level 2" over a 214px stage progress bar.
 * Padding 12 / 18 / 12 / 14, gap 14, radius 22. The component sits on an ink tile (126 tall) with a
 * system-white 8% surface; the instance in the kid background is 78 tall and has no fill of its own.
 */
import { cn } from "@/lib/utils"
import { ProgressBar } from "./ProgressBar"

export function RewardProgress({
  count = 18,
  total = 25,
  level = 2,
  progress = 144 / 214,
  tile = false,
  className,
}: {
  /** Fill of the bar, 0–1. Figma: 144 of 214px at 18/25. */
  progress?: number
  count?: number
  total?: number
  level?: number
  /** The standalone component: ink fill, 126 tall. Off = the 78-tall instance used on the kid background. */
  tile?: boolean
  className?: string
}) {
  return (
    <div className={cn("relative flex items-center gap-3.5 rounded-[22px] py-3 pr-[18px] pl-3.5", tile ? "h-[126px] bg-ink" : "h-[78px]", className)}>
      {tile && <div aria-hidden className="absolute inset-0 rounded-[22px] bg-system-white opacity-[0.08]" />}
      <div className="relative flex flex-col items-start justify-center gap-1">
        <p className="text-mono-lg whitespace-nowrap text-white">
          {count}/{total} · Level {level}
        </p>
        <div className="relative h-10 w-[214px]">
          <ProgressBar kind="stage" value={progress} className="absolute top-3.5 left-0 w-[214px] [&>div]:transition-[width] [&>div>div]:transition-[width] [&>div>div]:duration-700" />
        </div>
      </div>
    </div>
  )
}
