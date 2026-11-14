/**
 * Figma "share illustration" (main › share › FRE, 187:3610), 538 × 352: Mom's planet (ringed, eyelashes,
 * gold kiss-cut) listening to the kid's small planet (mirrored), with a quarter note and eighth notes between.
 * Positions are the Figma frame's; each piece can be wrapped for motion.
 */
import type { ReactNode } from "react"
import { Sticker } from "@/art/stickers"
import { cn } from "@/lib/utils"

export type SharePiece = "mom" | "kid" | "note1" | "note2"
const same = (_: SharePiece, n: ReactNode) => n

export function ShareIllustration({ piece = same, className }: { piece?: (id: SharePiece, node: ReactNode) => ReactNode; className?: string }) {
  return (
    <div className={cn("relative h-[352px] w-[538px] shrink-0", className)}>
      <div className="absolute top-12 left-[235px] h-[270px] w-[279px]">
        {piece("mom", <div className="absolute top-0 left-6"><Sticker name="momPlanet" size={270} /></div>)}
      </div>
      <div className="absolute top-[204px] left-0 h-[148px] w-[153px]">
        {piece("kid", <div className="absolute top-0 left-[0.07px] -scale-x-100"><Sticker name="kidPlanet" size={148} /></div>)}
      </div>
      <div className="absolute top-32 left-[18px] size-[99px]">{piece("note1", <Sticker name="quarterNote" size={99} />)}</div>
      <div className="absolute top-[110px] left-[108px] size-[99px]">{piece("note2", <Sticker name="eighthNotes" size={99} />)}</div>
    </div>
  )
}
