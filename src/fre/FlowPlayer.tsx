import brandComet from "./overview/brand-comet.svg"
/**
 * The flow pages: #/overview — the whole first-time flow, kid → parent → kid, following the flow chart;
 * #/kid — only the kid's screens (iPad); #/parent — only the parent's screens (phone).
 */
import { cn } from "@/lib/utils"
import { SlidersIcon } from "./overview/icons"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Hand, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { setPaused, usePaused } from "@/lib/clock"
import { setMuted, unlockAudio } from "@/lib/audio"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { useScript } from "./store"
import { STEP_IDS, type StepId } from "./script"
import { Badge, Btn } from "./ui"

export type FlowMode = "overview" | "kid" | "parent"
export const MODE_STEPS: Record<FlowMode, readonly StepId[]> = {
  overview: STEP_IDS,
  kid: STEP_IDS.filter((s) => s.startsWith("k-")),
  parent: STEP_IDS.filter((s) => s.startsWith("p-")),
}

export function FlowPlayer({ initial, mode = "overview" }: { initial?: StepId; mode?: FlowMode }) {
  const script = useScript()
  const steps = MODE_STEPS[mode]
  const first = initial && steps.includes(initial) ? initial : steps[0]
  return (
    <FlowProvider script={script} initial={first} steps={mode === "overview" ? undefined : steps}>
      <div className="ui-root flex h-dvh flex-col bg-white">
        <SoundUnlock />
        <Header mode={mode} />
        <main className="relative min-h-0 flex-1 bg-zinc-50 px-6 py-5">
          <FlowStage />
        </main>
        <Footer steps={steps} />
      </div>
    </FlowProvider>
  )
}

export function Brand({ sub }: { sub: string }) {
  // Figma "Brand": the drippy-comet sticker (40, flipped and turned −137.62°) beside the name, clipped to 40px.
  return (
    <a href="#/overview" className="flex h-[40.112px] shrink-0 items-center">
      <img src={brandComet} alt="" className="h-[40.112px] w-[56.509px] shrink-0" />
      <span className="flex flex-col whitespace-nowrap">
        <span className="text-[14px] leading-[18px] font-semibold tracking-[-0.14px] text-[#09090b]">Share the Moment</span>
        <span className="text-[12px] leading-[16px] text-[#71717a]">{sub}</span>
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

function Header({ mode }: { mode: FlowMode }) {
  const flow = useFlow()
  return <SiteHeader page={mode} step={flow.step} />
}

/**
 * The site header, the same on both pages: brand + Flow on the left; Figma, Storybook, GitHub and the Editor tab on
 * the right. Opening the editor keeps this header as it is and shows the editor under it.
 */
export function SiteHeader({ page, step }: { page: FlowMode | "editor"; step: string }) {
  // Figma "Site header" (237:4828): 57 tall, 24 side padding, 16 gap, no border; nav tabs 14/20, Editor button 32.
  const tab = (active: boolean) =>
    cn("rounded-[6px] px-3 py-1.5 text-[14px] leading-[20px] whitespace-nowrap", active ? "font-medium text-[#18181b]" : "text-[#71717a] hover:text-[#18181b]")
  const onEditor = page === "editor"
  return (
    <header className="flex h-[57px] shrink-0 items-center gap-4 bg-white px-6">
      <Brand sub="First-time flow · prototype" />
      <nav className="flex items-start gap-1 pl-4">
        <a href="#/overview" className={tab(page === "overview")}>Overview</a>
        <a href="#/kid" className={tab(page === "kid")}>Kid flow</a>
        <a href="#/parent" className={tab(page === "parent")}>Parent flow</a>
      </nav>
      <div className="h-px min-w-px flex-1" />
      <a
        href={page === "overview" ? "#/editor?page=overview" : `#/editor?step=${step}`}
        aria-current={onEditor ? "page" : undefined}
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-2 rounded-[8px] border px-4 text-[14px] leading-[20px] font-medium",
          onEditor ? "border-[#18181b] bg-[#18181b] text-white" : "border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#fafafa]",
        )}
      >
        <SlidersIcon /> Editor
      </a>
    </header>
  )
}

function Footer({ steps }: { steps: readonly StepId[] }) {
  const flow = useFlow()
  const [muted, setM] = useState(false)
  const paused = usePaused()
  const i = steps.indexOf(flow.step)
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
      <Btn size="icon" onClick={() => flow.go(steps[i - 1])} disabled={i <= 0} aria-label="Previous step"><ChevronLeft /></Btn>
      <Btn size="icon" onClick={() => flow.go(steps[i + 1])} disabled={i === steps.length - 1} aria-label="Next step"><ChevronRight /></Btn>
      <Btn variant={paused ? "default" : "outline"} className="w-[92px]" onClick={() => setPaused(!paused)} title="Pause / resume (P)">
        {paused ? <Play className="fill-current" /> : <Pause className="fill-current" />} {paused ? "Resume" : "Pause"}
      </Btn>
      <Btn onClick={() => flow.restart()}><RotateCcw /> Restart</Btn>
      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-ui-mono)] text-xs text-zinc-400">{String(i + 1).padStart(2, "0")}/{steps.length}</span>
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
