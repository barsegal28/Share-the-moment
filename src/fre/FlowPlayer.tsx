/** #/flow — the whole first-time flow, kid → parent → kid, following the flow chart. */
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from "lucide-react"
import { setPaused, usePaused } from "@/lib/clock"
import { setMuted, unlockAudio } from "@/lib/audio"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { useScript } from "./store"
import { LINKS } from "@/config"
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
export function SoundUnlock() {
  const flow = useFlow()
  const [, force] = useState(0)
  useEffect(() => {
    if (audioUnlocked) return
    const startStep = flow.step
    const on = (e: Event) => {
      if (audioUnlocked) return
      audioUnlocked = true
      unlockAudio()
      force((n) => n + 1)
      // A click on the page replays the step with sound; a click on a control (pause, next…) just does its job.
      if ((e.target as HTMLElement | null)?.closest?.("button, a, [role=switch], select, input")) return
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
        </nav>
        <div className="flex-1" />
        <a href={LINKS.figma} target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">Figma</a>
        <a href={LINKS.storybook} target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">Storybook</a>
        <a href={LINKS.repo} target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">GitHub</a>
        <a href={`#/editor?step=${flow.step}`} className={btnClass("outline", "sm")}>
          <SlidersHorizontal /> Edit this step
        </a>
      </div>
    </header>
  )
}

function Footer() {
  const flow = useFlow()
  const [muted, setM] = useState(false)
  const paused = usePaused()
  const i = STEP_IDS.indexOf(flow.step)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return
      if (e.key === "p" || e.key === "P") setPaused(!paused)
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [paused])
  const waiting = flow.cfg.advance === "tap"
  return (
    <footer className="flex h-16 items-center gap-2 border-t border-zinc-200 px-6">
      <Btn size="icon" onClick={() => flow.go(STEP_IDS[i - 1])} disabled={i === 0} aria-label="Previous step"><ChevronLeft /></Btn>
      <Btn size="icon" onClick={() => flow.go(STEP_IDS[i + 1])} disabled={i === STEP_IDS.length - 1} aria-label="Next step"><ChevronRight /></Btn>
      <Btn variant={paused ? "default" : "outline"} className="w-[92px]" onClick={() => setPaused(!paused)} title="Pause / resume (P)">
        {paused ? <Play className="fill-current" /> : <Pause className="fill-current" />} {paused ? "Resume" : "Pause"}
      </Btn>
      <Btn onClick={() => flow.restart()}><RotateCcw /> Restart</Btn>
      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-ui-mono)] text-xs text-zinc-400">{String(i + 1).padStart(2, "0")}/{STEP_IDS.length}</span>
          <p className="truncate text-sm font-medium">{flow.cfg.title}</p>
          <Badge variant="outline">{flow.cfg.device === "ipad" ? "Kid · iPad" : "Parent · phone"}</Badge>
          {paused && <Badge variant="outline">Paused</Badge>}
          {waiting && !paused && (
            <Badge variant="default">
              <Hand className="mr-1 size-3" /> Waiting for a tap
            </Badge>
          )}
        </div>
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
