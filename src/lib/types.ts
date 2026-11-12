import type { StickerName } from "@/art/stickers"
import type { Contact } from "@/components/kid/FamilyAvatars"

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
  { from: "mom", sticker: "heart", kind: "voice", song: "Twinkle Twinkle", message: "I loved hearing you play Twinkle Twinkle! You kept going on the hard part. I'm so proud of you!" },
  { from: "dad", sticker: "rocket", kind: "sticker", song: "Twinkle Twinkle", message: "Wow! Both hands together? Play it for me tonight!" },
  { from: "grandma", sticker: "crown", kind: "voice", song: "Ode to Joy", message: "My little piano star! Grandma is dancing in the kitchen." },
]

export const NAMES: Record<Contact, string> = { mom: "Mom", dad: "Dad", grandma: "Grandma" }
