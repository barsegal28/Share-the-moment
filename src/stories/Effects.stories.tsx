import type { Meta, StoryObj } from "@storybook/react-vite"
import { FigmaEffect } from "@/components/sticker/FigmaEffect"
import { FIGMA_EFFECTS, type FigmaEffectName, type FigmaEffectStyle } from "@/lib/effects"

const meta: Meta<typeof FigmaEffect> = {
  title: "Foundations/Effects",
  component: FigmaEffect,
  args: { effect: "snipLiftedGrain" },
  argTypes: { effect: { control: "select", options: Object.keys(FIGMA_EFFECTS) } },
}
export default meta

/** Swatch colours from each language's palette (Figma primitives) to show the effect on. */
const SWATCH: Record<FigmaEffectStyle["language"], string> = {
  Shared: "var(--sticker-ink)",
  Sticker: "var(--sticker-ink)",
  Snip: "#FF9600",
  Overprint: "#FF48D8",
  Scrapbook: "#0A4938",
}

export const Playground: StoryObj<typeof FigmaEffect> = {
  render: (a) => (
    <FigmaEffect {...a} className="grid h-64 w-96 place-items-center rounded-3xl" style={{ background: SWATCH[(FIGMA_EFFECTS[a.effect] as FigmaEffectStyle).language] }}>
      <span className="font-display text-2xl text-cream">{(FIGMA_EFFECTS[a.effect] as FigmaEffectStyle).figmaName}</span>
    </FigmaEffect>
  ),
}

export const AllEffects: StoryObj = {
  name: "All effect styles",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(FIGMA_EFFECTS) as FigmaEffectName[]).map((k) => {
        const fx = FIGMA_EFFECTS[k] as FigmaEffectStyle
        return (
          <div key={k} className="flex flex-col gap-3">
            <FigmaEffect effect={k} className="h-44 rounded-3xl" style={{ background: SWATCH[fx.language] }} />
            <p className="text-pc-label text-teal">{fx.language}</p>
            <p className="-mt-2 font-bold">{fx.figmaName}</p>
            <p className="text-pc-body -mt-2 opacity-75">{fx.description}</p>
            <ul className="font-mono text-[11px] leading-relaxed opacity-60">
              {fx.shadow && <li>drop shadow · y {fx.shadow.y} · blur {fx.shadow.blur} · {Math.round(fx.shadow.opacity * 100)}% black</li>}
              {fx.noise.map((n, i) => (
                <li key={i}>noise · {n.color} {Math.round(n.opacity * 100)}% · density {Math.round(n.density * 100)}% · size {n.size}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  ),
}
