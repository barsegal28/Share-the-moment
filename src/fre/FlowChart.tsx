/** The flow chart from the plan doc, as navigation: kid lane on top, parent lane below. */
import { Fragment } from "react"
import { Check, CornerLeftDown, CornerRightUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { NODES, STEP_IDS, type NodeId, type Script, type StepId } from "./script"

const COLS: Record<NodeId, number> = { "kid-success": 1, "kid-confirm": 2, "parent-message": 3, "parent-listen": 4, "parent-reply": 5, "parent-confirm": 6, "kid-reply": 7 }

export const firstStepOf = (script: Script, node: NodeId) => STEP_IDS.find((s) => script[s].node === node)!

export function FlowChart({ script, step, onPick, className }: { script: Script; step: StepId; onPick: (s: StepId) => void; className?: string }) {
  const current = script[step].node
  const idx = NODES.findIndex((n) => n.id === current)
  return (
    <div className={cn("grid grid-cols-[repeat(7,minmax(0,1fr))] grid-rows-[auto_16px_auto] gap-x-1.5", className)}>
      {NODES.map((n, i) => {
        const row = n.lane === "kid" ? 1 : 3
        const active = n.id === current
        const done = i < idx
        return (
          <Fragment key={n.id}>
            <button
              type="button"
              onClick={() => onPick(firstStepOf(script, n.id))}
              style={{ gridColumn: COLS[n.id], gridRow: row }}
              className={cn(
                "flex h-11 min-w-0 items-center gap-2 rounded-md border px-2.5 text-left transition-colors",
                active ? "border-zinc-900 bg-zinc-900 text-white shadow-sm" : done ? "border-zinc-200 bg-white text-zinc-900" : "border-dashed border-zinc-300 bg-transparent text-zinc-500 hover:border-zinc-400 hover:text-zinc-800",
              )}
            >
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold", active ? "bg-white text-zinc-900" : done ? "bg-zinc-900 text-white" : "border border-zinc-300")}>
                {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">{n.lane}</span>
                <span className="block truncate text-xs font-medium">{n.title}</span>
              </span>
            </button>
            {i < NODES.length - 1 && NODES[i + 1].lane !== n.lane && (
              <span style={{ gridColumn: `${COLS[n.id]} / span 2`, gridRow: 2 }} className="flex items-center justify-center gap-1 text-[10px] text-zinc-400">
                {n.lane === "kid" ? <CornerLeftDown className="size-3" /> : <CornerRightUp className="size-3" />}
                {n.lane === "kid" ? "link sent" : "reply arrives"}
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
