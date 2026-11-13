/**
 * The live script: the default from script.ts, plus any edits made in the editor (kept in localStorage,
 * so the flow page in another tab plays the edited version too).
 */
import { useSyncExternalStore } from "react"
import { DEFAULT_SCRIPT, STEP_IDS, type Script, type StepCfg, type StepId, type ObjCfg } from "./script"

const KEY = "share-the-moment/fre-script/v1"
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

/** Merge a saved/imported script onto the defaults, so new fields and objects added later still show up. */
export function mergeScript(saved: Partial<Record<string, Partial<StepCfg>>> | null | undefined): Script {
  const out = clone(DEFAULT_SCRIPT)
  if (!saved) return out
  for (const id of STEP_IDS) {
    const s = saved[id]
    if (!s) continue
    const d = out[id]
    const objects: Record<string, ObjCfg> = { ...d.objects }
    for (const [k, o] of Object.entries(s.objects ?? {})) if (d.objects[k]) objects[k] = { ...d.objects[k], ...o, motion: { ...d.objects[k].motion, ...(o?.motion ?? {}) } }
    out[id] = {
      ...d,
      ...s,
      id,
      node: d.node,
      device: d.device,
      objects,
      params: { ...d.params, ...(s.params ?? {}) },
      recording: { ...d.recording, ...(s.recording ?? {}) },
      voice: s.voice ?? d.voice,
      sounds: s.sounds ?? d.sounds,
    }
  }
  return out
}

function load(): Script {
  try {
    const raw = localStorage.getItem(KEY)
    return mergeScript(raw ? JSON.parse(raw) : null)
  } catch {
    return clone(DEFAULT_SCRIPT)
  }
}

let script: Script = typeof window === "undefined" ? clone(DEFAULT_SCRIPT) : load()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(script))
  } catch {
    /* private mode: edits last for this visit only */
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      script = load()
      emit()
    }
  })
}

export const scriptStore = {
  get: () => script,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /** Replace one step (immutably). */
  setStep(id: StepId, fn: (s: StepCfg) => StepCfg) {
    script = { ...script, [id]: fn(clone(script[id])) }
    save()
    emit()
  },
  replace(next: Script) {
    script = mergeScript(next)
    save()
    emit()
  },
  reset(id?: StepId) {
    script = id ? { ...script, [id]: clone(DEFAULT_SCRIPT[id]) } : clone(DEFAULT_SCRIPT)
    save()
    emit()
  },
  isEdited: (id?: StepId) => (id ? JSON.stringify(script[id]) !== JSON.stringify(DEFAULT_SCRIPT[id]) : JSON.stringify(script) !== JSON.stringify(DEFAULT_SCRIPT)),
  export: () => JSON.stringify(script, null, 2),
}

export function useScript(): Script {
  return useSyncExternalStore(scriptStore.subscribe, scriptStore.get, scriptStore.get)
}
