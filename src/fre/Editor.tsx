/**
 * #/editor — edit the flow's voice-over, sounds and the motion of every object, live.
 * Neutral, Figma-like tool UI: layers on the left, canvas in the middle, properties on the right, timeline below.
 * Edits are saved in this browser and the #/flow page plays them. Export the JSON to make them the defaults.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  ChevronLeft, ChevronRight, Copy, Download, Frame, Hand, Minus, MousePointer2, Play, Plus, RotateCcw, Upload, Volume2, X,
  Square, Music2, MessageSquareText, Smartphone, Tablet, ArrowLeft, Check, CircleAlert, Loader2,
} from "lucide-react"
import { CLAUDE_VOICES, ROLE_VOICE, speak, stopSpeech, useVoiceEngine, type ClaudeVoice } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { firstStepOf } from "./FlowChart"
import { Brand, SoundUnlock } from "./FlowPlayer"
import { scriptStore, useSaveStatus, useScript } from "./store"
import { playSound, SOUND_LABELS, SOUND_NAMES, type SoundName } from "./sounds"
import {
  DEFAULT_SCRIPT, EASES, ENTER_PRESETS, IDLE_PRESETS, NODES, STEP_IDS,
  type Advance, type MotionCfg, type ObjCfg, type RecordingMode, type SoundCue, type StepCfg, type StepId, type VoiceLine,
} from "./script"
import type { Voice } from "@/lib/audio"
import { Badge, Btn, btnClass, Hint, PanelSection, ScrubInput, Segmented, Select, Switch, TextArea, TextInput } from "./ui"

type Sel = { step: StepId; obj: string } | null

export function Editor({ initial = "k-success" }: { initial?: StepId }) {
  const script = useScript()
  const [step, setStep] = useState<StepId>(initial)
  const [sel, setSel] = useState<Sel>(null)
  const [hold, setHold] = useState(true)
  const [selecting, setSelecting] = useState(true)
  const onStep = useCallback((s: StepId) => setStep(s), [])
  const onSelect = useCallback((s: Sel) => setSel(s), [])

  useEffect(() => {
    const url = `#/editor?step=${step}`
    try {
      if (window.location.hash !== url) history.replaceState(null, "", url)
    } catch {
      /* sandboxed frames may refuse */
    }
  }, [step])

  // Figma-ish shortcuts: V select, H interact, Esc deselect.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return
      if (e.key === "v" || e.key === "V") setSelecting(true)
      if (e.key === "h" || e.key === "H") setSelecting(false)
      if (e.key === "Escape") setSel(null)
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [])

  return (
    <FlowProvider script={script} initial={initial} edit selecting={selecting} hold={hold} selected={sel} onSelect={onSelect} onStep={onStep}>
      <div className="ui-root grid h-dvh grid-cols-[240px_minmax(0,1fr)_288px] grid-rows-[48px_minmax(0,1fr)] bg-white text-zinc-950">
        <SoundUnlock />
        <Toolbar hold={hold} setHold={setHold} selecting={selecting} setSelecting={setSelecting} />
        <Layers sel={sel} setSel={setSel} />
        <Center />
        <Properties sel={sel} setSel={setSel} />
      </div>
    </FlowProvider>
  )
}

// ─── Toolbar ──────────────────────────────────────────────────────────────
function Toolbar({ hold, setHold, selecting, setSelecting }: { hold: boolean; setHold: (v: boolean) => void; selecting: boolean; setSelecting: (v: boolean) => void }) {
  const flow = useFlow()
  const [io, setIo] = useState(false)
  const edited = scriptStore.isEdited()
  const i = STEP_IDS.indexOf(flow.step)
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button")) return
      if (e.code === "Space") { e.preventDefault(); flow.replay() }
      if (e.key === "ArrowRight") flow.go(STEP_IDS[Math.min(STEP_IDS.length - 1, i + 1)])
      if (e.key === "ArrowLeft") flow.go(STEP_IDS[Math.max(0, i - 1)])
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [flow, i])
  return (
    <header className="col-span-3 flex items-center gap-3 border-b border-zinc-200 px-3">
      <Brand sub="Flow editor" />
      <div className="mx-1 h-5 w-px bg-zinc-200" />
      <Segmented
        value={selecting ? "select" : "interact"}
        onChange={(v) => setSelecting(v === "select")}
        options={[
          { value: "select", label: <><MousePointer2 /> Select</>, title: "Select objects (V)" },
          { value: "interact", label: <><Hand /> Interact</>, title: "Tap through the screens (H)" },
        ]}
      />
      <div className="flex flex-1 items-center justify-center gap-1">
        <Btn variant="ghost" size="icon" onClick={() => flow.go(STEP_IDS[Math.max(0, i - 1)])} aria-label="Previous step" title="Previous step (←)"><ChevronLeft /></Btn>
        <Btn variant="default" onClick={() => flow.replay()} title="Replay step (Space)"><Play className="fill-current" /> Replay step</Btn>
        <Btn variant="ghost" size="icon" onClick={() => flow.go(STEP_IDS[Math.min(STEP_IDS.length - 1, i + 1)])} aria-label="Next step" title="Next step (→)"><ChevronRight /></Btn>
        <div className="mx-2 h-5 w-px bg-zinc-200" />
        <Switch checked={!hold} onChange={(v) => setHold(!v)} label="Auto-advance" />
      </div>
      <SaveBadge edited={edited} />
      <Btn onClick={() => setIo(true)}><Download /> Export</Btn>
      <a href={`#/flow?step=${flow.step}`} className={btnClass("default", "sm")}><Play className="fill-current" /> Play flow</a>
      {io && <ExportDialog onClose={() => setIo(false)} />}
    </header>
  )
}

function SaveBadge({ edited }: { edited: boolean }) {
  const st = useSaveStatus()
  const text =
    st === "saving" ? "Saving…" : st === "connecting" ? "Connecting…" : st === "error" ? "Couldn't save · use Export" : st === "saved" ? (edited ? "All changes saved" : "Default script · saved") : edited ? "Saved in this browser only" : "Default script"
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500" title={st === "saved" ? "Saved to the artifact: it stays after a reload, in any browser" : st === "local" ? "Saved in this browser's storage" : undefined}>
      {st === "saving" || st === "connecting" ? <Loader2 className="size-3 animate-spin" /> : st === "error" ? <CircleAlert className="size-3.5 text-red-600" /> : st === "saved" ? <Check className="size-3.5 text-zinc-900" /> : <span className={cn("size-1.5 rounded-full", edited ? "bg-zinc-900" : "bg-zinc-300")} />}
      {text}
    </span>
  )
}

// ─── Layers ───────────────────────────────────────────────────────────────
function Layers({ sel, setSel }: { sel: Sel; setSel: (s: Sel) => void }) {
  const flow = useFlow()
  return (
    <aside className="overflow-y-auto border-r border-zinc-200 py-2">
      <p className="px-3 pt-1 pb-2 text-[11px] font-semibold text-zinc-900">Layers</p>
      {NODES.map((n) => (
        <div key={n.id} className="mb-1">
          <button type="button" onClick={() => flow.go(firstStepOf(flow.script, n.id))} className="flex w-full items-center gap-1.5 px-3 py-1 text-left text-[11px] text-zinc-500 hover:text-zinc-900">
            {n.lane === "kid" ? <Tablet className="size-3" /> : <Smartphone className="size-3" />}
            <span className="font-medium">{n.title}</span>
            <span className="ml-auto text-[10px] text-zinc-400 uppercase">{n.lane}</span>
          </button>
          {STEP_IDS.filter((s) => flow.script[s].node === n.id).map((s) => {
            const active = s === flow.step
            const objs = Object.entries(flow.script[s].objects)
            return (
              <div key={s}>
                <button
                  type="button"
                  onClick={() => { flow.go(s); setSel(null) }}
                  className={cn("mx-1.5 flex h-7 w-[calc(100%-12px)] items-center gap-2 rounded-md px-2 text-left text-xs", active && !sel ? "bg-zinc-900 text-white" : active ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700 hover:bg-zinc-50")}
                >
                  <Frame className={cn("size-3.5 shrink-0", active && !sel ? "text-zinc-300" : "text-zinc-400")} />
                  <span className="flex-1 truncate">{flow.script[s].title}</span>
                  {scriptStore.isEdited(s) && <span className={cn("size-1.5 rounded-full", active && !sel ? "bg-white" : "bg-zinc-900")} title="Edited" />}
                </button>
                {active && objs.length > 0 && (
                  <div className="mx-1.5 mt-0.5 mb-1.5">
                    {objs.map(([id, o]) => {
                      const on = sel?.step === s && sel.obj === id
                      return (
                        <button key={id} type="button" onClick={() => setSel({ step: s, obj: id })} className={cn("flex h-7 w-full items-center gap-2 rounded-md pr-2 pl-7 text-left text-xs", on ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50")}>
                          <Square className={cn("size-3 shrink-0", on ? "text-zinc-300" : "text-zinc-400")} />
                          <span className="flex-1 truncate">{o.label}</span>
                          {o.motion.enter !== "none" && <span className="text-[10px] text-zinc-400">{o.motion.enter}</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}

// ─── Canvas + timeline ───────────────────────────────────────────────────
function Center() {
  const flow = useFlow()
  return (
    <main className="flex min-h-0 flex-col bg-zinc-100">
      <div className="relative min-h-0 flex-1 p-6" onClick={() => flow.edit && flow.selecting && flow.select(flow.step, null)}>
        <span className="absolute top-3 left-4 text-[11px] text-zinc-500">
          {flow.cfg.device === "ipad" ? "iPad · 1194 × 834" : "iPhone · 393 × 852"} · <span className="text-zinc-900">{flow.cfg.title}</span>
        </span>
        <FlowStage />
      </div>
      <Timeline />
    </main>
  )
}

/** Drag bars to change an object's delay (body) or duration (right edge); drag sound cues along the ruler. */
function Timeline() {
  const flow = useFlow()
  const s = flow.cfg
  const objs = Object.entries(s.objects)
  const end = Math.max(4000, ...objs.map(([, o]) => o.motion.delay + o.motion.duration), ...s.sounds.map((c) => c.at + 400)) + 600
  const track = useRef<HTMLDivElement>(null)
  const drag = (e: React.PointerEvent, apply: (ms: number) => void, start: number) => {
    e.stopPropagation()
    const el = track.current
    if (!el) return
    const x0 = e.clientX
    const w = el.clientWidth
    const move = (ev: PointerEvent) => apply(Math.max(0, Math.round((start + ((ev.clientX - x0) / w) * end) / 10) * 10))
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      flow.replay()
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }
  const setObj = (id: string, m: Partial<MotionCfg>) => scriptStore.setStep(s.id, (st) => ({ ...st, objects: { ...st.objects, [id]: { ...st.objects[id], motion: { ...st.objects[id].motion, ...m } } } }))
  const setCue = (i: number, at: number) => scriptStore.setStep(s.id, (st) => ({ ...st, sounds: st.sounds.map((c, j) => (j === i ? { ...c, at } : c)) }))
  const pct = (ms: number) => `${(ms / end) * 100}%`
  return (
    <div className="max-h-[36%] shrink-0 border-t border-zinc-200 bg-white">
      <div className="flex h-9 items-center justify-between border-b border-zinc-100 px-3">
        <span className="text-[11px] font-semibold">Timeline</span>
        <span className="text-[11px] text-zinc-400">Drag a bar to move it · drag its edge to change its length · drag ◆ to move a sound</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto px-3 py-2">
        <div className="grid grid-cols-[150px_1fr] items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500"><Music2 className="size-3.5" /> Sound cues</span>
          <div ref={track} className="relative h-6 border-b border-zinc-200">
            {Array.from({ length: Math.floor(end / 500) + 1 }, (_, i) => (
              <span key={i} className={cn("absolute bottom-0 border-l", i % 2 ? "h-1.5 border-zinc-200" : "h-full border-zinc-300")} style={{ left: pct(i * 500) }}>
                {i % 2 === 0 && <span className="absolute top-0 left-1 font-[family-name:var(--font-ui-mono)] text-[10px] text-zinc-400">{i / 2}s</span>}
              </span>
            ))}
            {s.sounds.map((c, i) => (
              <button key={i} type="button" title={`${SOUND_LABELS[c.sound]} · ${c.at} ms`} onPointerDown={(e) => drag(e, (ms) => setCue(i, ms), c.at)} className="absolute bottom-[3px] size-2.5 -translate-x-1/2 rotate-45 cursor-ew-resize rounded-[1px] bg-zinc-900 hover:scale-125" style={{ left: pct(c.at) }} />
            ))}
          </div>
          {objs.map(([id, o]) => {
            const m = o.motion
            const on = flow.selected?.step === s.id && flow.selected.obj === id
            return (
              <TRow key={id} label={o.label} on={on} onClick={() => flow.select(s.id, id)}>
                {m.enter !== "none" ? (
                  <div
                    className={cn("absolute top-[3px] h-[18px] cursor-grab rounded-[4px] border active:cursor-grabbing", on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400")}
                    style={{ left: pct(m.delay), width: pct(Math.max(60, m.duration)) }}
                    onPointerDown={(e) => drag(e, (ms) => setObj(id, { delay: ms }), m.delay)}
                    title={`${m.enter} · ${m.delay} ms + ${m.duration} ms`}
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-1.5 truncate text-[10px] leading-4">{m.enter}</span>
                    <span className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize" onPointerDown={(e) => drag(e, (ms) => setObj(id, { duration: Math.max(40, ms) }), m.duration)} />
                  </div>
                ) : (
                  <span className="absolute top-1 left-0 text-[10px] text-zinc-400">no enter motion</span>
                )}
                {m.idle !== "none" && <span className={cn("absolute top-[11px] h-px", on ? "text-zinc-900" : "text-zinc-300")} style={{ left: pct(m.delay + m.duration), right: 0, backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 7px)" }} title={`idle: ${m.idle}`} />}
              </TRow>
            )
          })}
        </div>
      </div>
    </div>
  )
}
function TRow({ label, on, onClick, children }: { label: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <>
      <button type="button" onClick={onClick} className={cn("flex items-center gap-1.5 truncate text-left text-xs", on ? "font-medium text-zinc-950" : "text-zinc-600")}>
        <Square className="size-3 shrink-0 text-zinc-400" /> <span className="truncate">{label}</span>
      </button>
      <div className="relative h-6" onClick={onClick}>{children}</div>
    </>
  )
}

// ─── Properties ──────────────────────────────────────────────────────────
function Properties({ sel, setSel }: { sel: Sel; setSel: (s: Sel) => void }) {
  const flow = useFlow()
  const obj = sel && sel.step === flow.step ? flow.script[sel.step].objects[sel.obj] : null
  return (
    <aside className="overflow-y-auto border-l border-zinc-200">
      {obj && sel ? <ObjectProps stepId={sel.step} id={sel.obj} cfg={obj} onBack={() => setSel(null)} /> : <StepProps />}
    </aside>
  )
}

/** Replays the step shortly after the last edit, so you see/hear the change. */
function useAutoReplay() {
  const flow = useFlow()
  const t = useRef(0)
  return () => {
    clearTimeout(t.current)
    t.current = window.setTimeout(() => flow.replay(), 450)
  }
}

function PanelHeader({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 border-b border-zinc-200 px-3 py-3">
      <span className="mt-0.5 text-zinc-400 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{title}</p>
        {sub && <p className="truncate text-[11px] text-zinc-500">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function StepProps() {
  const flow = useFlow()
  const s = flow.cfg
  const replaySoon = useAutoReplay()
  const set = (fn: (s: StepCfg) => StepCfg, replay = true) => {
    scriptStore.setStep(s.id, fn)
    if (replay) replaySoon()
  }
  const engine = useVoiceEngine()
  const setVoice = (i: number, p: Partial<VoiceLine>) => set((st) => ({ ...st, voice: st.voice.map((v, j) => (j === i ? { ...v, ...p } : v)) }), false)
  const setCue = (i: number, p: Partial<SoundCue>) => set((st) => ({ ...st, sounds: st.sounds.map((c, j) => (j === i ? { ...c, ...p } : c)) }))
  return (
    <>
      <PanelHeader
        icon={<Frame />}
        title={s.title}
        sub={`Step ${STEP_IDS.indexOf(s.id) + 1} · ${s.device === "ipad" ? "Kid, iPad" : "Parent, phone"}`}
        action={<Btn variant="ghost" size="icon-sm" title="Reset this step" onClick={() => { scriptStore.reset(s.id); flow.replay() }}><RotateCcw /></Btn>}
      />
      <PanelSection title="Description">
        <TextArea rows={3} value={s.note} onChange={(e) => set((st) => ({ ...st, note: e.target.value }), false)} />
      </PanelSection>

      {engine === "claude" && <VoicePicker />}

      <PanelSection title={<span className="flex items-center gap-2">Voice-over <Badge variant={engine === "claude" ? "default" : "outline"}>{engine === "claude" ? "Claude voices" : "Browser voice"}</Badge></span>} action={<Btn variant="ghost" size="icon-sm" title="Add a line" onClick={() => set((st) => ({ ...st, voice: [...st.voice, { text: "New line", voice: "guide", delay: 200, rate: 1.02, pitch: 1.35 }] }), false)}><Plus /></Btn>}>
        {engine === "browser" && <Hint>Natural Claude voices play when this page is open on claude.ai in Chrome or Edge. Here it uses the browser's own voice.</Hint>}
        {s.voice.length === 0 && <Hint>No voice-over in this step.</Hint>}
        {s.voice.map((v, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 p-2">
            <div className="flex items-center gap-1">
              <MessageSquareText className="size-3.5 text-zinc-400" />
              <span className="flex-1 text-[11px] text-zinc-500">Line {i + 1}</span>
              <Btn variant="ghost" size="icon-sm" title="Hear it" onClick={() => { stopSpeech(); void speak(v.text, v.voice, { rate: v.rate, pitch: v.pitch, claudeVoice: v.claudeVoice }) }}><Volume2 /></Btn>
              <Btn variant="ghost" size="icon-sm" title="Remove" onClick={() => set((st) => ({ ...st, voice: st.voice.filter((_, j) => j !== i) }), false)}><Minus /></Btn>
            </div>
            <TextArea rows={2} value={v.text} onChange={(e) => setVoice(i, { text: e.target.value })} />
            <div className="grid grid-cols-2 gap-1.5">
              <Select value={v.voice} onChange={(e) => setVoice(i, { voice: e.target.value as Voice })} title="Who is speaking (caption label)">
                {(["guide", "mom", "dad", "grandma", "kid"] as Voice[]).map((x) => <option key={x} value={x}>{SPEAKER_LABEL[x]}</option>)}
              </Select>
              <Select value={v.claudeVoice ?? ""} onChange={(e) => setVoice(i, { claudeVoice: (e.target.value || undefined) as ClaudeVoice | undefined })} title="Claude voice">
                <option value="">{ROLE_VOICE[v.voice]} (default)</option>
                {CLAUDE_VOICES.map((x) => <option key={x} value={x}>{x}</option>)}
              </Select>
              <ScrubInput label="Wait" suffix="ms" title="Pause before this line" value={v.delay} min={0} max={6000} step={50} onChange={(x) => setVoice(i, { delay: x })} />
              <ScrubInput label="Rate" title="Speaking speed (Claude voices: 0.7–1.5)" value={v.rate} min={0.5} max={1.6} step={0.02} onChange={(x) => setVoice(i, { rate: x })} />
              {engine === "browser" && <ScrubInput label="Pitch" title="Pitch (browser voice only)" value={v.pitch} min={0.4} max={2} step={0.05} onChange={(x) => setVoice(i, { pitch: x })} />}
            </div>
          </div>
        ))}
      </PanelSection>

      <PanelSection title="Sound cues" action={<Btn variant="ghost" size="icon-sm" title="Add a sound" onClick={() => set((st) => ({ ...st, sounds: [...st.sounds, { sound: "pop", at: 500, volume: 0.7, pitch: 1 }] }))}><Plus /></Btn>}>
        {s.sounds.length === 0 && <Hint>No step sounds. Objects can have their own enter and tap sounds.</Hint>}
        {s.sounds.map((c, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <SoundSelect className="flex-1" value={c.sound} onChange={(x) => setCue(i, { sound: x as SoundName })} />
              <Btn variant="ghost" size="icon-sm" title="Hear it" onClick={() => playSound(c.sound, { volume: c.volume, pitch: c.pitch })}><Volume2 /></Btn>
              <Btn variant="ghost" size="icon-sm" title="Remove" onClick={() => set((st) => ({ ...st, sounds: st.sounds.filter((_, j) => j !== i) }))}><Minus /></Btn>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <ScrubInput label="At" title="Time from the start of the step" value={c.at} min={0} max={10000} step={10} onChange={(x) => setCue(i, { at: x })} />
              <ScrubInput label="Vol" value={c.volume} min={0} max={1.5} step={0.05} onChange={(x) => setCue(i, { volume: x })} />
              <ScrubInput label="Pit" title="Pitch" value={c.pitch} min={0.5} max={2} step={0.05} onChange={(x) => setCue(i, { pitch: x })} />
            </div>
          </div>
        ))}
      </PanelSection>

      <PanelSection title="Kid's recording">
        <div className="grid grid-cols-[1fr_96px] gap-1.5">
          <Select value={s.recording.mode} onChange={(e) => set((st) => ({ ...st, recording: { ...st.recording, mode: e.target.value as RecordingMode } }))}>
            <option value="keep">Keep what's playing</option>
            <option value="background">Quietly in background</option>
            <option value="play">Play in the player</option>
            <option value="off">Stop</option>
          </Select>
          <ScrubInput label="Vol" value={s.recording.volume} min={0} max={1} step={0.02} onChange={(x) => set((st) => ({ ...st, recording: { ...st.recording, volume: x } }))} />
        </div>
      </PanelSection>

      <PanelSection title="Next step">
        <div className="grid grid-cols-[1fr_96px] gap-1.5">
          <Select value={s.advance} onChange={(e) => set((st) => ({ ...st, advance: e.target.value as Advance }), false)}>
            <option value="auto">After a time</option>
            <option value="voice">After the voice-over</option>
            <option value="motion">After the animation</option>
            <option value="tap">On a tap</option>
          </Select>
          {s.advance !== "tap" ? <ScrubInput label="+" suffix="ms" title="Extra wait" value={s.after} min={0} max={8000} step={50} onChange={(x) => set((st) => ({ ...st, after: x }), false)} /> : <span />}
        </div>
        <Hint>Goes to: {s.next ? flow.script[s.next].title : "end of the flow"}</Hint>
      </PanelSection>

      {Object.keys(s.params).length > 0 && (
        <PanelSection title="Step settings">
          {Object.entries(s.params).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[1fr_96px] items-center gap-1.5">
              <span className="truncate text-xs text-zinc-600">{PARAM_LABELS[k] ?? k}</span>
              <ScrubInput label="#" value={v} min={0} max={PARAM_MAX[k] ?? 5000} step={PARAM_STEP[k] ?? 10} onChange={(x) => set((st) => ({ ...st, params: { ...st.params, [k]: x } }))} />
            </div>
          ))}
        </PanelSection>
      )}
    </>
  )
}
const SPEAKER_LABEL: Record<Voice, string> = { guide: "Narrator", mom: "Mom", dad: "Dad", grandma: "Grandma", kid: "Kid" }

/** One voice per role for the whole flow: sets the Claude voice on every line of that role, in every step. */
const ROLES: { role: Voice; label: string }[] = [
  { role: "guide", label: "Narrator" },
  { role: "mom", label: "Mom" },
]
const VOICE_SAMPLE: Record<Voice, string> = { guide: "You did it! You are a star!", mom: "Proud of you, Noa! I loved hearing you play!", dad: "Wow!", grandma: "Bravo!", kid: "I did it!" }
function VoicePicker() {
  const script = useScript()
  const flow = useFlow()
  const current = (role: Voice) => {
    const vs = STEP_IDS.flatMap((id) => script[id].voice.filter((v) => v.voice === role).map((v) => v.claudeVoice ?? ROLE_VOICE[role]))
    return vs.every((v) => v === vs[0]) ? (vs[0] ?? ROLE_VOICE[role]) : "mixed"
  }
  const setAll = (role: Voice, cv: ClaudeVoice) => {
    for (const id of STEP_IDS) {
      if (!script[id].voice.some((v) => v.voice === role)) continue
      scriptStore.setStep(id, (st) => ({ ...st, voice: st.voice.map((v) => (v.voice === role ? { ...v, claudeVoice: cv } : v)) }))
    }
    stopSpeech()
    void speak(VOICE_SAMPLE[role], role, { claudeVoice: cv })
  }
  return (
    <PanelSection title="Voices for the whole flow">
      <Hint>Pick one Claude voice per speaker; it's used for all their lines. A line can still pick its own below.</Hint>
      {ROLES.map(({ role, label }) => {
        const cur = current(role)
        return (
          <div key={role} className="grid grid-cols-[64px_1fr_auto] items-center gap-1.5">
            <span className="text-xs text-zinc-600">{label}</span>
            <Select value={cur} onChange={(e) => setAll(role, e.target.value as ClaudeVoice)}>
              {cur === "mixed" && <option value="mixed">Mixed</option>}
              {CLAUDE_VOICES.map((x) => <option key={x} value={x}>{x}</option>)}
            </Select>
            <Btn variant="ghost" size="icon-sm" title="Hear it" onClick={() => { stopSpeech(); void speak(VOICE_SAMPLE[role], role, { claudeVoice: cur === "mixed" ? undefined : (cur as ClaudeVoice) }) }}><Volume2 /></Btn>
          </div>
        )
      })}
      <span className="hidden">{flow.step}</span>
    </PanelSection>
  )
}

const PARAM_LABELS: Record<string, string> = { fps: "Glow-up frame rate", endFrame: "Cut to scatter at frame", loopIdle: "Idle loops", originX: "Scatter from x", originY: "Scatter from y", layoutMs: "Sticker glide (ms)", flyAt: "Fly starts (ms)", flyMs: "Fly time (ms)", playerVolume: "Player volume (on tap)" }
const PARAM_MAX: Record<string, number> = { playerVolume: 1, fps: 30, endFrame: 107, loopIdle: 4, originX: 1194, originY: 834 }
const PARAM_STEP: Record<string, number> = { playerVolume: 0.05, fps: 1, endFrame: 1, loopIdle: 1, originX: 1, originY: 1 }

function ObjectProps({ stepId, id, cfg, onBack }: { stepId: StepId; id: string; cfg: ObjCfg; onBack: () => void }) {
  const flow = useFlow()
  const replaySoon = useAutoReplay()
  const set = (p: Partial<ObjCfg>) => {
    scriptStore.setStep(stepId, (st) => ({ ...st, objects: { ...st.objects, [id]: { ...st.objects[id], ...p } } }))
    replaySoon()
  }
  const m = cfg.motion
  const setM = (p: Partial<MotionCfg>) => set({ motion: { ...m, ...p } })
  const def = DEFAULT_SCRIPT[stepId].objects[id]
  const usesDistance = ["slideUp", "slideDown", "slideLeft", "slideRight", "drop", "unfold"].includes(m.enter)
  const usesScale = ["pop", "zoom", "stamp", "scatter", "unfold"].includes(m.enter)
  const usesRotate = ["pop", "stamp", "scatter", "slideUp", "slideDown", "slideLeft", "slideRight", "drop"].includes(m.enter)
  const amtSuffix = m.idle === "wiggle" || m.idle === "spin" ? "°" : m.idle === "pulse" || m.idle === "breathe" ? "%" : "px"
  return (
    <>
      <PanelHeader
        icon={<Square />}
        title={cfg.label}
        sub={flow.script[stepId].title}
        action={
          <span className="flex">
            <Btn variant="ghost" size="icon-sm" title="Back to the step" onClick={onBack}><ArrowLeft /></Btn>
            <Btn variant="ghost" size="icon-sm" title="Reset this object" onClick={() => set(def)}><RotateCcw /></Btn>
          </span>
        }
      />
      <PanelSection title="Layer">
        <TextInput value={cfg.label} onChange={(e) => set({ label: e.target.value })} />
      </PanelSection>
      <PanelSection title="Enter" action={<Btn variant="ghost" size="icon-sm" title="Replay" onClick={() => flow.replay()}><Play /></Btn>}>
        <div className="grid grid-cols-2 gap-1.5">
          <Select value={m.enter} onChange={(e) => setM({ enter: e.target.value as MotionCfg["enter"] })} title="Preset">
            {ENTER_PRESETS.map((x) => <option key={x}>{x}</option>)}
          </Select>
          <Select value={m.ease} onChange={(e) => setM({ ease: e.target.value as MotionCfg["ease"] })} title="Easing">
            {EASES.map((x) => <option key={x}>{x}</option>)}
          </Select>
          <ScrubInput label="Delay" suffix="ms" value={m.delay} min={0} max={10000} step={10} onChange={(x) => setM({ delay: x })} />
          <ScrubInput label="Dur" suffix="ms" title="Duration" value={m.duration} min={40} max={4000} step={10} onChange={(x) => setM({ duration: x })} />
          {usesDistance && <ScrubInput label="Dist" suffix="px" title="Distance" value={m.distance} min={0} max={1200} step={5} onChange={(x) => setM({ distance: x })} />}
          {usesScale && <ScrubInput label="Scale" title="Start scale" value={m.scaleFrom} min={0} max={5} step={0.05} onChange={(x) => setM({ scaleFrom: x })} />}
          {usesRotate && <ScrubInput label="↻" suffix="°" title="Start rotation" value={m.rotateFrom} min={-720} max={720} step={5} onChange={(x) => setM({ rotateFrom: x })} />}
        </div>
        <EaseCurve ease={m.ease} />
      </PanelSection>
      <PanelSection title="Idle loop">
        <div className="grid grid-cols-2 gap-1.5">
          <Select value={m.idle} onChange={(e) => setM({ idle: e.target.value as MotionCfg["idle"] })} className="col-span-2" title="Preset">
            {IDLE_PRESETS.map((x) => <option key={x}>{x}</option>)}
          </Select>
          {m.idle !== "none" && (
            <>
              <ScrubInput label="Amt" suffix={amtSuffix} title="Amount" value={m.idleAmp} min={-40} max={40} step={0.5} onChange={(x) => setM({ idleAmp: x })} />
              <ScrubInput label="Loop" suffix="s" title="Seconds per loop" value={m.idleSpeed} min={0.2} max={12} step={0.1} onChange={(x) => setM({ idleSpeed: x })} />
            </>
          )}
        </div>
      </PanelSection>
      <PanelSection title="Sound">
        <span className="text-[11px] text-zinc-500">On enter</span>
        <div className="flex items-center gap-1">
          <SoundSelect className="flex-1" none value={cfg.enterSound} onChange={(x) => set({ enterSound: x as ObjCfg["enterSound"] })} />
          <Btn variant="ghost" size="icon-sm" title="Hear it" onClick={() => playSound(cfg.enterSound, { volume: cfg.enterVolume, pitch: cfg.enterPitch })}><Volume2 /></Btn>
        </div>
        {cfg.enterSound !== "none" && (
          <div className="grid grid-cols-2 gap-1.5">
            <ScrubInput label="Vol" value={cfg.enterVolume} min={0} max={1.5} step={0.05} onChange={(x) => set({ enterVolume: x })} />
            <ScrubInput label="Pit" title="Pitch" value={cfg.enterPitch} min={0.5} max={2} step={0.05} onChange={(x) => set({ enterPitch: x })} />
          </div>
        )}
        <span className="mt-1 text-[11px] text-zinc-500">On tap</span>
        <div className="flex items-center gap-1">
          <SoundSelect className="flex-1" none value={cfg.tapSound} onChange={(x) => set({ tapSound: x as ObjCfg["tapSound"] })} />
          <Btn variant="ghost" size="icon-sm" title="Hear it" onClick={() => playSound(cfg.tapSound)}><Volume2 /></Btn>
        </div>
      </PanelSection>
    </>
  )
}

/** A small preview of the easing curve (Figma's easing graph). */
const CURVES: Record<MotionCfg["ease"], string> = {
  linear: "M0 40 L80 0",
  out: "M0 40 C16 8 64 0 80 0",
  inOut: "M0 40 C52 40 28 0 80 0",
  overshoot: "M0 40 C27 -22 51 0 80 0",
  spring: "M0 40 C8 -4 14 -12 22 -6 S36 4 44 0 S60 -2 80 0",
  bounce: "M0 40 C12 40 18 0 28 0 Q36 14 44 0 Q50 6 56 0 Q60 2 80 0",
}
function EaseCurve({ ease }: { ease: MotionCfg["ease"] }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-zinc-50 px-2 py-2">
      <svg viewBox="-4 -16 88 60" className="h-11 w-20 overflow-visible" aria-hidden>
        <rect x="0" y="0" width="80" height="40" fill="none" stroke="#e4e4e7" strokeDasharray="2 2" />
        <path d={CURVES[ease]} fill="none" stroke="#18181b" strokeWidth="1.6" />
      </svg>
      <span className="text-[11px] text-zinc-500">{ease}</span>
    </div>
  )
}

// ─── Export / import ──────────────────────────────────────────────────────
function ExportDialog({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState(scriptStore.export())
  const [msg, setMsg] = useState("")
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-6" onClick={onClose}>
      <div className="flex max-h-[85vh] w-[720px] flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">Export or import the script</p>
            <p className="mt-1 text-sm text-zinc-500">Copy the JSON and send it to Claude to make it the default in the repo, or paste a script and load it.</p>
          </div>
          <Btn variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Btn>
        </div>
        <TextArea className="min-h-[340px] flex-1 font-[family-name:var(--font-ui-mono)] text-[11px]" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="default" onClick={() => { void navigator.clipboard?.writeText(scriptStore.export()).then(() => setMsg("Copied to the clipboard"), () => setMsg("Couldn't copy: select the text and copy it")) }}><Copy /> Copy JSON</Btn>
          <Btn onClick={() => { try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([scriptStore.export()], { type: "application/json" })); a.download = "fre-script.json"; a.click() } catch { setMsg("Downloads are blocked here: use Copy") } }}><Download /> Download</Btn>
          <Btn onClick={() => { try { scriptStore.replace(JSON.parse(text)); setMsg("Loaded") } catch { setMsg("That isn't valid JSON") } }}><Upload /> Load from the box</Btn>
          <div className="flex-1" />
          <Btn variant="ghost" onClick={() => { if (msg !== "Click again to reset everything") return setMsg("Click again to reset everything"); scriptStore.reset(); setText(scriptStore.export()); setMsg("Reset to the default script") }}><RotateCcw /> Reset all</Btn>
        </div>
        {msg && <Badge variant="outline" className="self-start">{msg}</Badge>}
      </div>
    </div>
  )
}

function SoundSelect({ value, onChange, none, className }: { value: string; onChange: (v: string) => void; none?: boolean; className?: string }) {
  return (
    <Select className={className} value={value} onChange={(e) => { onChange(e.target.value); playSound(e.target.value as SoundName, { volume: 0.7 }) }}>
      {none && <option value="none">None</option>}
      {SOUND_NAMES.map((x) => <option key={x} value={x}>{SOUND_LABELS[x]}</option>)}
    </Select>
  )
}
