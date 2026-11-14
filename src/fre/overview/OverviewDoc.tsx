/**
 * The Overview (Figma "Overview" 237:4827): a centred 720px column of docs-style content — title, description,
 * flow buttons, then sections of headings, notes, prose, lists, callouts and dividers — with the spacing of the
 * Figma frame (56 between sections, 20 inside, 8 between a label and its list). `editable` turns every block into
 * inline text editing with a small block toolbar (type, move, delete, add) — used in the Editor tab.
 */
import { Fragment, useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BLOCK_HINTS, BLOCK_LABELS, overviewStore, useOverview, type Block, type BlockType } from "./store"
import { OpenIcon } from "./icons"

const INK = "#09090b"
const BODY = "#3f3f46"
const MUTED = "#71717a"

/** Text style per block (Figma: Geist; sizes, line heights and tracking as in the frame). */
const TEXT: Partial<Record<BlockType, string>> = {
  h1: "text-[36px] leading-[40px] font-semibold tracking-[-0.72px] text-[#09090b]",
  lead: "w-[560px] max-w-full text-[17px] leading-[28px] text-[#71717a]",
  h2: "text-[24px] leading-[32px] font-semibold tracking-[-0.36px] text-[#09090b]",
  sub: "w-[560px] max-w-full text-[16px] leading-[28px] text-[#71717a]",
  label: "w-[560px] max-w-full text-[16px] leading-[28px] text-[#71717a]",
  h3: "text-[18px] leading-[28px] font-semibold tracking-[-0.18px] text-[#09090b]",
  p: "text-[16px] leading-[28px] text-[#3f3f46]",
}

/** Space above a block, from the block before it (Figma auto-layout gaps). */
function gapAbove(prev: BlockType | undefined, cur: BlockType) {
  if (!prev) return 0
  if (cur === "h2" || cur === "divider" || prev === "divider") return 56
  if (cur === "lead") return 12
  if (cur === "links") return 24
  if (cur === "sub" && prev === "h2") return 0
  if (cur === "label") return prev === "h2" ? 20 : 8
  if (cur === "ul") return prev === "label" ? 8 : 20
  if (cur === "callout") return prev === "p" ? 40 : 20
  return 20
}

const split = (t: string) => {
  const i = t.indexOf("|")
  return i < 0 ? [t.trim(), ""] : [t.slice(0, i).trim(), t.slice(i + 1).trim()]
}

/** **bold** runs and line breaks. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((run, i) =>
            run.startsWith("**") && run.endsWith("**") ? <strong key={i} className="font-bold">{run.slice(2, -2)}</strong> : <Fragment key={i}>{run}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  )
}

export function Button({ children, variant = "primary", href, icon, className }: { children: ReactNode; variant?: "primary" | "outline"; href?: string; icon?: ReactNode; className?: string }) {
  const cls = cn(
    "inline-flex h-9 shrink-0 items-center gap-2 rounded-[8px] px-4 text-[14px] leading-[20px] font-medium whitespace-nowrap transition-colors",
    variant === "primary" ? "bg-[#18181b] text-white hover:bg-[#27272a]" : "border border-[#e4e4e7] bg-white text-[#18181b] hover:bg-[#fafafa]",
    className,
  )
  const external = href?.startsWith("http")
  return (
    <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
      {icon}
    </a>
  )
}

function Bullet({ sub }: { sub?: boolean }) {
  return (
    <span className="relative h-[16px] w-[5px] shrink-0" aria-hidden>
      <span className={cn("absolute top-[11px] left-0 size-[5px] rounded-full", sub ? "border border-[#3f3f46]" : "bg-[#3f3f46]")} />
    </span>
  )
}

/** List: one item per line; lines starting with two spaces are sub-items of the item above (no gap between them). */
function List({ text, gap = 8 }: { text: string; gap?: number }) {
  const items: { text: string; subs: string[] }[] = []
  for (const l of text.split("\n")) {
    if (!l.trim()) continue
    if (/^(\s{2,}|\t)/.test(l) && items.length) items[items.length - 1].subs.push(l.trim())
    else items.push({ text: l.trim(), subs: [] })
  }
  return (
    <ul className="flex flex-col" style={{ gap }}>
      {items.map((it, i) => (
        <li key={i} className="flex flex-col text-[16px] leading-[28px] text-[#3f3f46]">
          <span className="flex items-start gap-[10px] pl-2">
            <Bullet />
            <span className="-mr-1 min-w-0 flex-1"><Rich text={it.text} /></span>
          </span>
          {it.subs.map((s, j) => (
            <span key={j} className="flex items-start gap-[10px] pl-8">
              <Bullet sub />
              <span className="min-w-0 flex-1"><Rich text={s} /></span>
            </span>
          ))}
        </li>
      ))}
    </ul>
  )
}

function Callout({ text }: { text: string }) {
  const [emoji, body] = split(text)
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[#c0cdfb] bg-[rgba(192,205,251,0.4)] p-4 font-semibold text-[#3f3f46]">
      {body && <span className="shrink-0 text-[32px] leading-[28px]">{emoji}</span>}
      <p className="min-w-0 flex-1 text-[16px] leading-[28px]">{body || emoji}</p>
    </div>
  )
}

function FlowLinks({ text }: { text: string }) {
  const [kid, mom] = split(text)
  return (
    <div className="flex gap-2">
      <Button href="#/kid">{kid || "Play the kid flow"}</Button>
      <Button href="#/parent" variant="outline">{mom || "Play the parent flow"}</Button>
    </div>
  )
}

function ViewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "links":
      return <FlowLinks text={block.text} />
    case "ul":
      return <List text={block.text} gap={block.gap} />
    case "callout":
      return <Callout text={block.text} />
    case "divider":
      return <div className="h-5 border-b border-[#e4e4e7]" />
    case "button": {
      const [label, href] = split(block.text)
      return <div><Button href={href || undefined} icon={href ? <OpenIcon /> : undefined}>{label}</Button></div>
    }
    case "h1":
      return <h1 className={TEXT.h1}><Rich text={block.text} /></h1>
    case "h2":
      return <h2 className={TEXT.h2}><Rich text={block.text} /></h2>
    case "h3":
      return <h3 className={TEXT.h3}><Rich text={block.text} /></h3>
    default:
      return <p className={TEXT[block.type]}><Rich text={block.text} /></p>
  }
}

export function OverviewDoc({ editable = false }: { editable?: boolean }) {
  const { blocks } = useOverview()
  return (
    <div className="flex w-full flex-col">
      {blocks.map((b, i) => {
        const style: CSSProperties = { marginTop: gapAbove(blocks[i - 1]?.type, b.type) }
        return editable ? <EditableBlock key={b.id} block={b} style={style} /> : <div key={b.id} style={style}><ViewBlock block={b} /></div>
      })}
      {editable && (
        <button type="button" onClick={() => overviewStore.insertAfter(null)} className="mt-10 flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <Plus className="size-4" /> Add a block
        </button>
      )}
    </div>
  )
}

function EditableBlock({ block, style }: { block: Block; style: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.innerText !== block.text) el.innerText = block.text
  }, [block.text])
  const commit = () => {
    const t = (ref.current?.innerText ?? "").replace(/\n+$/, "")
    if (t !== block.text) overviewStore.update(block.id, { text: t })
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !["ul", "p", "callout"].includes(block.type)) {
      e.preventDefault()
      commit()
      const id = overviewStore.insertAfter(block.id, "p")
      requestAnimationFrame(() => (document.querySelector(`[data-block="${id}"]`) as HTMLElement | null)?.focus())
    }
    if (e.key === "Backspace" && !ref.current?.innerText.trim()) {
      e.preventDefault()
      const { blocks } = overviewStore.get()
      const prev = blocks[blocks.findIndex((b) => b.id === block.id) - 1]
      overviewStore.remove(block.id)
      if (prev) requestAnimationFrame(() => (document.querySelector(`[data-block="${prev.id}"]`) as HTMLElement | null)?.focus())
    }
  }
  const rawText = block.type !== "divider"
  return (
    <div className="group relative" style={style}>
      <BlockBar block={block} />
      {rawText ? (
        <div className="rounded-sm outline-offset-4 focus-within:outline focus-within:outline-2 focus-within:outline-zinc-300 hover:outline hover:outline-1 hover:outline-zinc-200">
          {/* the live render of the block, then its source text to type in when focused */}
          <div className="group-focus-within:hidden" onClick={() => requestAnimationFrame(() => ref.current?.focus())}>
            <ViewBlock block={block} />
          </div>
          <div
            ref={ref}
            data-block={block.id}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            onBlur={commit}
            onKeyDown={onKey}
            data-placeholder={BLOCK_LABELS[block.type]}
            className={cn(
              "h-0 overflow-hidden whitespace-pre-wrap outline-none group-focus-within:h-auto",
              "empty:before:text-zinc-300 empty:before:content-[attr(data-placeholder)]",
              TEXT[block.type] ?? "text-[16px] leading-[28px] text-[#3f3f46]",
              "w-full max-w-full font-mono text-[14px] tracking-normal",
            )}
          />
          {BLOCK_HINTS[block.type] && <p className="hidden pt-1 text-xs text-zinc-400 group-focus-within:block">{BLOCK_HINTS[block.type]}</p>}
        </div>
      ) : (
        <ViewBlock block={block} />
      )}
    </div>
  )
}

function BlockBar({ block }: { block: Block }) {
  const icon = "grid size-6 place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
  return (
    <div className="absolute top-0 -left-[150px] z-10 flex h-8 w-[140px] items-center justify-end gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
      <select
        value={block.type}
        onChange={(e) => overviewStore.update(block.id, { type: e.target.value as BlockType })}
        className="h-6 max-w-[78px] rounded border border-zinc-200 bg-white px-1 text-[11px] text-zinc-600"
        aria-label="Block type"
      >
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
          <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
        ))}
      </select>
      <button type="button" className={icon} onClick={() => overviewStore.move(block.id, -1)} aria-label="Move up"><ArrowUp className="size-3.5" /></button>
      <button type="button" className={icon} onClick={() => overviewStore.move(block.id, 1)} aria-label="Move down"><ArrowDown className="size-3.5" /></button>
      <button type="button" className={icon} onClick={() => overviewStore.remove(block.id)} aria-label="Delete block"><Trash2 className="size-3.5" /></button>
      <button type="button" className={icon} onClick={() => overviewStore.insertAfter(block.id)} aria-label="Add a block below"><Plus className="size-3.5" /></button>
    </div>
  )
}

export const OVERVIEW_COLORS = { INK, BODY, MUTED }
