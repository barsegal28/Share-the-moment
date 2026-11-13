/** #/flow — the whole first-time flow, kid → parent → kid, following the flow chart. */
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Hand, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from "lucide-react"
import { setMuted, unlockAudio } from "@/lib/audio"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { FlowChart } from "./FlowChart"
import { useScript } from "./store"
import { STEP_IDS, type StepId } from "./script"
import { Badge, Btn, btnClass } from "./ui"

export function FlowPlayer({ initial = "k-glow" }: { initial?: StepId }) {
  const script = useScript()
  return (
    <FlowProvider script={script} initial={initial}>
      <div className="ui-root flex h-dvh flex-col bg-white">
        <SoundUnlock />
        <Header />
        <main className="relative min-h-0 flex-1 bg-zinc-50 px-6 py-5">
          <FlowStage />
        </main>
        <Footer />
      </div>
    </FlowProvider>
  )
}

export function Brand({ sub }: { sub: string }) {
  return (
    <a href="#/flow" className="flex shrink-0 items-center gap-2.5">
      <span className="grid size-7 place-items-center rounded-md bg-zinc-900 text-white">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 8.8l6-.7z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight">Share the Moment</span>
        <span className="block text-xs text-zinc-500">{sub}</span>
      </span>
    </a>
  )
}

/**
 * Browsers only play sound after the first click or key press. The flow starts right away;
 * the first interaction turns sound on and, if nothing has moved on yet, replays the step with sound.
 */
let audioUnlocked = false
function SoundUnlock() {
  const flow = useFlow()
  const [, force] = useState(0)
  useEffect(() => {
    if (audioUnlocked) return
    const startStep = flow.step
    const on = () => {
      if (audioUnlocked) return
      audioUnlocked = true
      unlockAudio()
      force((n) => n + 1)
      // Let a click on a control run first; replay only if the step didn't change.
      window.setTimeout(() => flow.step === startStep && flow.replay(), 0)
    }
    window.addEventListener("pointerdown", on, { once: true, capture: true })
    window.addEventListener("keydown", on, { once: true, capture: true })
    return () => {
      window.removeEventListener("pointerdown", on, { capture: true })
      window.removeEventListener("keydown", on, { capture: true })
    }
  }, [flow])
  return null
}

function Header() {
  const flow = useFlow()
  return (
    <header className="border-b border-zinc-200">
      <div className="flex h-14 items-center gap-4 px-6">
        <Brand sub="First-time flow · prototype" />
        <nav className="ml-4 flex items-center gap-1 text-sm">
          <a href="#/flow" className="rounded-md px-3 py-1.5 font-medium text-zinc-900">Flow</a>
          <a href={`#/editor?step=${flow.step}`} className="rounded-md px-3 py-1.5 text-zinc-500 hover:text-zinc-900">Editor</a>
          <a href="#/" className="rounded-md px-3 py-1.5 text-zinc-500 hover:text-zinc-900">Showcase</a>
        </nav>
        <div className="flex-1" />
        <a href={`#/editor?step=${flow.step}`} className={btnClass("outline", "sm")}>
          <SlidersHorizontal /> Edit this step
        </a>
      </div>
      <div className="px-6 pb-4">
        <FlowChart script={flow.script} step={flow.step} onPick={(s) => flow.go(s)} />
      </div>
    </header>
  )
}

function Footer() {
  const flow = useFlow()
  const [muted, setM] = useState(false)
  const i = STEP_IDS.indexOf(flow.step)
  const waiting = flow.cfg.advance === "tap"
  return (
    <footer className="flex h-16 items-center gap-2 border-t border-zinc-200 px-6">
      <Btn size="icon" onClick={() => flow.go(STEP_IDS[i - 1])} disabled={i === 0} aria-label="Previous step"><ChevronLeft /></Btn>
      <Btn size="icon" onClick={() => flow.go(STEP_IDS[i + 1])} disabled={i === STEP_IDS.length - 1} aria-label="Next step"><ChevronRight /></Btn>
      <Btn onClick={() => flow.restart()}><RotateCcw /> Restart</Btn>
      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-ui-mono)] text-xs text-zinc-400">{String(i + 1).padStart(2, "0")}/{STEP_IDS.length}</span>
          <p className="truncate text-sm font-medium">{flow.cfg.title}</p>
          <Badge variant="outline">{flow.cfg.device === "ipad" ? "Kid · iPad" : "Parent · phone"}</Badge>
          {waiting && (
            <Badge variant="default">
              <Hand className="mr-1 size-3" /> Waiting for a tap
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-zinc-500">{flow.cfg.note}</p>
      </div>
      <Btn
        variant="ghost"
        onClick={() => {
          setMuted(!muted)
          setM(!muted)
        }}
      >
        {muted ? <VolumeX /> : <Volume2 />} {muted ? "Muted" : audioUnlocked ? "Sound on" : "Click anywhere for sound"}
      </Btn>
    </footer>
  )
}
