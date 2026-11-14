/**
 * Pieces of Figma "Parent.Mobile" (129:4277) that repeat across its three variants.
 */
import type { ReactNode } from "react"
import { RisoGrain } from "@/components/sticker/Sheet"
import { Sticker } from "@/art/stickers"
import { cn } from "@/lib/utils"
import { StarIcon } from "../icons"
import { PlayButton } from "../PlayButton"

export const PARENT_STAGE = { w: 393, h: 650 }

/** "Winter · Played by Noa" — Mono/Medium gold, gap 4; the last part takes the rest of the line. */
export function SongInfo({ from = "Winter", by = "Played by Noa", fromWidth }: { from?: string; by?: string; fromWidth?: number }) {
  return (
    <div className="text-mono-md flex w-full items-center gap-1 text-gold">
      <span className="shrink-0 whitespace-nowrap" style={fromWidth ? { width: fromWidth } : undefined}>{from}</span>
      <span className="shrink-0">·</span>
      <span className="min-w-px flex-1">{by}</span>
    </div>
  )
}

/** "Score ★★★" — label 48 wide, three 20px Fluent stars in the rating colour, gap 6. */
export function ScoreRow({ stars = 3 }: { stars?: number }) {
  return (
    <div className="flex h-[22px] w-full items-center gap-2">
      <span className="text-mono-md w-12 shrink-0 text-gold">Score</span>
      <span className="flex items-center gap-1.5 pb-0.5 text-[var(--fluent-icon-rating)]" aria-label={`${stars} stars`}>
        {Array.from({ length: stars }, (_, i) => <StarIcon key={i} size={20} />)}
      </span>
    </div>
  )
}

/**
 * The pink sheet with the cream paper cut across it (share the moment, play): pink background, the paper
 * polygon (Scrapbook/Lifted paper: 0 5 10 black 20%), the three stickers and the "Today at 14:05" stamp.
 */
const same = (_: string, n: ReactNode) => n
export function ParentPaperSheet({
  time = "Today at 14:05",
  slot = same,
  children,
}: {
  time?: string
  /** Wrap parts for motion: paper, comet, sparkle, burst, time. */
  slot?: (part: string, node: ReactNode) => ReactNode
  children?: ReactNode
}) {
  return (
    <div className="relative isolate overflow-hidden bg-white" style={{ width: PARENT_STAGE.w, height: PARENT_STAGE.h }}>
      <div className="absolute top-0 left-0 h-[956px] w-[440px] bg-pink" />
      <RisoGrain className="z-0" />
      {slot(
        "paper",
        <svg aria-hidden className="absolute" style={{ left: -24, top: 83.5, filter: "drop-shadow(0 5px 10px rgb(0 0 0 / 0.2))" }} width={488} height={847.5} viewBox="0 0 488 847.5">
          <path d="M0 0L488 181.5L488 847.5L0 847.5Z" fill="var(--sticker-cream)" />
        </svg>,
      )}
      <div className="absolute grid size-[205.3px] place-items-center" style={{ left: 35, top: 14 }}>
        {slot("comet", <Sticker name="cloudComet" size={181.771} tilt={-8} />)}
      </div>
      <div className="absolute grid size-[101.626px] place-items-center" style={{ left: 243, top: 20 }}>
        {slot("sparkle", <Sticker name="sparkle" size={85.684} tilt={12} />)}
      </div>
      <div className="absolute grid size-[174.416px] place-items-center" style={{ left: 207, top: 93 }}>
        {slot("burst", <Sticker name="burst" size={150.559} tilt={10} />)}
      </div>
      <div className="absolute top-4 left-4 w-[220px]">{slot("time", <p className="text-mono-lg text-cream">{time}</p>)}</div>
      {children}
    </div>
  )
}

/** "Listen to me play, MOM!" — Sticker/Paragraph/Title, the last word in orange. */
export function KidHeadline({ text = "Listen to me play,", shout = "mom!", className }: { text?: string; shout?: string; className?: string }) {
  return (
    <p className={cn("text-paragraph-title w-[306px] text-teal", className)}>
      {text} <br />
      <span className="text-orange">{shout}</span>
    </p>
  )
}

/** The kid's song on the parent's message: Play S (orange), title, song info and score. 340 wide, pl 12 pr 30 py 20, gap 20. */
export function ParentSongRow({ title = "Jingle Bells", playing, onPlay, className }: { title?: string; playing?: boolean; onPlay?: () => void; className?: string }) {
  return (
    <div className={cn("flex w-[340px] items-center gap-5 rounded-[60px] py-5 pr-[30px] pl-3", className)}>
      <PlayButton size="S" tone="orange" playing={playing} onClick={onPlay} />
      <div className="flex min-w-px flex-1 flex-col items-start gap-3">
        <p className="text-title-sm w-full text-teal">{title}</p>
        <div className="flex w-full flex-col items-start gap-2">
          <SongInfo />
          <ScoreRow />
        </div>
      </div>
    </div>
  )
}
