/** Small pieces shared by the kid and parent screens. */
import { useSyncExternalStore, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { StickerName } from "@/art/stickers"

// ─── What the parent picked, so the kid's reveal shows the same sticker and words ───
export const REPLY_STICKERS: StickerName[] = ["stripedPlanet", "heart", "ringedPlanet", "ratingStar2", "burst", "drippyComet"]
export const REPLY_PHRASES = ["Proud of you!", "Bravo, Noa!", "Wow! Again!", "You rock!"]
let choice = { sticker: 0, phrase: 0 }
const subs = new Set<() => void>()
export const replyChoice = {
  get: () => choice,
  set: (c: Partial<typeof choice>) => {
    choice = { ...choice, ...c }
    subs.forEach((l) => l())
  },
  subscribe: (l: () => void) => {
    subs.add(l)
    return () => subs.delete(l)
  },
}
export function useReplyChoice() {
  const c = useSyncExternalStore(replyChoice.subscribe, replyChoice.get, replyChoice.get)
  return { index: c, sticker: REPLY_STICKERS[c.sticker % REPLY_STICKERS.length], phrase: REPLY_PHRASES[c.phrase % REPLY_PHRASES.length] }
}

/** The Figma "Functional" buttons (DM Mono 24, 80 tall, radius 28). */
export function KidActionButton({ tone = "ink", children, className }: { tone?: "ink" | "light" | "teal"; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-20 w-[240px] items-center justify-center gap-3 rounded-[28px] px-8 font-mono text-[24px] font-medium tracking-[-0.15px] select-none transition-transform active:scale-95",
        tone === "ink" && "bg-ink text-[#fafafa]",
        tone === "teal" && "bg-teal text-cream",
        tone === "light" && "border border-black/13 bg-white/80 text-black/86",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Parent web buttons (DM Mono 20, 64 tall, orange outline). */
export function ParentButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-16 items-center justify-center rounded-[24px] border border-orange bg-paper px-6 font-mono text-[20px] font-medium tracking-[-0.15px] whitespace-nowrap text-orange select-none active:scale-95", className)}>
      {children}
    </div>
  )
}

/** "1:30"-style time, scaled to the song length shown in Figma. */
export const SONG_SECONDS = 90
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

/** Text with the cream die-cut behind it (headlines in the Sticker language). */
export function DieCutText({ children, className, stroke = 18, color = "var(--sticker-cream)" }: { children: ReactNode; className?: string; stroke?: number; color?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span aria-hidden className="absolute inset-0" style={{ WebkitTextStroke: `${stroke}px ${color}`, color, filter: "drop-shadow(0 4px 4px rgb(0 0 0 / 0.18))" }}>
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}
