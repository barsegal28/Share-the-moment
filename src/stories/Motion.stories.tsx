import type { Meta, StoryObj } from "@storybook/react-vite"
import { GlowUp } from "@/components/motion/GlowUp"
import { GLOW_UP, GLOW_UP_CHARACTERS } from "@/motion/glowUp"

const meta: Meta<typeof GlowUp> = {
  title: "Motion/Glow-up",
  component: GlowUp,
  parameters: {
    docs: {
      description: {
        component:
          "A celebration loop for a sticker character: it idles, glows, shrinks into a star, bursts into light and comes back. " +
          "The character stays a **sticker** (clean, die-cut, no grain); the light effects are **torn paper** (grain, lift). " +
          "It moves like **stop-motion**: stepped frames, edges re-cut every 2 frames, never tweened. " +
          "With reduced motion it holds frame 0. Definition: `src/motion/glowUp.ts` · spec: `docs/MOTION-GLOW-UP.md`.",
      },
    },
  },
  args: { character: "stripedPlanet", size: 300, fps: GLOW_UP.fps, playing: true, loop: true },
  argTypes: {
    character: { control: "inline-radio", options: Object.keys(GLOW_UP_CHARACTERS) },
    size: { control: { type: "range", min: 120, max: 480, step: 20 } },
    fps: { control: { type: "range", min: 6, max: 24, step: 1 } },
    frame: { control: { type: "range", min: 0, max: GLOW_UP.frames - 1, step: 1 } },
  },
}
export default meta
type S = StoryObj<typeof GlowUp>

export const Playground: S = {}

export const StripedPlanet: S = { args: { character: "stripedPlanet" } }
export const RingedPlanet: S = { name: "Ringed planet (ring and star peel off)", args: { character: "ringedPlanet" } }

export const BothCharacters: S = {
  name: "Both characters",
  render: (a) => (
    <div className="flex flex-wrap items-center gap-16">
      <GlowUp {...a} character="stripedPlanet" />
      <GlowUp {...a} character="ringedPlanet" />
    </div>
  ),
}

/** One still per phase, for review. The frame shown is the middle of each phase. */
export const Phases: S = {
  render: (a) => (
    <div className="flex flex-col gap-10">
      {(["stripedPlanet", "ringedPlanet"] as const).map((c) => (
        <div key={c} className="flex flex-wrap gap-6">
          {GLOW_UP.phases.map((p) => (
            <figure key={p.id} className="flex w-[200px] flex-col items-center gap-2">
              <GlowUp {...a} character={c} size={200} frame={Math.round((p.from + p.to) / 2)} />
              <figcaption className="text-center text-sm">
                <span className="block font-semibold">{p.label}</span>
                <span className="block opacity-70">frames {p.from}–{p.to}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Scrub through the loop frame by frame with the `frame` control. */
export const FrameByFrame: S = { name: "Frame by frame", args: { frame: 70 } }

export const OnPaper: S = { name: "On the paper sheet", parameters: { sheet: "paper" } }
export const OnNotebook: S = { name: "On the notebook sheet", parameters: { sheet: "notebook" } }
