/**
 * #/editor — edit the flow's voice-over, sounds and the motion of every object, live.
 * Edits are saved in this browser and the #/flow page plays them. Export the JSON to make them the defaults.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Copy, Download, MousePointer2, Hand, Play, Plus, RotateCcw, Trash2, Upload, Volume2, X, ChevronLeft, ChevronRight, Repeat } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { speak, stopSpeech, unlockAudio } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { FlowProvider, useFlow } from "./runtime"
import { FlowStage } from "./FlowStage"
import { firstStepOf } from "./FlowChart"
import { scriptStore, useScript } from "./store"
import { playSound, SOUND_LABELS, SOUND_NAMES, type SoundName } from "./sounds"
import {
  DEFAULT_SCRIPT, EASES, ENTER_PRESETS, IDLE_PRESETS, NODES, STEP_IDS,
  type Advance, type MotionCfg, type ObjCfg, type RecordingMode, type SoundCue, type StepCfg, type StepId, type VoiceLine,
} from "./script"
import type { Voice } from "@/lib/audio"

type Sel = { step: StepId; obj: string } | null

export function Editor({ initial = "k-success" }: { initial?: StepId }) {
  const script = useScript()
  const [step, setStep] = useState<StepId>(initial)
  const [sel, setSel] = useState<Sel>(null)
  const [hold, setHold] = useState(true)
  const [selecting, setSelecting] = useState(true)
  const [started, setStarted] = useState(false)
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

  return (
    <FlowProvider script={script} initial={initial} started={started} edit selecting={selecting} hold={hold} selected={sel} onSelect={onSelect} onStep={onStep}>
      <div className="grid h-dvh grid-cols-[250px_minmax(0,1fr)_360px] grid-rows-[auto_minmax(0,1fr)] bg-[#0b1f1b] text-[13px] text-cream">
        <TopBar hold={hold} setHold={setHold} selecting={selecting} setSelecting={setSelecting} />
        <StepList sel={sel} setSel={setSel} />
        <Center started={started} onStart={() => { unlockAudio(); setStarted(true) }} />
        <Inspector sel={sel} setSel={setSel} />
      </div>
    </FlowProvider>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────
function TopBar({ hold, setHold, selecting, setSelecting }: { hold: boolean; setHold: (v: boolean) => void; selecting: boolean; setSelecting: (v: boolean) => void }) {
  const flow = useFlow()
  const [io, setIo] = useState(false)
  const edited = scriptStore.isEdited()
  const i = STEP_IDS.indexOf(flow.step)
  return (
    <header className="col-span-3 flex items-center gap-2 border-b border-cream/10 px-4 py-2.5">
      <a href="#/flow" className="mr-3 flex items-center gap-2">
        <Sticker name="sparkle" size={28} lift={false} />
        <span className="font-display text-[17px]">Flow editor</span>
      </a>
      <button type="button" className={btn} onClick={() => flow.go(STEP_IDS[Math.max(0, i - 1)])} aria-label="Previous step"><ChevronLeft className="size-4" /></button>
      <button type="button" className={cn(btn, "bg-orange text-ink hover:bg-orange/90")} onClick={() => flow.replay()}>
        <Play className="size-4 fill-ink" /> Replay step
      </button>
      <button type="button" className={btn} onClick={() => flow.go(STEP_IDS[Math.min(STEP_IDS.length - 1, i + 1)])} aria-label="Next step"><ChevronRight className="size-4" /></button>
      <label className={cn(btn, "cursor-pointer")}>
        <input type="checkbox" className="accent-orange" checked={!hold} onChange={(e) => setHold(!e.target.checked)} />
        <Repeat className="size-4" /> Continue to next steps
      </label>
      <div className="ml-2 flex overflow-hidden rounded-lg border border-cream/15">
        <button type="button" onClick={() => setSelecting(true)} className={cn("flex items-center gap-1.5 px-3 py-1.5 font-semibold", selecting ? "bg-periwinkle text-ink" : "hover:bg-cream/10")}>
          <MousePointer2 className="size-4" /> Select
        </button>
        <button type="button" onClick={() => setSelecting(false)} className={cn("flex items-center gap-1.5 px-3 py-1.5 font-semibold", !selecting ? "bg-periwinkle text-ink" : "hover:bg-cream/10")}>
          <Hand className="size-4" /> Interact
        </button>
      </div>
      <div className="flex-1" />
      <span className={cn("text-[12px]", edited ? "text-orange" : "text-cream/45")}>{edited ? "Edited · saved in this browser" : "Default script"}</span>
      <button type="button" className={btn} onClick={() => setIo(true)}>
        <Download className="size-4" /> Export / import
      </button>
      <a className={btn} href={`#/flow`}>
        <Play className="size-4" /> Open flow
      </a>
      {io && <ExportDialog onClose={() => setIo(false)} />}
    </header>
  )
}

// ─── Left: flow chart as a step list + the step's objects ──────────────────
function StepList({ sel, setSel }: { sel: Sel; setSel: (s: Sel) => void }) {
  const flow = useFlow()
  return (
    <aside className="fre-scroll overflow-y-auto border-r border-cream/10 px-3 py-3">
      {NODES.map((n) => (
        <div key={n.id} className="mb-3">
          <button type="button" onClick={() => flow.go(firstStepOf(flow.script, n.id))} className="mb-1 flex w-full items-baseline gap-2 px-1 text-left">
            <span className={cn("rounded px-1.5 py-px text-[10px] font-bold tracking-wider uppercase", n.lane === "kid" ? "bg-orange/20 text-orange" : "bg-periwinkle/20 text-periwinkle")}>{n.lane}</span>
            <span className="font-semibold text-cream/85">{n.title}</span>
          </button>
          {STEP_IDS.filter((s) => flow.script[s].node === n.id).map((s) => {
            const active = s === flow.step
            const objs = Object.entries(flow.script[s].objects)
            return (
              <div key={s}>
                <button type="button" onClick={() => { flow.go(s); setSel(null) }} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left", active ? "bg-cream/12 text-cream" : "text-cream/65 hover:bg-cream/6")}>
                  <span className="flex-1 truncate">{flow.script[s].title}</span>
                  {scriptStore.isEdited(s) && <span className="size-1.5 rounded-full bg-orange" title="Edited" />}
                </button>
                {active && objs.length > 0 && (
                  <div className="mt-1 mb-2 ml-3 border-l border-cream/10 pl-2">
                    {objs.map(([id, o]) => (
                      <button key={id} type="button" onClick={() => setSel({ step: s, obj: id })} className={cn("block w-full truncate rounded-md px-2 py-1 text-left text-[12px]", sel?.step === s && sel.obj === id ? "bg-periwinkle text-ink" : "text-cream/60 hover:bg-cream/6")}>
                        {o.label}
                      </button>
                    ))}
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

// ─── Center: the stage + the step timeline ───────────────────────────────
function Center({ started, onStart }: { started: boolean; onStart: () => void }) {
  return (
    <main className="flex min-h-0 flex-col">
      <div className="relative min-h-0 flex-1 p-4" onClick={(e) => e.currentTarget === e.target && undefined}>
        <FlowStage />
        {!started && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-[#0b1f1b]/90">
            <button type="button" onClick={onStart} className="sticker inline-flex items-center gap-2 rounded-full bg-orange px-7 py-3.5 font-display text-[22px] text-ink [--kiss:var(--sticker-pink)]">
              <Play className="size-5 fill-ink" /> Start editing (sound on)
            </button>
          </div>
        )}
      </div>
      <Timeline />
    </main>
  )
}

/** Drag bars to change an object's delay (body) or duration (right edge); drag sound cues along the line. */
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
    <div className="max-h-[34%] shrink-0 border-t border-cream/10 px-4 py-2">
      <div className="mb-1 flex items-center justify-between text-[11px] text-cream/45">
        <span className="font-bold tracking-wider uppercase">Timeline · {s.title}</span>
        <span>drag a bar to move it · drag its right edge to change its length</span>
      </div>
      <div className="fre-scroll max-h-[180px] overflow-y-auto">
        <div className="grid grid-cols-[150px_1fr] items-center gap-x-2 gap-y-1">
          <span className="truncate text-cream/55">Sounds</span>
          <div ref={track} className="relative h-6 rounded bg-cream/5">
            {Array.from({ length: Math.floor(end / 1000) + 1 }, (_, i) => (
              <span key={i} className="absolute top-0 h-full border-l border-cream/10 pl-1 text-[10px] text-cream/30" style={{ left: pct(i * 1000) }}>{i}s</span>
            ))}
            {s.sounds.map((c, i) => (
              <button key={i} type="button" title={`${SOUND_LABELS[c.sound]} · ${c.at}ms`} onPointerDown={(e) => drag(e, (ms) => setCue(i, ms), c.at)} className="absolute top-1 size-4 -translate-x-1/2 rotate-45 cursor-ew-resize rounded-[3px] bg-pink" style={{ left: pct(c.at) }} />
            ))}
          </div>
          {objs.map(([id, o]) => {
            const m = o.motion
            const selected = flow.selected?.step === s.id && flow.selected.obj === id
            return (
              <Row key={id} label={o.label} selected={selected} onClick={() => flow.select(s.id, id)}>
                {m.enter !== "none" ? (
                  <div
                    className={cn("absolute top-1 h-4 cursor-grab rounded", selected ? "bg-periwinkle" : "bg-teal")}
                    style={{ left: pct(m.delay), width: pct(Math.max(60, m.duration)) }}
                    onPointerDown={(e) => drag(e, (ms) => setObj(id, { delay: ms }), m.delay)}
                    title={`${m.enter} · ${m.delay}ms + ${m.duration}ms`}
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-1.5 truncate text-[10px] leading-4 font-semibold text-ink">{m.enter}</span>
                    <span className="absolute inset-y-0 right-0 w-2 cursor-ew-resize rounded-r bg-black/25" onPointerDown={(e) => drag(e, (ms) => setObj(id, { duration: Math.max(40, ms) }), m.duration)} />
                  </div>
                ) : (
                  <span className="absolute top-1 left-1 text-[10px] text-cream/35">no enter motion</span>
                )}
                {m.idle !== "none" && <span className="absolute top-[22px] h-[3px] rounded bg-orange/60" style={{ left: pct(m.delay + m.duration), right: 0 }} title={`idle: ${m.idle}`} />}
              </Row>
            )
          })}
        </div>
      </div>
    </div>
  )
}
function Row({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <>
      <button type="button" onClick={onClick} className={cn("truncate text-left", selected ? "font-semibold text-periwinkle" : "text-cream/65")}>{label}</button>
      <div className="relative h-[26px] rounded bg-cream/5" onClick={onClick}>{children}</div>
    </>
  )
}

// ─── Right: inspector ────────────────────────────────────────────────────
function Inspector({ sel, setSel }: { sel: Sel; setSel: (s: Sel) => void }) {
  const flow = useFlow()
  const obj = sel && sel.step === flow.step ? flow.script[sel.step].objects[sel.obj] : null
  const [tab, setTab] = useState<"step" | "object">("step")
  useEffect(() => setTab(obj ? "object" : "step"), [obj, sel?.obj])
  return (
    <aside className="fre-scroll overflow-y-auto border-l border-cream/10">
      <div className="sticky top-0 z-10 flex border-b border-cream/10 bg-[#0b1f1b]">
        <TabBtn on={tab === "step"} onClick={() => setTab("step")}>Step: voice & sound</TabBtn>
        <TabBtn on={tab === "object"} onClick={() => setTab("object")} disabled={!obj}>
          {obj ? `Object: ${obj.label}` : "Object (select one)"}
        </TabBtn>
      </div>
      {tab === "step" || !obj || !sel ? <StepInspector /> : <ObjectInspector stepId={sel.step} id={sel.obj} cfg={obj} onClose={() => setSel(null)} />}
    </aside>
  )
}
const TabBtn = ({ on, children, ...p }: { on: boolean; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" {...p} className={cn("flex-1 truncate px-3 py-2.5 text-left text-[12px] font-semibold disabled:opacity-40", on ? "border-b-2 border-orange text-cream" : "text-cream/55")}>{children}</button>
)

/** Replays the step shortly after the last edit, so you see/hear the change. */
function useAutoReplay() {
  const flow = useFlow()
  const t = useRef(0)
  return () => {
    clearTimeout(t.current)
    t.current = window.setTimeout(() => flow.replay(), 450)
  }
}

function StepInspector() {
  const flow = useFlow()
  const s = flow.cfg
  const replaySoon = useAutoReplay()
  const set = (fn: (s: StepCfg) => StepCfg, replay = true) => {
    scriptStore.setStep(s.id, fn)
    if (replay) replaySoon()
  }
  const setVoice = (i: number, p: Partial<VoiceLine>) => set((st) => ({ ...st, voice: st.voice.map((v, j) => (j === i ? { ...v, ...p } : v)) }), false)
  const setCue = (i: number, p: Partial<SoundCue>) => set((st) => ({ ...st, sounds: st.sounds.map((c, j) => (j === i ? { ...c, ...p } : c)) }))
  return (
    <div className="flex flex-col gap-5 p-4">
      <Section title={s.title} action={<ResetBtn onClick={() => { scriptStore.reset(s.id); flow.replay() }} />}>
        <textarea className={cn(input, "h-16")} value={s.note} onChange={(e) => set((st) => ({ ...st, note: e.target.value }), false)} />
      </Section>

      <Section title="Voice-over" hint="Lines play in order. Text is also shown as a caption.">
        {s.voice.map((v, i) => (
          <div key={i} className="rounded-xl border border-cream/10 bg-cream/4 p-2.5">
            <textarea className={cn(input, "mb-2 h-14 text-[14px]")} value={v.text} onChange={(e) => setVoice(i, { text: e.target.value })} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <Field label="Voice">
                <select className={input} value={v.voice} onChange={(e) => setVoice(i, { voice: e.target.value as Voice })}>
                  {(["guide", "mom", "dad", "grandma", "kid"] as Voice[]).map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Num label="Pause before (ms)" value={v.delay} min={0} max={4000} step={50} onChange={(x) => setVoice(i, { delay: x })} />
              <Num label="Speed" value={v.rate} min={0.5} max={1.6} step={0.02} onChange={(x) => setVoice(i, { rate: x })} />
              <Num label="Pitch" value={v.pitch} min={0.4} max={2} step={0.05} onChange={(x) => setVoice(i, { pitch: x })} />
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className={btnSm} onClick={() => { stopSpeech(); void speak(v.text, v.voice, { rate: v.rate, pitch: v.pitch }) }}><Volume2 className="size-3.5" /> Hear it</button>
              <button type="button" className={btnSm} onClick={() => set((st) => ({ ...st, voice: st.voice.filter((_, j) => j !== i) }), false)}><Trash2 className="size-3.5" /> Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className={btnSm} onClick={() => set((st) => ({ ...st, voice: [...st.voice, { text: "New line", voice: "guide", delay: 200, rate: 1.02, pitch: 1.35 }] }), false)}><Plus className="size-3.5" /> Add a line</button>
      </Section>

      <Section title="Sound cues" hint="Times are from the start of the step. Object sounds are on each object.">
        {s.sounds.map((c, i) => (
          <div key={i} className="rounded-xl border border-cream/10 bg-cream/4 p-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <Field label="Sound"><SoundSelect value={c.sound} onChange={(x) => setCue(i, { sound: x as SoundName })} /></Field>
              <Num label="At (ms)" value={c.at} min={0} max={8000} step={50} onChange={(x) => setCue(i, { at: x })} />
              <Num label="Volume" value={c.volume} min={0} max={1.5} step={0.05} onChange={(x) => setCue(i, { volume: x })} />
              <Num label="Pitch" value={c.pitch} min={0.5} max={2} step={0.05} onChange={(x) => setCue(i, { pitch: x })} />
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className={btnSm} onClick={() => playSound(c.sound, { volume: c.volume, pitch: c.pitch })}><Volume2 className="size-3.5" /> Hear it</button>
              <button type="button" className={btnSm} onClick={() => set((st) => ({ ...st, sounds: st.sounds.filter((_, j) => j !== i) }))}><Trash2 className="size-3.5" /> Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className={btnSm} onClick={() => set((st) => ({ ...st, sounds: [...st.sounds, { sound: "pop", at: 500, volume: 0.7, pitch: 1 }] }))}><Plus className="size-3.5" /> Add a sound</button>
      </Section>

      <Section title="The kid's recording">
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="During this step">
            <select className={input} value={s.recording.mode} onChange={(e) => set((st) => ({ ...st, recording: { ...st.recording, mode: e.target.value as RecordingMode } }))}>
              <option value="keep">keep what's playing</option>
              <option value="background">play quietly (background)</option>
              <option value="play">play (player)</option>
              <option value="off">stop</option>
            </select>
          </Field>
          <Num label="Volume" value={s.recording.volume} min={0} max={1} step={0.02} onChange={(x) => set((st) => ({ ...st, recording: { ...st.recording, volume: x } }))} />
        </div>
      </Section>

      <Section title="Moving on">
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Next step starts">
            <select className={input} value={s.advance} onChange={(e) => set((st) => ({ ...st, advance: e.target.value as Advance }), false)}>
              <option value="auto">after a time</option>
              <option value="voice">after the voice-over</option>
              <option value="motion">after the animation</option>
              <option value="tap">on a tap</option>
            </select>
          </Field>
          {s.advance !== "tap" && <Num label="Wait (ms)" value={s.after} min={0} max={6000} step={50} onChange={(x) => set((st) => ({ ...st, after: x }), false)} />}
        </div>
        <p className="text-[12px] text-cream/45">Next: {s.next ? flow.script[s.next].title : "end of the flow"}</p>
      </Section>

      {Object.keys(s.params).length > 0 && (
        <Section title="Step settings">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {Object.entries(s.params).map(([k, v]) => (
              <Num key={k} label={PARAM_LABELS[k] ?? k} value={v} min={0} max={PARAM_MAX[k] ?? 3000} step={PARAM_STEP[k] ?? 10} onChange={(x) => set((st) => ({ ...st, params: { ...st.params, [k]: x } }))} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
const PARAM_LABELS: Record<string, string> = { fps: "Glow-up frame rate", endFrame: "Cut to scatter at frame", loopIdle: "Idle loops", originX: "Scatter from x", originY: "Scatter from y", layoutMs: "Sticker glide (ms)", flyAt: "Fly starts (ms)", flyMs: "Fly time (ms)" }
const PARAM_MAX: Record<string, number> = { fps: 30, endFrame: 107, loopIdle: 4, originX: 1194, originY: 834 }
const PARAM_STEP: Record<string, number> = { fps: 1, endFrame: 1, loopIdle: 1, originX: 1, originY: 1 }

function ObjectInspector({ stepId, id, cfg, onClose }: { stepId: StepId; id: string; cfg: ObjCfg; onClose: () => void }) {
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
  return (
    <div className="flex flex-col gap-5 p-4">
      <Section
        title={cfg.label}
        action={
          <span className="flex gap-1.5">
            <ResetBtn onClick={() => set(def)} />
            <button type="button" className={btnSm} onClick={onClose} aria-label="Deselect"><X className="size-3.5" /></button>
          </span>
        }
      >
        <input className={input} value={cfg.label} onChange={(e) => set({ label: e.target.value })} />
        <button type="button" className={cn(btnSm, "self-start bg-orange text-ink")} onClick={() => flow.replay()}><Play className="size-3.5 fill-ink" /> Replay</button>
      </Section>
      <Section title="Enter motion">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="Preset">
            <select className={input} value={m.enter} onChange={(e) => setM({ enter: e.target.value as MotionCfg["enter"] })}>
              {ENTER_PRESETS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Easing">
            <select className={input} value={m.ease} onChange={(e) => setM({ ease: e.target.value as MotionCfg["ease"] })}>
              {EASES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Num label="Delay (ms)" value={m.delay} min={0} max={6000} step={10} onChange={(x) => setM({ delay: x })} />
          <Num label="Duration (ms)" value={m.duration} min={40} max={3000} step={10} onChange={(x) => setM({ duration: x })} />
          {usesDistance && <Num label="Distance (px)" value={m.distance} min={0} max={900} step={5} onChange={(x) => setM({ distance: x })} />}
          {usesScale && <Num label="Start scale" value={m.scaleFrom} min={0} max={4} step={0.05} onChange={(x) => setM({ scaleFrom: x })} />}
          {usesRotate && <Num label="Start turn (°)" value={m.rotateFrom} min={-360} max={360} step={5} onChange={(x) => setM({ rotateFrom: x })} />}
        </div>
      </Section>
      <Section title="Idle loop" hint="Plays after the enter motion, for as long as the object is on screen.">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="Preset">
            <select className={input} value={m.idle} onChange={(e) => setM({ idle: e.target.value as MotionCfg["idle"] })}>
              {IDLE_PRESETS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Num label={m.idle === "wiggle" ? "Amount (°)" : m.idle === "pulse" || m.idle === "breathe" ? "Amount (%)" : "Amount (px)"} value={m.idleAmp} min={-20} max={40} step={0.5} onChange={(x) => setM({ idleAmp: x })} />
          <Num label="Seconds per loop" value={m.idleSpeed} min={0.2} max={12} step={0.1} onChange={(x) => setM({ idleSpeed: x })} />
        </div>
      </Section>
      <Section title="Sounds">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <Field label="When it enters"><SoundSelect value={cfg.enterSound} none onChange={(x) => set({ enterSound: x as ObjCfg["enterSound"] })} /></Field>
          <Num label="Volume" value={cfg.enterVolume} min={0} max={1.5} step={0.05} onChange={(x) => set({ enterVolume: x })} />
          <Num label="Pitch" value={cfg.enterPitch} min={0.5} max={2} step={0.05} onChange={(x) => set({ enterPitch: x })} />
          <div className="flex items-end">
            <button type="button" className={btnSm} onClick={() => playSound(cfg.enterSound, { volume: cfg.enterVolume, pitch: cfg.enterPitch })}><Volume2 className="size-3.5" /> Hear it</button>
          </div>
          <Field label="When tapped"><SoundSelect value={cfg.tapSound} none onChange={(x) => set({ tapSound: x as ObjCfg["tapSound"] })} /></Field>
          <div className="flex items-end">
            <button type="button" className={btnSm} onClick={() => playSound(cfg.tapSound)}><Volume2 className="size-3.5" /> Hear it</button>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ─── Export / import ──────────────────────────────────────────────────────
function ExportDialog({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState(scriptStore.export())
  const [msg, setMsg] = useState("")
  const json = useMemo(() => scriptStore.export(), [])
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-6" onClick={onClose}>
      <div className="flex max-h-[85vh] w-[760px] flex-col gap-3 rounded-2xl border border-cream/15 bg-[#0f2925] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-display text-[20px]">Export / import the script</p>
          <button type="button" className={btnSm} onClick={onClose}><X className="size-4" /></button>
        </div>
        <p className="text-cream/60">Copy this and send it to Claude to make it the new default in the repo, or paste a script here to load it.</p>
        <textarea className={cn(input, "min-h-[360px] flex-1 font-mono text-[11px]")} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={cn(btn, "bg-orange text-ink hover:bg-orange/90")} onClick={() => { void navigator.clipboard.writeText(json); setMsg("Copied") }}><Copy className="size-4" /> Copy JSON</button>
          <button type="button" className={btn} onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = "fre-script.json"; a.click() }}><Download className="size-4" /> Download</button>
          <button type="button" className={btn} onClick={() => { try { scriptStore.replace(JSON.parse(text)); setMsg("Loaded") } catch { setMsg("That isn't valid JSON") } }}><Upload className="size-4" /> Load from the box</button>
          <button type="button" className={btn} onClick={() => { if (msg !== "Click again to reset everything") return setMsg("Click again to reset everything"); scriptStore.reset(); setText(scriptStore.export()); setMsg("Reset") }}><RotateCcw className="size-4" /> Reset all</button>
          <span className="text-orange">{msg}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Form bits ─────────────────────────────────────────────────────────────
const input = "w-full rounded-lg border border-cream/15 bg-black/25 px-2 py-1.5 text-cream outline-none focus:border-periwinkle"
const btn = "inline-flex items-center gap-1.5 rounded-lg border border-cream/15 bg-cream/5 px-3 py-1.5 font-semibold text-cream hover:bg-cream/10"
const btnSm = "inline-flex items-center gap-1 rounded-md border border-cream/15 bg-cream/5 px-2 py-1 text-[12px] font-semibold text-cream hover:bg-cream/10"

function Section({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold tracking-wider text-cream/55 uppercase">{title}</h3>
        {action}
      </div>
      {hint && <p className="-mt-1 text-[11px] text-cream/40">{hint}</p>}
      {children}
    </section>
  )
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] text-cream/50">{label}</span>
      {children}
    </label>
  )
}
function Num({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <span className="flex items-center gap-2">
        <input type="range" className="min-w-0 flex-1 accent-orange" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <input type="number" className={cn(input, "w-[64px] px-1.5 py-1 text-right")} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </span>
    </Field>
  )
}
function SoundSelect({ value, onChange, none }: { value: string; onChange: (v: string) => void; none?: boolean }) {
  return (
    <select className={input} value={value} onChange={(e) => { onChange(e.target.value); playSound(e.target.value as SoundName, { volume: 0.7 }) }}>
      {none && <option value="none">none</option>}
      {SOUND_NAMES.map((x) => <option key={x} value={x}>{SOUND_LABELS[x]}</option>)}
    </select>
  )
}
function ResetBtn({ onClick }: { onClick: () => void }) {
  return <button type="button" className={btnSm} onClick={onClick} title="Back to the default"><RotateCcw className="size-3.5" /> Reset</button>
}
