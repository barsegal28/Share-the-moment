import type { Meta, StoryObj } from "@storybook/react-vite"
import { StickerArt } from "@/components/sticker/StickerArt"
import { Sheet } from "@/components/sticker/Sheet"
import { Sticker, STICKERS, type StickerName } from "@/art/stickers"

const meta: Meta<typeof Sticker> = {
  title: "Sticker/Sticker",
  component: Sticker,
  args: { name: "star", size: 200, tilt: -8, motion: "none", lift: true },
  argTypes: {
    name: { control: "select", options: Object.keys(STICKERS) as StickerName[] },
    kiss: { control: "select", options: ["cream", "orange", "teal", "periwinkle", "pink", "ink", "gold"] },
    motion: { control: "inline-radio", options: ["none", "pop", "float", "wiggle"] },
    tilt: { control: { type: "range", min: -15, max: 15 } },
  },
}
export default meta
type S = StoryObj<typeof Sticker>

export const Playground: S = {}

export const CustomArt: StoryObj = {
  name: "StickerArt from any flat SVG",
  render: () => (
    <StickerArt size={180} tilt={10} kiss="pink" title="A custom sticker">
      <rect x={10} y={20} width={80} height={60} rx={14} fill="var(--sticker-orange)" />
      <circle cx={50} cy={50} r={16} fill="var(--sticker-ink)" />
      <circle cx={46} cy={46} r={4} fill="var(--sticker-cream)" />
    </StickerArt>
  ),
}

export const Sheets: StoryObj = {
  parameters: { sheet: "none" },
  render: () => (
    <div className="grid grid-cols-3">
      {(["ink", "paper", "notebook"] as const).map((g, i) => (
        <Sheet key={g} ground={g} className="flex h-[420px] flex-col items-center justify-center gap-6">
          <Sticker name={(["sun", "rocket", "rainbow"] as const)[i]} size={140} tilt={i * 7 - 7} />
          <span className="font-display text-xl">{g}</span>
        </Sheet>
      ))}
    </div>
  ),
}
