/**
 * Local button set, built to match the Flex Web Button instances on Figma "app asets" exactly
 * (sizes, radii, padding, gaps and type from the library; colours from the `Library overrides` tokens).
 *
 *   size xxl — 80 tall, radius 28, padding 32, gap 12, label Functional/Title Small (DM Mono 24/28), icon 32
 *   size xl  — 64 tall, radius 24, padding 24, gap 8,  label Functional/Subtitle (DM Mono 20/28),   icon 28
 *
 *   primary       — "Play next", "Share" (ink fill, #FAFAFA label)
 *   outline       — "Send Noa a surprise", "Send to Noa" (paper fill, orange 1px border and label)
 *   outline-light — "Share"/"Shared" on the result card, Close (white 80%, black 13% border, black 86% label)
 *   ghost         — "Play again" (no fill, black 86% label)
 */
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeftIcon } from "./icons"

export type ButtonVariant = "primary" | "outline" | "outline-light" | "ghost"
export type ButtonSize = "xxl" | "xl"

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-[var(--flex-web-button-primary-background)] text-[var(--flex-web-button-primary-label)]",
  outline: "border border-[var(--flex-web-button-outline-border)] bg-[var(--flex-web-button-outline-background)] text-[var(--flex-web-button-outline-label)]",
  "outline-light": "border border-black/13 bg-[var(--flex-web-button-outline-light-background)] text-black/86",
  ghost: "text-black/86",
}
/** Icons keep the library's own colours: white on primary, Grey 14 (#242424) on the light buttons. */
const ICON: Record<ButtonVariant, string> = {
  primary: "text-white",
  outline: "text-[var(--flex-web-button-outline-label)]",
  "outline-light": "text-[#242424]",
  ghost: "text-[#242424]",
}
const SIZE: Record<ButtonSize, string> = {
  xxl: "h-20 min-h-10 gap-3 rounded-[28px] px-8 py-2 text-functional-title-sm",
  xl: "h-16 min-h-10 gap-2 rounded-[24px] px-6 py-2 text-functional-subtitle",
}
export const BUTTON_ICON_SIZE: Record<ButtonSize, number> = { xxl: 32, xl: 28 }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon before the label (Arrow Right, Checkmark Circle, Arrow Clockwise). Render it at BUTTON_ICON_SIZE[size]. */
  iconStart?: ReactNode
  /** Icon after the label (Share). */
  iconEnd?: ReactNode
}

export function Button({ variant = "primary", size = "xxl", iconStart, iconEnd, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none transition-transform active:scale-[0.97] disabled:pointer-events-none",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {iconStart && <span className={cn("grid shrink-0 place-items-center", ICON[variant])}>{iconStart}</span>}
      <span>{children}</span>
      {iconEnd && <span className={cn("grid shrink-0 place-items-center", ICON[variant])}>{iconEnd}</span>}
    </button>
  )
}

/**
 * Circular icon button (library Button, Layout=Icon only, Radius=Circular).
 *   size 64 — outline-light, padding 10, icon 28 (Close on the share card)
 *   size 40 — ghost, padding 10, icon 20 (Close on the parent's bottom sheet)
 */
export function IconButton({
  size = 64,
  variant = size === 64 ? "outline-light" : "ghost",
  label,
  className,
  children,
  type = "button",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & { size?: 64 | 40; variant?: "outline-light" | "ghost"; label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full p-2.5 transition-transform active:scale-95",
        size === 64 ? "size-16" : "size-10",
        variant === "outline-light" ? "border border-black/13 bg-[var(--flex-web-button-outline-light-background)] text-[#242424]" : "text-[var(--fluent-icon-default)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Back (library Button, Layout=Icon only, Style=Outline, Radius=Rounded, Size=Medium): 32 × 32, padding 6,
 * radius 12, 1px gold border, Arrow Left 20 in black 86%. Parent.Mobile › send back.
 */
export function BackButton({ label = "Back", className, type = "button", ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & { label?: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn("inline-grid size-8 shrink-0 place-items-center rounded-[12px] border border-gold p-1.5 text-black/86 transition-transform active:scale-95", className)}
      {...props}
    >
      <ArrowLeftIcon size={20} />
    </button>
  )
}
