import type { Meta, StoryObj } from "@storybook/react-vite"
import { FigmaEffect } from "@/components/sticker/FigmaEffect"
import { FIGMA_EFFECTS, type FigmaEffectName, type FigmaEffectStyle } from "@/lib/effects"

const meta: Meta<typeof FigmaEffect> = {
  title: "Foundations/Effects",
  component: FigmaEffect,
  args: { effect: "risoGrain" },
  argTypes: { effect: { control: "select", options: Object.keys(FIGMA_EFFECTS) } },
}
export default meta

export const Playground: StoryObj<typeof FigmaEffect> = {
  render: (a) => (
    <FigmaEffect {...a} className="grid h-64 w-96 place-items-center rounded-40 bg-pc-piece-secondary">
      <span className="text-title-sm text-cream">{(FIGMA_EFFECTS[a.effect] as FigmaEffectStyle).figmaName}</span>
    </FigmaEffect>
  ),
}

export const AllEffects: StoryObj = {
  name: "Effects used by the components",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-3">
        <div className="h-44 rounded-40 bg-pc-piece-primary shadow-sticker" />
        <p className="text-mono-sm text-teal uppercase">system · token</p>
        <p className="text-mono-lg">Sticker lift</p>
        <p className="text-mono-sm opacity-60">drop shadow · y 7 · blur 10 · 30% black · shadow-sticker</p>
      </div>
      {(Object.keys(FIGMA_EFFECTS) as FigmaEffectName[]).map((k) => {
        const fx = FIGMA_EFFECTS[k] as FigmaEffectStyle
        return (
          <div key={k} className="flex flex-col gap-3">
            <FigmaEffect effect={k} className="h-44 rounded-40 bg-pc-piece-secondary" />
            <p className={fx.status === "outlier" ? "text-mono-sm text-orange uppercase" : "text-mono-sm text-teal uppercase"}>{fx.status}</p>
            <p className="text-mono-lg">{fx.figmaName}</p>
            <p className="text-mono-sm opacity-75">{fx.description}</p>
            <ul className="text-mono-sm opacity-60">
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
