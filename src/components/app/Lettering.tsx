/**
 * Die-cut lettering: Bagel Fat One text with a cream outside stroke and round joins, as in Figma
 * ("You are a star!" — Sticker/Display/Large, stroke 17.66 cream, outside, round). The stroke is drawn by a
 * copy of the text behind it at twice the width, so it reads as a cut-out around the letters.
 */
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Lettering({
  children,
  stroke = 17.66,
  color = "var(--sticker-cream)",
  className,
}: {
  children: ReactNode
  /** Outside stroke in px (Figma value). */
  stroke?: number
  color?: string
  className?: string
}) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span aria-hidden className="absolute inset-0 select-none" style={{ WebkitTextStroke: `${stroke * 2}px ${color}`, color, strokeLinejoin: "round", paintOrder: "stroke" }}>
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}
