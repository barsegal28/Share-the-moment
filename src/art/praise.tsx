/**
 * Praise stickers: Mom's sticker library on the reply screen, cut out of the reference sticker sheet
 * (Awesome · Good job · Amazing work · Wow · Egg-cellent · Super!). They keep their original colours, not the
 * app theme. Each is a transparent WebP at the sheet's size; <PraiseSticker> scales it to fit a square.
 */
import { cn } from "@/lib/utils"
import awesome from "./praise/awesome.webp"
import goodjob from "./praise/goodjob.webp"
import amazing from "./praise/amazing.webp"
import wow from "./praise/wow.webp"
import egg from "./praise/egg.webp"
import superSticker from "./praise/super.webp"

export const PRAISE_STICKERS = [
  { id: "goodjob", label: "Good job", src: goodjob, w: 178, h: 250, tilt: -4 },
  { id: "amazing", label: "Amazing work!", src: amazing, w: 185, h: 185, tilt: 6 },
  { id: "awesome", label: "Awesome", src: awesome, w: 295, h: 214, tilt: 0 },
  { id: "wow", label: "Wow", src: wow, w: 164, h: 120, tilt: -6 },
  { id: "egg", label: "Egg-cellent", src: egg, w: 237, h: 215, tilt: 4 },
  { id: "super", label: "Super!", src: superSticker, w: 336, h: 199, tilt: 0 },
] as const

export type PraiseId = (typeof PRAISE_STICKERS)[number]["id"]
export const PRAISE_IDS = PRAISE_STICKERS.map((s) => s.id) as PraiseId[]
export const praise = (id: PraiseId) => PRAISE_STICKERS.find((s) => s.id === id) ?? PRAISE_STICKERS[0]

/** A praise sticker fitted into a `size` × `size` box (its longer side = size), with the lifted-paper shadow. */
export function PraiseSticker({ id, size = 200, tilt, lift = true, className }: { id: PraiseId; size?: number; tilt?: number; lift?: boolean; className?: string }) {
  const s = praise(id)
  const k = size / Math.max(s.w, s.h)
  return (
    <span className={cn("inline-grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <img
        src={s.src}
        alt={s.label}
        draggable={false}
        width={Math.round(s.w * k)}
        height={Math.round(s.h * k)}
        className="block max-w-none select-none"
        style={{ transform: `rotate(${tilt ?? s.tilt}deg)`, filter: lift ? "drop-shadow(0 5px 6px rgb(0 0 0 / 0.2))" : undefined }}
      />
    </span>
  )
}
