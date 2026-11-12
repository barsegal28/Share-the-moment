import { Gift } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { NAMES, type Reply } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * How a reply reaches the kid.
 * - in-app: a sticker banner drops in (held until a song ends, never interrupts playing)
 * - push:   iPad notification led by the parent's face, since the kid may not read the text
 */
export function ReplyNotification({
  reply,
  kind = "in-app",
  count = 1,
  onOpen,
  className,
}: {
  reply: Reply
  kind?: "in-app" | "push"
  count?: number
  onOpen?: () => void
  className?: string
}) {
  const who = NAMES[reply.from]
  if (kind === "push") {
    return (
      <button
        onClick={onOpen}
        className={cn("animate-slide-down flex w-[460px] items-center gap-4 rounded-[28px] bg-[#F4F1EAEE] p-4 text-left text-ink shadow-xl backdrop-blur", className)}
      >
        <Sticker name={reply.from} size={60} lift={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase opacity-60">
            <span>Piano Pals</span>
            <span>now</span>
          </div>
          <p className="text-base font-bold">{who} sent you a surprise! 🎁</p>
          <p className="truncate text-sm opacity-70">For your “{reply.song}”. Tap to open.</p>
        </div>
      </button>
    )
  }
  return (
    <button
      onClick={onOpen}
      className={cn(
        "animate-slide-down sticker flex items-center gap-5 rounded-full bg-cream py-3 pr-8 pl-3 text-ink [--kiss:var(--sticker-pink)] active:sticker-pressed",
        className,
      )}
      aria-label={`${who} sent you a surprise. Open it.`}
    >
      <Sticker name={reply.from} size={76} lift={false} motion="wiggle" />
      <span className="font-display text-3xl">{count > 1 ? `${count} surprises!` : "A surprise!"}</span>
      <span className="grid size-16 animate-bounce place-items-center rounded-full bg-orange">
        <Gift className="size-9" />
      </span>
    </button>
  )
}
