import type { StickerName } from "@/art/stickers"
import type { Contact } from "@/components/kid/FamilyAvatars"
import { DEMO_SONG } from "@/config"

/** A parent's reply, as it reaches the kid. Only intentional replies ever reach the kid. */
export interface Reply {
  from: Contact
  sticker: StickerName
  /** Voice message (spoken in the prototype). */
  message: string
  song: string
  kind: "sticker" | "voice" | "video"
}

export const SAMPLE_REPLIES: Reply[] = [
  { from: "mom", sticker: "heart", kind: "voice", song: DEMO_SONG.title, message: `I loved hearing you play ${DEMO_SONG.title}! You kept going on the hard part. I'm so proud of you!` },
  { from: "dad", sticker: "ringedPlanet", kind: "sticker", song: DEMO_SONG.title, message: "Wow! Both hands together? Play it for me tonight!" },
  { from: "grandma", sticker: "ratingStar2", kind: "voice", song: DEMO_SONG.title, message: "My little piano star! Grandma is dancing in the kitchen." },
]

export const NAMES: Record<Contact, string> = { mom: "Mom", dad: "Dad", grandma: "Grandma" }
