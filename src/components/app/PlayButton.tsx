/**
 * Figma "Sticker / Shape › Play" (M 80:4007 = 118px, S 77:2266 = 70px): an outer disc, an inner disc and the
 * rounded play glyph, with the Play's own lift (M: 0 2.08 4.17, S: 0 1.25 2.5, black 20%).
 * The players override the colours per surface; those overrides are the `tone` presets below.
 * When `playing`, the glyph becomes two pause bars in the glyph colour (not in Figma — a functional state).
 */
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type PlayTone = "teal" | "tealPaper" | "tealNotebook" | "periwinkle" | "orange"
const TONES: Record<PlayTone, { ring: string; face: string; glyph: string }> = {
  /** the component itself */
  teal: { ring: "var(--sticker-teal)", face: "var(--sticker-cream)", glyph: "var(--sticker-orange)" },
  /** Player · tablet, mobile blue large */
  tealPaper: { ring: "var(--sticker-teal)", face: "var(--sticker-paper)", glyph: "var(--sticker-orange)" },
  /** Player · mobile blue */
  tealNotebook: { ring: "var(--sticker-teal)", face: "var(--sticker-notebook)", glyph: "var(--sticker-orange)" },
  /** Player · mobile green */
  periwinkle: { ring: "var(--sticker-periwinkle)", face: "var(--sticker-cream)", glyph: "var(--sticker-orange)" },
  /** Parent.Mobile › share the moment / play */
  orange: { ring: "var(--sticker-orange)", face: "var(--sticker-orange)", glyph: "var(--sticker-paper)" },
}

const GEO = {
  M: { s: 118, inset: 9, glyph: { x: 40.4, y: 33.2 }, d: "M0 5.4C0 0 2.3-1.3 7.1 1.3L42.8 21.7C47.5 24.4 47.5 27.1 42.8 29.9L7.1 50.3C2.3 53 0 51.6 0 46.1Z", bar: { w: 12, h: 46 }, shadow: "0 2.08px 4.17px rgb(0 0 0 / 0.2)" },
  S: { s: 70, inset: 5, glyph: { x: 23.8, y: 19.7 }, d: "M0 3.2C0 0 1.4-0.8 4.2 0.7L25.3 12.8C28.1 14.4 28.1 16 25.3 17.7L4.2 29.7C1.4 31.3 0 30.5 0 27.3Z", bar: { w: 7, h: 27 }, shadow: "0 1.25px 2.5px rgb(0 0 0 / 0.2)" },
}

export function PlayButton({
  size = "M",
  tone = "teal",
  playing = false,
  className,
  type = "button",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { size?: "M" | "S"; tone?: PlayTone; playing?: boolean }) {
  const g = GEO[size]
  const c = TONES[tone]
  return (
    <button
      type={type}
      aria-label={playing ? "Pause" : "Play"}
      className={cn("relative shrink-0 rounded-full transition-transform active:scale-95", className)}
      style={{ width: g.s, height: g.s, filter: `drop-shadow(${g.shadow})` }}
      {...props}
    >
      <svg width={g.s} height={g.s} viewBox={`0 0 ${g.s} ${g.s}`} aria-hidden className="block">
        <circle cx={g.s / 2} cy={g.s / 2} r={g.s / 2} fill={c.ring} />
        <circle cx={g.s / 2} cy={g.s / 2} r={g.s / 2 - g.inset} fill={c.face} />
        {playing ? (
          <>
            <rect x={g.s / 2 - g.bar.w * 1.5} y={(g.s - g.bar.h) / 2} width={g.bar.w} height={g.bar.h} rx={g.bar.w / 2} fill={c.glyph} />
            <rect x={g.s / 2 + g.bar.w * 0.5} y={(g.s - g.bar.h) / 2} width={g.bar.w} height={g.bar.h} rx={g.bar.w / 2} fill={c.glyph} />
          </>
        ) : (
          <path d={g.d} transform={`translate(${g.glyph.x} ${g.glyph.y})`} fill={c.glyph} />
        )}
      </svg>
    </button>
  )
}
