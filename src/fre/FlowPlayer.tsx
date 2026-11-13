/** #/flow — the whole first-time flow, kid → parent → kid, following the flow chart. */
import { useState } from "react"
import { ChevronLeft, ChevronRight, Pencil, RotateCcw, Volume2, VolumeX, Play } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { setMuted, unlockAudio } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { FlowChart } from "./FlowChart"
import { useScript } from "./store"
import { STEP_IDS, type StepId } from "./script"

export function FlowPlayer({ initial = "k-glow" }: { initial?: StepId }) {
  const script = useScript()
  const [started, setStarted] = useState(false)
  return (
    <FlowProvider script={script} initial={initial} started={started}>
      <div className="flex h-dvh flex-col bg-[#0b1f1b] text-cream">
        <Header />
        <main className="relative min-h-0 flex-1 px-4 py-3">
          <FlowStage />
          {!started && <StartCurtain onStart={() => { unlockAudio(); setStarted(true) }} />}
        </main>
        <Footer />
      </div>
    </FlowProvider>
  )
}

function Header() {
  const flow = useFlow()
  return (
    <header className="flex items-center gap-6 border-b border-cream/10 px-5 py-3">
      <a href="#/" className="flex shrink-0 items-center gap-2">
        <Sticker name="ratingStar1" size={34} lift={false} />
        <span className="leading-tight">
          <span className="block font-display text-[18px]">Share the Moment</span>
          <span className="block text-[11px] text-cream/55">First-time flow · prototype</span>
        </span>
      </a>
      <FlowChart script={flow.script} step={flow.step} onPick={(s) => flow.go(s)} className="min-w-0 flex-1" />
    </header>
  )
}

function Footer() {
  const flow = useFlow()
  const [muted, setM] = useState(false)
  const i = STEP_IDS.indexOf(flow.step)
  const waiting = flow.cfg.advance === "tap"
  return (
    <footer className="flex items-center gap-3 border-t border-cream/10 px-5 py-2.5 text-[13px]">
      <button type="button" className={btn} onClick={() => flow.restart()}>
        <RotateCcw className="size-4" /> Restart
      </button>
      <button type="button" className={btn} disabled={i === 0} onClick={() => flow.go(STEP_IDS[i - 1])} aria-label="Previous step">
        <ChevronLeft className="size-4" />
      </button>
      <button type="button" className={btn} disabled={i === STEP_IDS.length - 1} onClick={() => flow.go(STEP_IDS[i + 1])} aria-label="Next step">
        <ChevronRight className="size-4" />
      </button>
      <div className="min-w-0 flex-1 px-2">
        <p className="truncate font-semibold">
          <span className="mr-2 text-cream/45">
            {i + 1}/{STEP_IDS.length}
          </span>
          {flow.cfg.title}
          {waiting && <span className="ml-2 rounded-full bg-orange/20 px-2 py-0.5 text-[11px] font-bold text-orange">waiting for a tap</span>}
        </p>
        <p className="truncate text-cream/55">{flow.cfg.note}</p>
      </div>
      <button
        type="button"
        className={btn}
        onClick={() => {
          setMuted(!muted)
          setM(!muted)
        }}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        {muted ? "Muted" : "Sound on"}
      </button>
      <a className={cn(btn, "bg-periwinkle text-ink hover:bg-periwinkle/90")} href={`#/editor?step=${flow.step}`}>
        <Pencil className="size-4" /> Edit this step
      </a>
    </footer>
  )
}

const btn = "inline-flex items-center gap-1.5 rounded-lg border border-cream/15 bg-cream/5 px-3 py-1.5 font-semibold text-cream hover:bg-cream/10 disabled:opacity-35"

function StartCurtain({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#0b1f1b]/92 text-center backdrop-blur-sm">
      <Sticker name="ringedPlanet" size={160} tilt={-6} motion="float" />
      <p className="font-display text-[40px] leading-none">Noa just got 3 stars!</p>
      <p className="max-w-[520px] text-cream/70">The first time Noa and Mom use Share the Moment: kid on the iPad, then Mom on her phone, then back to Noa. Taps move it forward where a real person would tap.</p>
      <button type="button" onClick={onStart} className="sticker mt-2 inline-flex items-center gap-2 rounded-full bg-orange px-8 py-4 font-display text-[24px] text-ink [--kiss:var(--sticker-pink)]">
        <Play className="size-6 fill-ink" /> Start
      </button>
      <p className="text-[13px] text-cream/50">Sound on: voice-over, sounds and the recording are part of the design.</p>
    </div>
  )
}
