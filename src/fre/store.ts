/**
 * The live script: the default from script.ts, plus any edits made in the editor (kept in localStorage,
 * so the flow page in another tab plays the edited version too).
 */
import { useSyncExternalStore } from "react"
import { DEFAULT_SCRIPT, STEP_IDS, type Script, type StepCfg, type StepId, type ObjCfg } from "./script"

const KEY = "share-the-moment/fre-script/v2"
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

/** Only the fields that differ from the defaults (objects and motion field by field). */
function diff(sc: Script) {
  const out: Record<string, Record<string, unknown>> = {}
  for (const id of STEP_IDS) {
    const a = sc[id] as unknown as Record<string, unknown>
    const d = DEFAULT_SCRIPT[id] as unknown as Record<string, unknown>
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(a)) {
      if (k === "objects") {
        const objs: Record<string, unknown> = {}
        for (const [oid, ob] of Object.entries(sc[id].objects)) {
          const dob = DEFAULT_SCRIPT[id].objects[oid]
          if (!dob || JSON.stringify(ob) === JSON.stringify(dob)) continue
          const od: Record<string, unknown> = {}
          for (const [f, v] of Object.entries(ob)) if (JSON.stringify(v) !== JSON.stringify((dob as unknown as Record<string, unknown>)[f])) od[f] = f === "motion" ? Object.fromEntries(Object.entries(v as object).filter(([mk, mv]) => mv !== (dob.motion as unknown as Record<string, unknown>)[mk])) : v
          objs[oid] = od
        }
        if (Object.keys(objs).length) o.objects = objs
      } else if (JSON.stringify(a[k]) !== JSON.stringify(d[k])) o[k] = a[k]
    }
    if (Object.keys(o).length) out[id] = o
  }
  return out
}

// ─── Saving ───────────────────────────────────────────────────────────────
// Every edit is kept in this browser (localStorage) and, when the page runs as a claude.ai artifact,
// in the artifact's database (doc "fre/script"), so it survives reloads, other browsers and republishes.
export type SaveStatus = "connecting" | "saving" | "saved" | "local" | "error"
let status: SaveStatus = "local"
let lastSaved = ""
const statusListeners = new Set<() => void>()
const setStatus = (s: SaveStatus) => {
  status = s
  statusListeners.forEach((l) => l())
}
export function useSaveStatus() {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l)
      return () => statusListeners.delete(l)
    },
    () => status,
    () => status,
  )
}

type DocRef = {
  set: (d: Record<string, unknown>) => Promise<void>
  onSnapshot: (next: (s: { exists: boolean; data(): Record<string, unknown> | undefined; metadata: { hasPendingWrites: boolean } }) => void, err?: (e: { code: string }) => void) => () => void
}
let remote: DocRef | null = null
let writing = false
let queued = false
let timer = 0

async function writeRemote() {
  if (!remote) return
  if (writing) {
    queued = true
    return
  }
  writing = true
  const body = JSON.stringify(diff(script))
  try {
    if (body !== lastSaved) {
      setStatus("saving")
      await remote.set({ diff: body, updatedAt: new Date().toISOString() })
      lastSaved = body
    }
    setStatus("saved")
  } catch {
    setStatus("error")
  } finally {
    writing = false
    if (queued) {
      queued = false
      void writeRemote()
    }
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(diff(script)))
  } catch {
    /* storage blocked: the artifact database (if any) still keeps the edits */
  }
  if (remote) {
    setStatus("saving")
    clearTimeout(timer)
    timer = window.setTimeout(() => void writeRemote(), 600)
  }
}

/** Connect to the artifact database when the page runs inside claude.ai. */
async function connectRemote() {
  const c = (window as unknown as { claude?: { use: (n: string) => Promise<unknown> } }).claude
  if (!c?.use) return
  setStatus("connecting")
  type Db = { doc: (p: string) => DocRef }
  const db = (await c.use("db").catch(() => null)) as Db | null
  if (!db) return setStatus("local")
  const ref = db.doc("fre/script")
  let first = true
  ref.onSnapshot(
    (snap) => {
      if (snap.metadata.hasPendingWrites) return
      const raw = snap.exists ? String(snap.data()?.diff ?? "") : ""
      if (first) {
        first = false
        remote = ref
        if (!raw) {
          // Nothing stored yet: keep what this browser has and store it.
          void writeRemote()
          return
        }
      }
      if (raw && raw !== lastSaved && raw !== JSON.stringify(diff(script))) {
        try {
          script = mergeScript(JSON.parse(raw))
          emit()
        } catch {
          /* ignore a malformed document */
        }
      }
      lastSaved = raw || lastSaved
      setStatus("saved")
    },
    () => setStatus("error"),
  )
}
if (typeof window !== "undefined") void connectRemote()

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
