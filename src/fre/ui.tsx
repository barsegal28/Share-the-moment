/**
 * Tool chrome for the flow page and the editor: neutral black and white, shadcn/ui-like,
 * with Figma-style property controls (scrub a label to change a number). Not the app's Sticker language.
 */
import { useRef, type ButtonHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, type InputHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Button ────────────────────────────────────────────────────────────────
type BtnVariant = "default" | "outline" | "ghost" | "secondary"
type BtnSize = "default" | "sm" | "xs" | "icon" | "icon-sm"
export function Btn({ variant = "outline", size = "sm", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  return <button type="button" {...p} className={btnClass(variant, size, className)} />
}
export function btnClass(variant: BtnVariant = "outline", size: BtnSize = "sm", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
    variant === "default" && "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800",
    variant === "outline" && "border border-zinc-200 bg-white text-zinc-900 shadow-xs hover:bg-zinc-50",
    variant === "secondary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/70",
    variant === "ghost" && "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
    size === "default" && "h-9 px-4 text-sm",
    size === "sm" && "h-8 px-3 text-[13px]",
    size === "xs" && "h-7 px-2 text-xs [&_svg]:size-3.5",
    size === "icon" && "size-8",
    size === "icon-sm" && "size-7 [&_svg]:size-3.5",
    className,
  )
}

// ─── Figma-like scrub number input ────────────────────────────────────────
/** Drag the label left/right to change the value (Shift = ×10), or type in the field. */
export function ScrubInput({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  title,
  className,
}: {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  title?: string
  className?: string
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const round = (v: number) => {
    const d = (String(step).split(".")[1] ?? "").length
    return Number(v.toFixed(d))
  }
  const start = useRef<{ x: number; v: number } | null>(null)
  const down = (e: React.PointerEvent) => {
    e.preventDefault()
    start.current = { x: e.clientX, v: value }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const k = e.shiftKey ? 10 : 1
    onChange(round(clamp(start.current.v + Math.round(dx / 2) * step * k)))
  }
  const up = () => (start.current = null)
  return (
    <label title={title} className={cn("group flex h-7 min-w-0 items-center rounded-md border border-transparent bg-zinc-100 pr-1.5 text-xs transition-colors hover:border-zinc-200 focus-within:border-zinc-900 focus-within:bg-white", className)}>
      <span onPointerDown={down} onPointerMove={move} onPointerUp={up} className="flex h-full min-w-7 cursor-ew-resize items-center justify-center px-1.5 text-[11px] text-zinc-500 select-none group-hover:text-zinc-700">
        {label}
      </span>
      <input
        type="number"
        value={value}
        step={step}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        onChange={(e) => e.target.value !== "" && onChange(clamp(Number(e.target.value)))}
        className="h-full w-full min-w-0 bg-transparent font-[family-name:var(--font-ui-mono)] text-xs tabular-nums outline-none"
      />
      {suffix && <span className="pl-1 text-[11px] text-zinc-400">{suffix}</span>}
    </label>
  )
}

// ─── Select / text ─────────────────────────────────────────────────────────
export function Select({ className, children, label, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode }) {
  return (
    <label className={cn("relative flex h-7 min-w-0 items-center rounded-md border border-transparent bg-zinc-100 text-xs transition-colors hover:border-zinc-200 focus-within:border-zinc-900 focus-within:bg-white", className)}>
      {label && <span className="pl-2 text-[11px] text-zinc-500">{label}</span>}
      <select {...p} className="h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 pl-2 outline-none">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5 text-zinc-400" />
    </label>
  )
}
export function TextArea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={cn("w-full resize-y rounded-md border border-transparent bg-zinc-100 px-2 py-1.5 text-xs leading-relaxed outline-none hover:border-zinc-200 focus:border-zinc-900 focus:bg-white", className)} />
}
export function TextInput({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={cn("h-7 w-full rounded-md border border-transparent bg-zinc-100 px-2 text-xs outline-none hover:border-zinc-200 focus:border-zinc-900 focus:bg-white", className)} />
}

// ─── Panel structure ──────────────────────────────────────────────────────
export function PanelSection({ title, action, children, className }: { title: ReactNode; action?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("border-b border-zinc-200 px-3 py-3", className)}>
      <div className="mb-2 flex h-6 items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold text-zinc-900">{title}</h3>
        <div className="flex items-center gap-0.5">{action}</div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}
export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-[11px] leading-snug text-zinc-500">{children}</p>
}

/** Segmented control (shadcn Tabs look). */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; title?: string }[]; className?: string }) {
  return (
    <div className={cn("inline-flex h-8 items-center rounded-lg bg-zinc-100 p-[3px]", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn("inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors [&_svg]:size-3.5", value === o.value ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-900")}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** shadcn Switch. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-700 select-none">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn("relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors", checked ? "bg-zinc-900" : "bg-zinc-200")}>
        <span className={cn("block size-3.5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-[16px]" : "translate-x-[2px]")} />
      </button>
      {label}
    </label>
  )
}

export function Badge({ children, variant = "secondary", className }: { children: ReactNode; variant?: "secondary" | "outline" | "default"; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium", variant === "secondary" && "bg-zinc-100 text-zinc-700", variant === "outline" && "border border-zinc-200 text-zinc-600", variant === "default" && "bg-zinc-900 text-white", className)}>
      {children}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-200 bg-zinc-50 px-1 font-[family-name:var(--font-ui-mono)] text-[10px] text-zinc-500">{children}</kbd>
}
