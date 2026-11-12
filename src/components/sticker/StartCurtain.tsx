import { Play } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { Button } from "@/components/ui/button"
import { unlockAudio } from "@/lib/audio"

/** Browsers only allow sound after a tap, so the prototype starts behind a curtain. */
export function StartCurtain({ title, subtitle, onStart, light = false }: { title: string; subtitle?: string; onStart: () => void; light?: boolean }) {
  return (
    <div className={"absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 text-center " + (light ? "bg-paper text-ink" : "bg-ink text-cream")}>
      <Sticker name="star" size={110} tilt={-10} motion="float" />
      <p className="font-display max-w-[80%] text-4xl">{title}</p>
      {subtitle && <p className="max-w-[70%] text-lg opacity-75">{subtitle}</p>}
      <Button
        variant="sticker"
        size="kid"
        tone="orange"
        onClick={() => {
          unlockAudio()
          onStart()
        }}
      >
        <Play className="fill-ink" /> Start
      </Button>
      <p className="text-sm opacity-60">Sound on 🔊</p>
    </div>
  )
}
