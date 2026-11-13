/** #/flow — the whole first-time flow, kid → parent → kid, following the flow chart. */
import { useState } from "react"
import { ChevronLeft, ChevronRight, Hand, Play, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from "lucide-react"
import { setMuted, unlockAudio } from "@/lib/audio"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { FlowChart } from "./FlowChart"
import { useScript } from "./store"
import { STEP_IDS, type StepId } from "./script"
import { Badge, Btn, btnClass, Kbd } from "./ui"

export function FlowPlayer({ initial = "k-glow" }: { initial?: StepId }) {
  const script = useScript()
  const [started, setStarted] = useState(false)
  return (
    <FlowProvider script={script} initial={initial} started={started}>
      <div className="ui-root flex h-dvh flex-col bg-white">
        <Header />
        <main className="relative min-h-0 flex-1 bg-zinc-50 px-6 py-5">
          <FlowStage />
          {!started && <StartDialog onStart={() => { unlockAudio(); setStarted(true) }} />}
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
        {muted ? <VolumeX /> : <Volume2 />} {muted ? "Muted" : "Sound on"}
      </Btn>
    </footer>
  )
}

function StartDialog({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="w-[440px] rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
        <Badge>First-time experience</Badge>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">Noa just got 3 stars</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
          The first time Noa and Mom use Share the Moment: Noa on the iPad, then Mom on her phone, then back to Noa. Steps that need a person wait for your tap.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-zinc-600">
          <li className="flex items-center gap-2"><Volume2 className="size-4 text-zinc-400" /> Voice-over, sounds and the recording are part of the design.</li>
          <li className="flex items-center gap-2"><Hand className="size-4 text-zinc-400" /> Tap where a kid or parent would tap.</li>
        </ul>
        <div className="mt-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">Sound on <Kbd>🔊</Kbd></span>
          <Btn variant="default" size="default" onClick={onStart}><Play className="fill-current" /> Start the flow</Btn>
        </div>
      </div>
    </div>
  )
}
