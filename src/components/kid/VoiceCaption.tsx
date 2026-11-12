import { Volume2 } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { useCaption, type Voice } from "@/lib/audio"
import { cn } from "@/lib/utils"

/**
 * Voice-over caption. Sound carries the meaning; this bubble is the text backup,
 * so a grown-up watching (or a kid who reads) can follow too.
 */
export function VoiceCaption({ className, static: fixed }: { className?: string; static?: { text: string; voice: Voice } }) {
  const live = useCaption()
  const c = fixed ?? live
  if (!c) return null
  return (
    <div
      key={c.text}
      role="status"
      className={cn(
        "animate-in fade-in slide-in-from-bottom-3 flex max-w-[640px] items-center gap-3 rounded-full bg-cream py-2 pr-6 pl-2 text-ink shadow-[0_7px_5px_rgb(0_0_0/0.3)] duration-300",
        className,
      )}
    >
      {c.voice === "guide" ? (
        <span className="grid size-11 place-items-center rounded-full bg-teal text-cream">
          <Volume2 className="size-6 animate-pulse" />
        </span>
      ) : (
        <Sticker name={c.voice} size={44} lift={false} />
      )}
      <span className="text-xl leading-tight font-semibold">{c.text}</span>
    </div>
  )
}
