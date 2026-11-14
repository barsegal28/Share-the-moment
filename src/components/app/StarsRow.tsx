/**
 * The three rating stars.
 *   L — main card "Stars" (70:3390): 142.4px stars tilted −8° / 4° / 10°, each in its rotated bounding box
 *       (160.8 / 152 / 165), overlapping by 10px.
 *   S — "Stars" (187:3404): 62px stars, tilted 13.3° / 4° / 25.2°, overlapping by 4px.
 */
import { Sticker } from "@/art/stickers"
import { cn } from "@/lib/utils"

const L = [
  { name: "ratingStar1", rot: -8, box: 160.832 },
  { name: "ratingStar2", rot: 4, box: 151.986 },
  { name: "ratingStar3", rot: 10, box: 164.964 },
] as const
const S = [
  { name: "ratingStar1", rot: 13.3, box: 74 },
  { name: "ratingStar2", rot: 4, box: 66 },
  { name: "ratingStar3", rot: 25.2, box: 82 },
] as const

export function StarsRow({
  size = "L",
  renderStar,
  className,
}: {
  size?: "L" | "S"
  /** Wrap each star (for motion). Gets the star element and its index. */
  renderStar?: (star: React.ReactNode, i: number) => React.ReactNode
  className?: string
}) {
  const rows = size === "L" ? L : S
  const px = size === "L" ? 142.4 : 62
  return (
    <div className={cn("flex items-center", className)}>
      {rows.map((s, i) => {
        const star = (
          <div className={cn("grid shrink-0 place-items-center", i < 2 && (size === "L" ? "-mr-2.5" : "-mr-1"))} style={{ width: s.box, height: s.box }}>
            <Sticker name={s.name} size={px} tilt={s.rot} />
          </div>
        )
        return <div key={i} className="contents">{renderStar ? renderStar(star, i) : star}</div>
      })}
    </div>
  )
}
