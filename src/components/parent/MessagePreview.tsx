import { ChevronLeft, Mail } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { StarScore } from "@/components/kid/StarScore"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * How the parent hears about it — chosen at setup.
 * SMS: one line plus the link. Email: a short card with one button.
 * The first message to a parent also explains what this is and how replying works.
 */
export interface MessagePreviewProps {
  channel?: "sms" | "email"
  kid?: string
  song?: string
  firstTime?: boolean
  /** Extra unopened recordings ("2 more from Noa this week"). */
  more?: number
  onOpen?: () => void
  className?: string
}

export function MessagePreview({ channel = "sms", kid = "Noa", song = "Twinkle Twinkle Little Star", firstTime = false, more = 0, onOpen, className }: MessagePreviewProps) {
  return channel === "sms" ? (
    <SmsThread kid={kid} song={song} firstTime={firstTime} onOpen={onOpen} className={className} />
  ) : (
    <EmailView kid={kid} song={song} firstTime={firstTime} more={more} onOpen={onOpen} className={className} />
  )
}

function SmsThread({ kid, song, firstTime, onOpen, className }: Required<Pick<MessagePreviewProps, "kid" | "song" | "firstTime">> & Pick<MessagePreviewProps, "onOpen" | "className">) {
  return (
    <div className={cn("flex h-full flex-col bg-white text-[#111]", className)}>
      <div className="flex flex-col items-center gap-1 border-b border-black/10 bg-[#f6f6f6] pt-12 pb-3">
        <ChevronLeft className="absolute left-4 mt-5 size-7 text-[#0a7cff]" />
        <div className="grid size-12 place-items-center rounded-full bg-ink">
          <Sticker name="star" size={30} lift={false} />
        </div>
        <span className="text-xs font-medium">Piano Pals</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-[15px] leading-snug">
        <span className="self-center text-[11px] text-black/45">Today 17:42</span>
        {firstTime && (
          <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#e9e9eb] px-3.5 py-2">
            Hi! {kid} can now send you songs they've mastered on Piano Pals. You'll get a link to listen, and you can send back a sticker or voice note. 🎹
          </div>
        )}
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#e9e9eb] px-3.5 py-2">
          {kid} played “{song}” for you! ⭐⭐⭐ Listen: pianopals.app/l/x7f
        </div>
        <button onClick={onOpen} className="max-w-[80%] overflow-hidden rounded-2xl bg-[#e9e9eb] text-left transition active:scale-[0.98]">
          <div className="flex h-36 items-center justify-center gap-3 bg-ink">
            <Sticker name="kid" size={72} tilt={-6} />
            <Sticker name="star" size={52} tilt={10} />
          </div>
          <div className="px-3.5 py-2.5">
            <p className="text-sm font-semibold">Listen to {kid} play 🎧</p>
            <p className="text-xs text-black/50">pianopals.app</p>
          </div>
        </button>
      </div>
    </div>
  )
}

function EmailView({ kid, song, firstTime, more, onOpen, className }: Required<Pick<MessagePreviewProps, "kid" | "song" | "firstTime" | "more">> & Pick<MessagePreviewProps, "onOpen" | "className">) {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto bg-white text-[#111]", className)}>
      <div className="border-b border-black/10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 text-[#0a7cff]"><ChevronLeft className="size-6" /> Inbox</div>
        <h2 className="mt-3 text-xl leading-tight font-bold">{kid} played “{song}” for you ⭐⭐⭐</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-ink"><Mail className="size-5 text-cream" /></div>
          <div className="text-sm">
            <p className="font-semibold">{kid} via Piano Pals</p>
            <p className="text-black/50">to you · 17:42</p>
          </div>
        </div>
      </div>
      <div className="p-5" data-sheet="paper">
        <div className="overflow-hidden rounded-3xl bg-ink">
          <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-7 text-center">
            <Sticker name="kid" size={96} tilt={-6} />
            <p className="font-display text-[26px] leading-tight text-cream">{kid} wants you to hear this!</p>
            <div className="origin-top scale-90"><StarScore size="sm" labels={false} /></div>
            <p className="text-sm text-cream/75">Every note right · On the beat · Both hands</p>
            <Button variant="sticker" tone="orange" size="lg" className="mt-2 h-14 rounded-2xl px-6 text-lg" onClick={onOpen}>
              Listen to {kid} play
            </Button>
          </div>
        </div>
        {firstTime && (
          <p className="mt-5 text-sm leading-relaxed text-black/70">
            <b>New:</b> when {kid} gets 3 stars on a song, they can choose to send it to you. Listen on any device, and send back a sticker, a voice note or a short video. {kid} only hears it when you reply.
          </p>
        )}
        {more > 0 && <p className="mt-4 text-sm font-semibold text-teal">+ {more} more from {kid} this week</p>}
        <p className="mt-6 text-xs text-black/45">You get this because you're on {kid}'s family list. Getting a lot? Switch to a daily or weekly digest.</p>
      </div>
    </div>
  )
}
