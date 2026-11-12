import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Renders a fixed-size design (e.g. iPad 1180 × 820) scaled to fit its container, centred. */
export function FitStage({ width, height, children, className, background }: { width: number; height: number; children: ReactNode; className?: string; background?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(el.clientWidth / width, el.clientHeight / height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width, height])
  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)} style={{ background }}>
      <div
        className="absolute top-1/2 left-1/2"
        style={{ width, height, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
      >
        {children}
      </div>
    </div>
  )
}
