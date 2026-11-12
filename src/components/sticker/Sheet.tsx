import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/*
 * The sticker sheet: the ground everything is stuck onto.
 * Riso grain goes on the sheet only — stickers stay clean — so the grain layer sits
 * *under* the content. Tables match the Figma effect style "Paper Cut/Riso grain"
 * (white 75% · density 30% · size 1 and black 55% · density 22% · size 1.2), ported from papercut.js.
 */
const RISO_W = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .002 .002 .039 .046 .049 .094 .136 .143 .189 .235 .282 .328 .376 .42 .424 .424 .424 .424 .424"
const RISO_B = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .002 .007 .014 .021 .029 .038 .051 .068 .094 .119 .152 .176 .204 .242 .264 .297 .337 .356 .356 .356 .356"

export type SheetGround = "ink" | "paper" | "notebook"

export function RisoGrain({ amount = 1, className }: { amount?: number; className?: string }) {
  const id = useId().replace(/:/g, "")
  const k = (t: string) => t.split(" ").map((v) => +Math.min(1, +v * amount).toFixed(3)).join(" ")
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <filter id={`${id}-riso`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="tw" />
        <feColorMatrix in="tw" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0" result="w0" />
        <feComponentTransfer in="w0" result="w"><feFuncA type="table" tableValues={k(RISO_W)} /></feComponentTransfer>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={11} result="tb" />
        <feColorMatrix in="tb" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="b0" />
        <feComponentTransfer in="b0" result="b"><feFuncA type="table" tableValues={k(RISO_B)} /></feComponentTransfer>
        <feMerge><feMergeNode in="w" /><feMergeNode in="b" /></feMerge>
      </filter>
      <rect width="100%" height="100%" fill="#fff" filter={`url(#${id}-riso)`} />
    </svg>
  )
}

export function Sheet({
  ground = "ink",
  grain = 1,
  className,
  children,
}: {
  ground?: SheetGround
  /** Riso speckle strength; 0 turns it off. */
  grain?: number
  className?: string
  children?: ReactNode
}) {
  const light = ground !== "ink"
  return (
    <div
      data-sheet={light ? "paper" : undefined}
      className={cn("relative isolate overflow-hidden text-foreground", light ? "bg-paper" : "bg-ink", className)}
      style={ground === "notebook" ? { backgroundColor: "var(--sticker-notebook)" } : undefined}
    >
      {ground === "notebook" && <NotebookRules />}
      {grain > 0 && <RisoGrain amount={light ? grain * 0.6 : grain} className="-z-10" />}
      {children}
    </div>
  )
}

function NotebookRules() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 39px, color-mix(in srgb, var(--sticker-periwinkle) 55%, transparent) 39px 41px)" }}
      />
      <div className="absolute inset-y-0 left-24 w-0.5 bg-pink/70" />
      {["18%", "50%", "82%"].map((top) => (
        <div key={top} className="absolute left-8 size-7 -translate-y-1/2 rounded-full bg-ink/15" style={{ top }} />
      ))}
    </div>
  )
}
