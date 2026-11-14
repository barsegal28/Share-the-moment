/**
 * Mom's reply, inside the kid's app (Figma "app asets" › screens › "notification" 212:14829 and
 * "message from mom" 212:13507).
 *   ReplyNotification (212:14716) — 462 × 124 paper banner, 2px periwinkle border, radius 20, lifted paper
 *                                   shadow; Mom's avatar (Wisp, Peep M on a #C0CDFB tile) + "A surprise from mom!"
 *                                   (Mono XL, orange) over "Tap to open" (Mono Medium, ink), gap 20.
 *   SurpriseLabel                 — the small line above the card: Mom's avatar (Peep S) + the same words in cream.
 *   MomMessageCard (212:14616)    — 620 × 538 paper card, radius 60, padding 80/16/40, gap 40: Mom's words as
 *                                   die-cut lettering, her sticker (265 × 199 slot), Continue; Close at 24/24.
 */
import type { ReactNode } from "react"
import { RisoGrain } from "@/components/sticker/Sheet"
import { Sticker } from "@/art/stickers"
import { PraiseSticker, type PraiseId } from "@/art/praise"
import { cn } from "@/lib/utils"
import { Avatar } from "./Avatar"
import { BUTTON_ICON_SIZE, Button, IconButton } from "./Button"
import { ArrowRightIcon, DismissIcon } from "./icons"
import { Lettering } from "./Lettering"

type Slot = (part: string, node: ReactNode) => ReactNode
const same: Slot = (_, n) => n

const LIFTED = "0 5px 10px rgb(0 0 0 / 0.2)"

/** Mom's avatar, Peep M: the Wisp in teal on a 90px periwinkle-light tile. */
function MomPeep() {
  return (
    <div className="grid h-[90px] w-[89px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#c0cdfb]">
      <div className="h-[71.3px] w-[70px]">
        <Sticker name="avatarMom" size={70.2} lift={false} title="Mom" />
      </div>
    </div>
  )
}

export function ReplyNotification({ title = "A surprise from mom!", sub = "Tap to open", onClick, className }: { title?: string; sub?: string; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("relative isolate flex h-[124px] items-center justify-center gap-5 rounded-[20px] border-2 border-periwinkle bg-paper pr-10 pl-5 text-left", className)}
      style={{ boxShadow: LIFTED }}
    >
      <RisoGrain className="-z-10 rounded-[18px]" />
      <MomPeep />
      <span className="flex flex-col items-start justify-center gap-5 whitespace-nowrap">
        <span className="text-mono-xl text-orange">{title}</span>
        <span className="text-mono-md text-ink">{sub}</span>
      </span>
    </button>
  )
}

export function SurpriseLabel({ text = "A surprise from mom!", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-5 px-5", className)}>
      <Avatar character="mom" type="peep" />
      <p className="text-mono-xl whitespace-nowrap text-cream">{text}</p>
    </div>
  )
}

export function MomMessageCard({
  message = "Proud of you!",
  sticker = "goodjob",
  onContinue,
  onClose,
  slot = same,
  className,
}: {
  message?: string
  sticker?: PraiseId
  onContinue?: () => void
  onClose?: () => void
  slot?: Slot
  className?: string
}) {
  return (
    <div className={cn("relative isolate flex w-[620px] flex-col items-center gap-10 rounded-[60px] bg-paper px-4 pt-20 pb-10", className)}>
      <RisoGrain className="-z-10 rounded-[60px]" />
      {slot(
        "headline",
        <p className="text-display w-[460px] text-center text-teal uppercase">
          <Lettering className="whitespace-normal">{message}</Lettering>
        </p>,
      )}
      {slot("sticker", <div className="grid h-[199px] w-[265px] place-items-center"><PraiseSticker id={sticker} size={210} /></div>)}
      {slot(
        "continue",
        <Button variant="primary" className="w-[252px]" onClick={onContinue} iconStart={<ArrowRightIcon size={BUTTON_ICON_SIZE.xxl} />}>
          Continue
        </Button>,
      )}
      <div className="absolute top-6 right-6">
        {slot(
          "close",
          <IconButton label="Close" onClick={onClose}>
            <DismissIcon size={28} />
          </IconButton>,
        )}
      </div>
    </div>
  )
}
