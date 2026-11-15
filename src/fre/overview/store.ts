/**
 * The Overview page's content: a list of text blocks. The default ships in overview-content.json; edits made in
 * the Editor tab are kept in this browser (localStorage) and, inside claude.ai, in the artifact database
 * (doc "fre/overview"), the same way the flow script is.
 */
import { useSyncExternalStore } from "react"
import DEFAULT from "./overview-content.json"

export type BlockType = "h1" | "lead" | "links" | "h2" | "sub" | "label" | "h3" | "p" | "ul" | "callout" | "button" | "divider"
export type Block = { id: string; type: BlockType; text: string; /** list item spacing (px), default 8 */ gap?: number }
export type Doc = { blocks: Block[] }

export const BLOCK_LABELS: Record<BlockType, string> = {
  h1: "Title",
  lead: "Description",
  links: "Flow buttons",
  h2: "Heading",
  sub: "Heading note",
  label: "Label",
  h3: "Subheading",
  p: "Paragraph",
  ul: "List",
  callout: "Callout",
  button: "Link button",
  divider: "Divider",
}

/** How each block's raw text is written (shown to the editor). */
export const BLOCK_HINTS: Partial<Record<BlockType, string>> = {
  p: "**bold** for bold; a new line is a line break.",
  ul: "One item per line; start a line with two spaces for a sub-item.",
  links: "Kid flow label | Mom flow label",
  callout: "emoji | text",
  button: "label | link",
}

const KEY = "share-the-moment/overview/v3"
export const DEFAULT_DOC = DEFAULT as Doc
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

function load(): Doc {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Doc) : clone(DEFAULT_DOC)
  } catch {
    return clone(DEFAULT_DOC)
  }
}

let doc: Doc = typeof window === "undefined" ? clone(DEFAULT_DOC) : load()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

type DocRef = {
  set: (d: Record<string, unknown>) => Promise<void>
  onSnapshot: (next: (s: { exists: boolean; data(): Record<string, unknown> | undefined; metadata: { hasPendingWrites: boolean } }) => void, err?: (e: unknown) => void) => () => void
}
let remote: DocRef | null = null
let timer = 0
let lastSaved = ""

const isDefault = () => JSON.stringify(doc) === JSON.stringify(DEFAULT_DOC)

function save() {
  try {
    if (isDefault()) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(doc))
  } catch {
    /* storage blocked */
  }
  if (remote) {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      const body = isDefault() ? "" : JSON.stringify(doc)
      if (body === lastSaved) return
      lastSaved = body
      void remote?.set({ doc: body, updatedAt: new Date().toISOString() }).catch(() => {})
    }, 600)
  }
}

async function connectRemote() {
  const c = (window as unknown as { claude?: { use: (n: string) => Promise<unknown> } }).claude
  if (!c?.use) return
  const db = (await c.use("db").catch(() => null)) as { doc: (p: string) => DocRef } | null
  if (!db) return
  const ref = db.doc("fre/overview")
  let first = true
  ref.onSnapshot((snap) => {
    if (snap.metadata.hasPendingWrites) return
    const raw = snap.exists ? String(snap.data()?.doc ?? "") : ""
    if (first) {
      first = false
      remote = ref
      if (!raw) {
        if (!isDefault()) save()
        return
      }
    }
    if (raw && raw !== lastSaved && raw !== JSON.stringify(doc)) {
      try {
        doc = JSON.parse(raw) as Doc
        emit()
      } catch {
        /* ignore */
      }
    }
    lastSaved = raw
  })
}
if (typeof window !== "undefined") {
  void connectRemote()
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      doc = load()
      emit()
    }
  })
}

const newId = () => "b" + Math.random().toString(36).slice(2, 8)

export const overviewStore = {
  get: () => doc,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  set(next: Doc) {
    doc = next
    emit()
    save()
  },
  update(id: string, patch: Partial<Block>) {
    this.set({ blocks: doc.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })
  },
  insertAfter(id: string | null, type: BlockType = "p") {
    const b: Block = { id: newId(), type, text: "" }
    const i = id ? doc.blocks.findIndex((x) => x.id === id) : doc.blocks.length - 1
    const blocks = [...doc.blocks]
    blocks.splice(i + 1, 0, b)
    this.set({ blocks })
    return b.id
  },
  remove(id: string) {
    this.set({ blocks: doc.blocks.filter((b) => b.id !== id) })
  },
  move(id: string, by: -1 | 1) {
    const blocks = [...doc.blocks]
    const i = blocks.findIndex((b) => b.id === id)
    const j = i + by
    if (i < 0 || j < 0 || j >= blocks.length) return
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    this.set({ blocks })
  },
  reset() {
    this.set(clone(DEFAULT_DOC))
  },
}

export function useOverview() {
  return useSyncExternalStore(overviewStore.subscribe, overviewStore.get, overviewStore.get)
}
