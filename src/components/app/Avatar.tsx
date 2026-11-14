/**
 * Figma "Avatars" (187:5349): a character from "Sticker / Avatar" (192:2600) on a round paper tile.
 *   tile S — 50px tile, the character at 45px (left 2, top 3)
 *   tile L — 120px tile, padding 1, the character at 120px
 *   peep S — 50px tile, the character at 45×46, centred, clipped by the tile (peeking)
 *   peep L — 120px tile (radius 237.6), the character at 108×110, centred
 */
import { Sticker } from "@/art/stickers"
import { cn } from "@/lib/utils"

export type AvatarCharacter = "wisp" | "gummy" | "cone" | "leaf"
const ART = { wisp: "avatarWisp", gummy: "avatarGummy", cone: "avatarCone", leaf: "avatarLeaf" } as const

export function Avatar({
  character = "cone",
  type = "tile",
  size = "S",
  label,
  className,
}: {
  character?: AvatarCharacter
  type?: "tile" | "peep"
  size?: "S" | "L"
  label?: string
  className?: string
}) {
  const L = size === "L"
  const art = <Sticker name={ART[character]} size={L ? (type === "peep" ? 108 : 120) : 45} lift={false} title={label} />
  if (type === "peep")
    return (
      <div className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-paper", L ? "size-[120px]" : "size-[50px]", className)}>
        <div className={L ? "h-[110px] w-[108px]" : "h-[46px] w-[45px]"}>{art}</div>
      </div>
    )
  return (
    <div className={cn("relative shrink-0 rounded-full bg-paper", L ? "flex size-[120px] items-center p-px" : "size-[50px]", className)}>
      <div className={L ? "" : "absolute top-[3px] left-[2px]"}>{art}</div>
    </div>
  )
}
