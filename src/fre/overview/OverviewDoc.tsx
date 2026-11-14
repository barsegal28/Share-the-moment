/**
 * The Overview: a single centred column of docs-style content (structure and type after the shadcn/ui docs:
 * title, description, then headings, prose, lists and callouts). `editable` turns every block into inline text
 * editing with a small block toolbar (type, move, delete, add) — used in the Editor tab.
 */
import { useEffect, useRef, type KeyboardEvent } from "react"
import { ArrowDown, ArrowUp, Gamepad2, Plus, Smartphone, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BLOCK_LABELS, overviewStore, useOverview, type Block, type BlockType } from "./store"

const STYLE: Record<BlockType, string> = {
  h1: "scroll-m-20 text-4xl font-semibold tracking-tight text-zinc-950",
  lead: "mt-3 text-[1.05rem] leading-relaxed text-balance text-zinc-500",
  h2: "mt-14 scroll-m-20 border-b border-zinc-200 pb-2 text-2xl font-semibold tracking-tight text-zinc-950",
  h3: "mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-zinc-950",
  p: "mt-5 leading-7 text-zinc-700",
  ul: "mt-5 leading-7 text-zinc-700",
  callout: "mt-6 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700",
  links: "mt-6",
}

export function OverviewDoc({ editable = false }: { editable?: boolean }) {
  const { blocks } = useOverview()
  return (
    <article className="mx-auto w-full max-w-[720px] px-6 pt-12 pb-32">
      {blocks.map((b) => (editable ? <EditableBlock key={b.id} block={b} /> : <ViewBlock key={b.id} block={b} />))}
      {editable && (
        <button type="button" onClick={() => overviewStore.insertAfter(null)} className="mt-8 flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <Plus className="size-4" /> Add a block
        </button>
      )}
    </article>
  )
}

function FlowLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      <a href="#/kid" className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
        <Gamepad2 className="size-4" /> Play the kid flow
      </a>
      <a href="#/parent" className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-xs hover:bg-zinc-50">
        <Smartphone className="size-4" /> Play the parent flow
      </a>
    </div>
  )
}

function Tag({ type, className, children }: { type: BlockType; className?: string; children: React.ReactNode }) {
  const cls = cn(STYLE[type], className)
  if (type === "h1") return <h1 className={cls}>{children}</h1>
  if (type === "h2") return <h2 className={cls}>{children}</h2>
  if (type === "h3") return <h3 className={cls}>{children}</h3>
  return <div className={cls}>{children}</div>
}

function ViewBlock({ block }: { block: Block }) {
  if (block.type === "links") return <div className={STYLE.links}><FlowLinks /></div>
  if (block.type === "ul")
    return (
      <ul className={cn(STYLE.ul, "ml-6 list-disc [&>li]:mt-2")}>
        {block.text.split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    )
  return <Tag type={block.type}>{block.text}</Tag>
}

function EditableBlock({ block }: { block: Block }) {
  const ref = useRef<HTMLDivElement>(null)
  // Uncontrolled while typing: write the text in only when it changed from outside (another tab, reset).
  useEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.innerText !== block.text) el.innerText = block.text
  }, [block.text])
  const commit = () => {
    const t = (ref.current?.innerText ?? "").replace(/\n+$/, "")
    if (t !== block.text) overviewStore.update(block.id, { text: t })
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && block.type !== "ul") {
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
  return (
    <div className="group relative">
      <BlockBar block={block} />
      {block.type === "links" ? (
        <div className={cn(STYLE.links, "rounded-md outline-offset-4 group-hover:outline group-hover:outline-1 group-hover:outline-zinc-200")}>
          <FlowLinks />
        </div>
      ) : (
        <Tag type={block.type} className={cn(block.type === "ul" && "border-l-2 border-zinc-200 pl-4", "rounded-sm outline-offset-4 focus-within:outline focus-within:outline-2 focus-within:outline-zinc-300")}>
          <div
            ref={ref}
            data-block={block.id}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            onBlur={commit}
            onKeyDown={onKey}
            data-placeholder={BLOCK_LABELS[block.type]}
            className="min-h-[1.5em] whitespace-pre-wrap outline-none empty:before:text-zinc-300 empty:before:content-[attr(data-placeholder)]"
          />
        </Tag>
      )}
      {block.type === "ul" && <p className="mt-1 hidden pl-6 text-xs text-zinc-400 group-focus-within:block">List: one item per line.</p>}
    </div>
  )
}

function BlockBar({ block }: { block: Block }) {
  const icon = "grid size-6 place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
  return (
    <div className="absolute top-0 -left-[150px] flex h-8 w-[140px] items-center justify-end gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
