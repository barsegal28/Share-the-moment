import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

export type StickerColor = "cream" | "orange" | "teal" | "periwinkle" | "pink" | "ink" | "gold"
export const stickerVar = (c: StickerColor) => `var(--sticker-${c})`

export type StickerMotion = "none" | "pop" | "float" | "wiggle"

export interface StickerArtProps {
  /** SVG children, drawn flat in the palette. The die-cut is generated from their silhouette. */
  children: ReactNode
  /** viewBox width/height of the art. */
  viewBox?: [number, number]
  /** Rendered width in px. Height follows the viewBox ratio. */
  size?: number
  /** Tilt in degrees. Stickers sit at about ±15°. */
  tilt?: number
  /** Kiss-cut edge colour — pick one that contrasts with the art. */
  kiss?: StickerColor
  /** Lift shadow; turn off for stickers drawn on a card. */
  lift?: boolean
  motion?: StickerMotion
  /** Animation delay in ms (for staggered pop-ins). */
  delay?: number
  className?: string
  style?: CSSProperties
  title?: string
}

/**
 * A die-cut vinyl sticker from flat SVG art.
 * Every object gets a 9px cream border following its silhouette, a 3.5px coloured
 * kiss-cut edge outside it, and a soft lift: 7px down, 5px blur, 38% black (20% on light sheets).
 */
export function StickerArt({
  children,
  viewBox = [100, 100],
  size = 120,
  tilt = 0,
  kiss = "teal",
  lift = true,
  motion = "none",
  delay = 0,
  className,
  style,
  title,
}: StickerArtProps) {
  const [w, h] = viewBox
  const unit = w / size // viewBox units per px
  const border = 9 * unit
  const kissW = 3.5 * unit
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn(
        "inline-block shrink-0 select-none",
        motion === "pop" && "animate-pop-in",
        motion === "float" && "animate-float",
        motion === "wiggle" && "animate-wiggle",
        className,
      )}
      style={{
        width: size,
        height: (size * h) / w,
        transform: `rotate(${tilt}deg)`,
        ["--tilt" as string]: `${tilt}deg`,
        animationDelay: delay ? `${delay}ms` : undefined,
        filter: lift ? "drop-shadow(0 7px 2.5px rgb(0 0 0 / var(--sticker-shadow)))" : undefined,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height="100%"
        overflow="visible"
        style={
          {
            "--st-kiss": stickerVar(kiss),
            "--st-kw": 2 * (border + kissW),
            "--st-bw": 2 * border,
          } as CSSProperties
        }
      >
        <g className="st-kiss">{children}</g>
        <g className="st-border">{children}</g>
        <g>{children}</g>
      </svg>
    </span>
  )
}
