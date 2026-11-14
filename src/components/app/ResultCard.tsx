/**
 * Figma "main" (73:3571): the paper card on the kid's success screens. 620 × 660, paper, radius 40,
 * padding 65 / 80, Riso grain.
 *   type=main, timeline=default — "You are a star!", the stars, and the actions (240 wide, gap 24):
 *                                 Play next (primary), Share (outline-light) — or Shared ✓ once sent —
 *                                 and Play again (ghost, XL).
 *   type=main, timeline=FRE     — title and stars only, centred.
 *   type=share, timeline=FRE    — the share illustration and a Share button (gap 80), a Close button at
 *                                 the top-right corner (64px, outside the card edge).
 */
import type { ReactNode } from "react"
import { RisoGrain } from "@/components/sticker/Sheet"
import { cn } from "@/lib/utils"
import { BUTTON_ICON_SIZE, Button, IconButton } from "./Button"
import { ArrowClockwiseIcon, ArrowRightIcon, CheckmarkCircleIcon, DismissIcon, ShareIcon } from "./icons"
import { Lettering } from "./Lettering"
import { ShareIllustration } from "./ShareIllustration"
import { StarsRow } from "./StarsRow"

export type ResultCardType = "main" | "share"
export type ResultCardTimeline = "default" | "FRE"

export interface ResultCardProps {
  type?: ResultCardType
  timeline?: ResultCardTimeline
  title?: string
  /** main/default: the song was shared — the Share button reads "Shared ✓". */
  shared?: boolean
  onPlayNext?: () => void
  onShare?: () => void
  onPlayAgain?: () => void
  onClose?: () => void
  /** Wrap parts for motion: title, star (index), action (index), illustration, share, close. */
  slot?: (part: "title" | "stars" | "illustration" | "share" | "close" | "next" | "secondary" | "again", node: ReactNode) => ReactNode
  /** Override how each star renders (motion). */
  renderStar?: (star: ReactNode, i: number) => ReactNode
  className?: string
}

const same = (_: string, n: ReactNode) => n

export function ResultCard({
  type = "main",
  timeline = "default",
  title = "You are a star!",
  shared = false,
  onPlayNext,
  onShare,
  onPlayAgain,
  onClose,
  slot = same,
  renderStar,
  className,
}: ResultCardProps) {
  const share = type === "share"
  return (
    <div
      className={cn(
        "relative isolate flex h-[660px] w-[620px] flex-col items-center rounded-[40px] bg-paper px-20 py-[65px]",
        share ? "gap-5" : "justify-center",
        className,
      )}
    >
      <RisoGrain className="-z-10 rounded-[40px]" />
      {share ? (
        <div className="relative flex min-h-px w-full flex-1 flex-col items-center gap-20">
          {slot("illustration", <ShareIllustration />)}
          {slot(
            "share",
            <Button variant="primary" className="w-[240px]" onClick={onShare} iconEnd={<ShareIcon size={BUTTON_ICON_SIZE.xxl} />}>
              Share
            </Button>,
          )}
          <div className="absolute top-[-33px] right-[-48px]">
            {slot(
              "close",
              <IconButton label="Close" onClick={onClose}>
                <DismissIcon size={28} />
              </IconButton>,
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex w-full flex-col items-center gap-10">
          {slot(
            "title",
            <p className="text-display text-center text-teal">
              <Lettering>{title}</Lettering>
            </p>,
          )}
          {slot("stars", <StarsRow size="L" renderStar={renderStar} className={timeline === "default" ? "h-[165px] w-[456px]" : undefined} />)}
          {timeline === "default" && (
            <div className="flex w-[240px] flex-col items-center gap-6">
              {slot(
                "next",
                <Button variant="primary" className="w-full" onClick={onPlayNext} iconStart={<ArrowRightIcon size={BUTTON_ICON_SIZE.xxl} />}>
                  Play next
                </Button>,
              )}
              {slot(
                "secondary",
                <Button
                  variant="outline-light"
                  className="w-full"
                  onClick={shared ? undefined : onShare}
                  aria-disabled={shared || undefined}
                  iconStart={shared ? <CheckmarkCircleIcon size={BUTTON_ICON_SIZE.xxl} /> : <ShareIcon size={BUTTON_ICON_SIZE.xxl} />}
                >
                  {shared ? "Shared" : "Share"}
                </Button>,
              )}
              {slot(
                "again",
                <Button variant="ghost" size="xl" className="w-full" onClick={onPlayAgain} iconStart={<ArrowClockwiseIcon size={BUTTON_ICON_SIZE.xl} />}>
                  Play again
                </Button>,
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
