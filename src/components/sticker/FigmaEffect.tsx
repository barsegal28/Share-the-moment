import { Fragment, useId, type ComponentProps } from "react"
import { FIGMA_EFFECTS, hexToRgb, speckleTable, type FigmaEffectName, type FigmaEffectStyle } from "@/lib/effects"
import { cn } from "@/lib/utils"
import { RisoGrain } from "./Sheet"

/** The noise layers of a Figma effect style as an SVG overlay (fills its positioned parent). */
export function NoiseOverlay({ effect, seed = 7, className }: { effect: FigmaEffectName; seed?: number; className?: string }) {
  const id = useId().replace(/:/g, "")
  const fx = FIGMA_EFFECTS[effect] as FigmaEffectStyle
  // Riso grain uses the tables measured from Figma's own render (more faithful than the generic speckle).
  if (effect === "risoGrain") return <RisoGrain className={className} />
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
      <filter id={`${id}-n`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {fx.noise.map((n, i) => {
          const [r, g, b] = hexToRgb(n.color)
          return (
            <Fragment key={i}>
              <feTurbulence type="fractalNoise" baseFrequency={+(0.9 / n.size).toFixed(3)} numOctaves={2} seed={seed + i * 7} result={`t${i}`} />
              <feColorMatrix in={`t${i}`} type="matrix" values={`0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0.33 0.33 0.33 0 0`} result={`c${i}`} />
              <feComponentTransfer in={`c${i}`} result={`n${i}`}>
                <feFuncA type="discrete" tableValues={speckleTable(n)} />
              </feComponentTransfer>
            </Fragment>
          )
        })}
        <feMerge>
          {fx.noise.map((_, i) => <feMergeNode key={i} in={`n${i}`} />)}
        </feMerge>
      </filter>
      <rect width="100%" height="100%" fill="#fff" filter={`url(#${id}-n)`} />
    </svg>
  )
}

/**
 * Applies one of the Figma effect styles to a box: its drop shadow (if any) and its noise,
 * clipped to the box's radius.
 */
export function FigmaEffect({ effect, className, children, style, ...props }: { effect: FigmaEffectName } & ComponentProps<"div">) {
  const fx = FIGMA_EFFECTS[effect] as FigmaEffectStyle
  return (
    <div
      data-figma-effect={fx.figmaName}
      className={cn("relative isolate overflow-hidden", className)}
      style={{ boxShadow: fx.shadow ? `0 ${fx.shadow.y}px ${fx.shadow.blur}px rgb(0 0 0 / ${fx.shadow.opacity})` : undefined, ...style }}
      {...props}
    >
      {children}
      <NoiseOverlay effect={effect} className="z-10 rounded-[inherit]" />
    </div>
  )
}
