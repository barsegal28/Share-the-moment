/** The flow chart from the plan doc, as navigation: kid lane on top, parent lane below. */
import { Fragment } from "react"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { NODES, STEP_IDS, type NodeId, type Script, type StepId } from "./script"

const COLS: Record<NodeId, number> = { "kid-success": 1, "kid-confirm": 2, "parent-message": 3, "parent-listen": 4, "parent-reply": 5, "parent-confirm": 6, "kid-reveal": 7 }

export const firstStepOf = (script: Script, node: NodeId) => STEP_IDS.find((s) => script[s].node === node)!

export function FlowChart({ script, step, onPick, className }: { script: Script; step: StepId; onPick: (s: StepId) => void; className?: string }) {
  const current = script[step].node
  const idx = NODES.findIndex((n) => n.id === current)
  return (
    <div className={cn("grid grid-cols-[repeat(7,minmax(0,1fr))] grid-rows-[auto_18px_auto] gap-x-2 text-cream", className)}>
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
                "relative flex flex-col items-start rounded-xl border px-3 py-1.5 text-left transition-colors",
                active ? "border-orange bg-orange text-ink" : done ? "border-cream/25 bg-cream/12 text-cream" : "border-cream/15 bg-transparent text-cream/60 hover:bg-cream/8",
              )}
            >
              <span className={cn("text-[10px] font-bold tracking-wider uppercase", active ? "text-ink/70" : "text-cream/50")}>{n.lane}</span>
              <span className="text-[13px] leading-tight font-semibold">{n.title}</span>
              <span className={cn("hidden text-[11px] leading-tight xl:block", active ? "text-ink/70" : "text-cream/45")}>{n.sub}</span>
              {i < NODES.length - 1 && NODES[i + 1].lane === n.lane && <ArrowRight className="absolute top-1/2 -right-[13px] z-10 size-3.5 -translate-y-1/2 text-cream/40" />}
            </button>
            {i < NODES.length - 1 && NODES[i + 1].lane !== n.lane && (
              <span style={{ gridColumn: `${COLS[n.id]} / span 2`, gridRow: 2 }} className="flex items-center justify-center text-cream/40">
                {n.lane === "kid" ? (
                  <span className="flex items-center gap-1 text-[10px]">
                    <ArrowDown className="size-3.5" /> link sent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px]">
                    <ArrowUp className="size-3.5" /> reply arrives
                  </span>
                )}
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
