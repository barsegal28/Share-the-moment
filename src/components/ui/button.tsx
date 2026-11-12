import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * shadcn/ui Button, extended for a 6–9 year old on an iPad:
 * - `sticker` variant: a die-cut sticker (cream border, kiss-cut edge, lift) that presses flat on tap
 * - `kid` / `kid-lg` / `kid-icon` sizes: touch targets of 80px+ (the rule is at least 64pt)
 * The default shadcn variants and sizes are unchanged, for parent-facing UI.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-[3px] focus-visible:ring-ring/60 aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-ink shadow-xs hover:bg-destructive/90",
        outline: "border-2 bg-transparent shadow-xs hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/90",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
        sticker:
          "sticker font-display tracking-wide active:sticker-pressed active:translate-y-[3px] active:scale-[0.98] hover:brightness-105 [--kiss:var(--sticker-teal)]",
      },
      tone: {
        orange: "",
        teal: "",
        periwinkle: "",
        pink: "",
        cream: "",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 text-base has-[>svg]:px-4",
        icon: "size-10",
        kid: "h-20 rounded-[28px] px-9 text-[28px] gap-3 [&_svg:not([class*='size-'])]:size-8",
        "kid-lg": "h-24 rounded-[34px] px-10 text-[34px] gap-3.5 [&_svg:not([class*='size-'])]:size-10",
        "kid-icon": "size-20 rounded-full [&_svg:not([class*='size-'])]:size-9",
      },
    },
    compoundVariants: [
      { variant: "sticker", tone: "orange", class: "bg-orange text-ink [--kiss:var(--sticker-teal)]" },
      { variant: "sticker", tone: "teal", class: "bg-teal text-cream [--kiss:var(--sticker-orange)]" },
      { variant: "sticker", tone: "periwinkle", class: "bg-periwinkle text-ink [--kiss:var(--sticker-pink)]" },
      { variant: "sticker", tone: "pink", class: "bg-pink text-ink [--kiss:var(--sticker-periwinkle)]" },
      { variant: "sticker", tone: "cream", class: "bg-cream text-ink [--kiss:var(--sticker-orange)]" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, tone: variant === "sticker" ? (tone ?? "orange") : tone, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
