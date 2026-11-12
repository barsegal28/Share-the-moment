import { useEffect, useRef, useState } from "react"
import { Mic, Square, Sticker as StickerIcon, Video, Check, RotateCcw, CameraOff } from "lucide-react"
import { REPLY_STICKERS, Sticker, stickerLabel, type StickerName } from "@/art/stickers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** A grid of reply stickers. Sticker-first: the fastest reply, and it can feed the kid's sticker book. */
export function StickerPicker({ value, onChange, className }: { value?: StickerName; onChange?: (s: StickerName) => void; className?: string }) {
  return (
    <div className={cn("grid grid-cols-4 gap-3", className)} role="radiogroup" aria-label="Pick a sticker">
      {REPLY_STICKERS.map((s, i) => {
        const on = value === s
        return (
          <button
            key={s}
            role="radio"
            aria-checked={on}
            aria-label={stickerLabel(s)}
            onClick={() => onChange?.(s)}
            className={cn(
              "relative grid aspect-square place-items-center rounded-2xl bg-ink transition active:scale-95",
              on ? "ring-4 ring-orange ring-offset-2 ring-offset-paper" : "opacity-90 hover:opacity-100",
            )}
          >
            <Sticker name={s} size={52} tilt={i % 2 ? 8 : -8} />
            {on && (
              <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-orange text-ink">
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Hold-free voice note: tap to record, tap to stop (simulated in the prototype). */
export function VoiceRecorder({ onRecorded, className }: { onRecorded?: (seconds: number) => void; className?: string }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle")
  const [secs, setSecs] = useState(0)
  const t = useRef<number | null>(null)
  useEffect(() => () => { if (t.current) clearInterval(t.current) }, [])
  const start = () => {
    setSecs(0)
    setState("recording")
    t.current = window.setInterval(() => setSecs((s) => (s >= 30 ? s : s + 1)), 1000)
  }
  const stop = () => {
    if (t.current) clearInterval(t.current)
    setState("done")
    onRecorded?.(Math.max(1, secs))
  }
  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-2xl bg-muted p-6", className)}>
      {state === "done" ? (
        <>
          <div className="flex w-full items-center gap-3 rounded-full bg-paper p-2 pr-4">
            <span className="grid size-10 place-items-center rounded-full bg-teal text-cream"><Check className="size-5" /></span>
            <span className="flex h-6 flex-1 items-center gap-1">
              {Array.from({ length: 22 }, (_, i) => <span key={i} className="w-1 rounded-full bg-teal/70" style={{ height: 6 + ((i * 7) % 18) }} />)}
            </span>
            <span className="text-sm font-semibold">0:{String(Math.max(1, secs)).padStart(2, "0")}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setState("idle")}><RotateCcw /> Record again</Button>
        </>
      ) : (
        <>
          <button
            onClick={state === "idle" ? start : stop}
            className={cn("grid size-20 place-items-center rounded-full text-cream transition active:scale-95", state === "recording" ? "animate-pulse bg-pink" : "bg-teal")}
            aria-label={state === "idle" ? "Start recording" : "Stop recording"}
          >
            {state === "idle" ? <Mic className="size-9" /> : <Square className="size-8 fill-current" />}
          </button>
          <p className="text-sm font-semibold">{state === "idle" ? "Tap to record a voice note" : `Recording… 0:${String(secs).padStart(2, "0")} — tap to stop`}</p>
        </>
      )}
    </div>
  )
}

const PRAISE = [
  "You kept going on the hard part!",
  "Both hands together — wow!",
  "Play it for me tonight?",
  "I love how you practised.",
]

export interface ReplyDraft {
  sticker?: StickerName
  voiceSeconds?: number
  praise?: string
  kind: "sticker" | "voice" | "video"
}

/**
 * The parent's reply composer: sticker (default), voice or video.
 * Praise prompts focus on effort, never on mistake counts.
 */
export function ReplyComposer({ kid = "Noa", cameraDenied = false, onSend, className }: { kid?: string; cameraDenied?: boolean; onSend?: (d: ReplyDraft) => void; className?: string }) {
  const [tab, setTab] = useState<ReplyDraft["kind"]>("sticker")
  const [sticker, setSticker] = useState<StickerName | undefined>("heart")
  const [voice, setVoice] = useState<number | undefined>()
  const [praise, setPraise] = useState<string | undefined>(PRAISE[0])
  const ready = (tab === "sticker" && sticker) || (tab === "voice" && voice) || false

  return (
    <div className={cn("flex flex-col gap-5 px-6 pt-6 pb-8 text-ink", className)}>
      <div>
        <h2 className="font-display text-[28px] leading-tight">Send {kid} a surprise</h2>
        <p className="mt-1 text-sm text-ink/65">It pops up for {kid} with a sound and your face.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ReplyDraft["kind"])}>
        <TabsList className="w-full bg-ink/8 text-ink/70 [&_[data-state=active]]:bg-ink [&_[data-state=active]]:text-cream">
          <TabsTrigger value="sticker"><StickerIcon /> Sticker</TabsTrigger>
          <TabsTrigger value="voice"><Mic /> Voice</TabsTrigger>
          <TabsTrigger value="video"><Video /> Video</TabsTrigger>
        </TabsList>
        <TabsContent value="sticker" className="pt-3">
          <StickerPicker value={sticker} onChange={setSticker} />
        </TabsContent>
        <TabsContent value="voice" className="pt-3">
          <VoiceRecorder onRecorded={setVoice} />
        </TabsContent>
        <TabsContent value="video" className="pt-3">
          {cameraDenied ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted p-6 text-center">
              <CameraOff className="size-8 text-ink/60" />
              <p className="text-sm">Camera is off for this site. Send a voice note or a sticker instead.</p>
              <Button variant="secondary" size="sm" onClick={() => setTab("voice")}>Record a voice note</Button>
            </div>
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-ink text-cream">
              <div className="flex flex-col items-center gap-2">
                <Video className="size-10" />
                <p className="text-sm text-cream/75">Up to 15 seconds · prototype placeholder</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div>
        <p className="mb-2 text-sm font-semibold">Add a line (optional)</p>
        <div className="flex flex-wrap gap-2">
          {PRAISE.map((p) => (
            <button key={p} onClick={() => setPraise(praise === p ? undefined : p)}>
              <Badge variant={praise === p ? "secondary" : "outline"} className={cn("px-3 py-1.5 text-[13px]", praise !== p && "border-ink/20 text-ink")}>{p}</Badge>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="sticker"
        tone="orange"
        className="h-16 rounded-[22px] text-xl"
        disabled={!ready}
        onClick={() => onSend?.({ kind: tab, sticker: tab === "sticker" ? sticker : undefined, voiceSeconds: voice, praise })}
      >
        Send to {kid}
      </Button>
    </div>
  )
}

/** Confirmation after the parent replies. */
export function ReplySent({ kid = "Noa", sticker = "heart", onAnother, className }: { kid?: string; sticker?: StickerName; onAnother?: () => void; className?: string }) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-6 px-8 text-center text-ink", className)}>
      <Sticker name={sticker} size={150} tilt={-8} motion="pop" />
      <h2 className="font-display text-[34px] leading-tight">Sent!</h2>
      <p className="text-base text-ink/70">{kid} will get it with a little chime next time they open the app.</p>
      <Button variant="ghost" onClick={onAnother}>Send another</Button>
    </div>
  )
}
