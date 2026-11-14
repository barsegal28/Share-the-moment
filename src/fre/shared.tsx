/** Small pieces shared by the kid and parent screens. */
import { useSyncExternalStore } from "react"
import type { StickerName } from "@/art/stickers"

// ─── What the parent picked, so the kid's reveal shows the same sticker and words ───
export const REPLY_STICKERS: StickerName[] = ["stripedPlanet", "heart", "ringedPlanet", "ratingStar2", "burst", "drippyComet"]
export const REPLY_PHRASES = ["Proud of you!", "Bravo, Noa!", "Wow! Again!", "You rock!"]
let choice: { sticker: number; phrase: number; text?: string } = { sticker: 0, phrase: 0 }
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
  return { index: c, sticker: REPLY_STICKERS[c.sticker % REPLY_STICKERS.length], phrase: c.text?.trim() ? c.text : REPLY_PHRASES[c.phrase % REPLY_PHRASES.length] }
}



/** "1:30"-style time, scaled to the song length shown in Figma. */
export const SONG_SECONDS = 90
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

