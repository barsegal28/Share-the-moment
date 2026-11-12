import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sticker, STICKERS, type StickerName } from "@/art/stickers"

const meta: Meta = { title: "Foundations/Sticker language" }
export default meta

const PALETTE = [
  ["Cream", "--sticker-cream", "#EDE2C2", "Border, highlights"],
  ["Orange", "--sticker-orange", "#FD6117", "Primary"],
  ["Teal", "--sticker-teal", "#0B7563", "Secondary"],
  ["Periwinkle", "--sticker-periwinkle", "#8BA1EF", "Accent"],
  ["Pink", "--sticker-pink", "#EC70BB", "Accent 2, blush"],
  ["Ink", "--sticker-ink", "#112F29", "Ground, eyes, marks"],
  ["Gold", "--sticker-gold", "#91781E", "Detail"],
  ["Paper", "--sticker-paper", "#F7F2E6", "Light sheet"],
]

export const Palette: StoryObj = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-4">
      {PALETTE.map(([name, v, hex, role]) => (
        <div key={name} className="flex flex-col gap-2">
          <div className="aspect-[4/3] rounded-2xl ring-2 ring-cream/20" style={{ background: `var(${v})` }} />
          <p className="font-display text-lg text-cream">{name}</p>
          <p className="-mt-2 font-mono text-xs text-cream/60">{hex} · {v}</p>
          <p className="-mt-1 text-sm text-cream/75">{role}</p>
        </div>
      ))}
    </div>
  ),
}

export const Type: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 text-cream">
      <p className="font-display text-[120px] leading-none">You did it!</p>
      <p className="font-display text-5xl">Bagel Fat One · headlines</p>
      <p className="text-2xl font-semibold">DM Sans 600 · labels and buttons</p>
      <p className="max-w-xl text-lg">DM Sans 400 · text. For kids, text is always a backup to voice; for parents it carries the context.</p>
    </div>
  ),
}

export const DieCut: StoryObj = {
  name: "Die-cut anatomy",
  render: () => (
    <div className="flex flex-wrap items-center gap-16 text-cream">
      <Sticker name="heart" size={220} tilt={-8} />
      <ul className="max-w-sm space-y-3 text-lg">
        <li><b>9px cream border</b> follows the silhouette with rounded corners.</li>
        <li><b>3.5px kiss-cut edge</b> outside it, in a palette colour that contrasts with the art.</li>
        <li><b>Lift:</b> 7px down, 5px blur, 38% black (20% on light sheets).</li>
        <li><b>Tilt</b> about ±15°. Riso grain on the sheet only.</li>
      </ul>
    </div>
  ),
}

export const AllStickers: StoryObj = {
  name: "Art library",
  render: () => (
    <div className="flex flex-wrap gap-10">
      {(Object.keys(STICKERS) as StickerName[]).map((n, i) => (
        <div key={n} className="flex w-32 flex-col items-center gap-3">
          <Sticker name={n} size={96} tilt={i % 2 ? 9 : -9} />
          <span className="font-mono text-xs text-cream/70">{n}</span>
        </div>
      ))}
    </div>
  ),
}
