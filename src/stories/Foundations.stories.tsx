import type { Meta, StoryObj } from "@storybook/react-vite"
import { ALL_STICKERS, Sticker } from "@/art/stickers"
import { FIGMA_STICKERS } from "@/art/figma-stickers"

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

const PC_VARS = [
  ["ground", "--pc-ground", "sticker/ink"], ["ground/light", "--pc-ground-light", "sticker/paper"], ["ground/notebook", "--pc-ground-notebook", "sticker/notebook"],
  ["piece/primary", "--pc-piece-primary", "sticker/orange"], ["piece/secondary", "--pc-piece-secondary", "sticker/teal"], ["piece/accent", "--pc-piece-accent", "sticker/periwinkle"],
  ["piece/accent-2", "--pc-piece-accent-2", "sticker/pink"], ["piece/dark", "--pc-piece-dark", "sticker/gold"], ["mark/ink", "--pc-mark-ink", "sticker/ink"],
  ["mark/knockout", "--pc-mark-knockout", "sticker/cream"], ["detail/rule", "--pc-detail-rule", "sticker/periwinkle"], ["detail/margin", "--pc-detail-margin", "sticker/pink"],
  ["text/primary", "--pc-text-primary", "sticker/ink"], ["sticker/border", "--pc-sticker-border", "sticker/cream"], ["system/surface", "--pc-system-surface", "sticker/system-white"],
  ["system/ink", "--pc-system-ink", "mark/ink"],
]

export const Variables: StoryObj = {
  name: "Figma variables (Sticker mode)",
  render: () => (
    <div className="max-w-3xl">
      <p className="mb-6 text-cream/75">The “Paper Cut” collection in its Sticker mode, as CSS variables with the same names as the Figma code syntax.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PC_VARS.map(([name, v, alias]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <span className="size-10 shrink-0 rounded-lg ring-2 ring-cream/20" style={{ background: `var(${v})` }} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-cream">{name}</p>
              <p className="truncate font-mono text-[11px] text-cream/60">{v} → {alias}</p>
            </div>
          </div>
        ))}
      </div>
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
      <p className="text-pc-label">Paper Cut/Label · DM Sans 700 · 11 / 130% · +12%</p>
      <p className="text-pc-body max-w-md">Paper Cut/Body · DM Sans 400 · 14 / 150%. The two text styles shared by every language in the Figma file.</p>
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
      {ALL_STICKERS.map((n, i) => (
        <div key={n} className="flex w-36 flex-col items-center gap-3">
          <Sticker name={n} size={110} tilt={i % 2 ? 9 : -9} />
          <span className="font-mono text-xs text-cream/70">{n}</span>
          <span className="-mt-2 text-[10px] font-semibold tracking-wider text-cream/45 uppercase">{n in FIGMA_STICKERS ? "Figma · app assets" : "local"}</span>
        </div>
      ))}
    </div>
  ),
}
