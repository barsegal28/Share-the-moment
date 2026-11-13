import type { Meta, StoryObj } from "@storybook/react-vite"
import { ALL_STICKERS, Sticker } from "@/art/stickers"
import { FIGMA_STICKERS } from "@/art/figma-stickers"

const meta: Meta = { title: "Foundations/Sticker language" }
export default meta

const PALETTE = [
  ["sticker/cream", "--sticker-cream", "#EDE2C2"],
  ["sticker/orange", "--sticker-orange", "#FD6117"],
  ["sticker/teal", "--sticker-teal", "#0B7563"],
  ["sticker/periwinkle", "--sticker-periwinkle", "#8BA1EF"],
  ["sticker/pink", "--sticker-pink", "#EC70BB"],
  ["sticker/ink", "--sticker-ink", "#112F29"],
  ["sticker/gold", "--sticker-gold", "#91781E"],
  ["sticker/paper", "--sticker-paper", "#F7F2E6"],
  ["sticker/notebook", "--sticker-notebook", "#FBF9F2"],
  ["sticker/system-white", "--sticker-system-white", "#FFFDF7"],
  ["sticker/periwinkle-light", "--sticker-periwinkle-light", "#C0CDFB"],
  ["sticker/blue", "--sticker-blue", "#006EE7"],
  ["sticker/grey", "--sticker-grey", "#818181"],
  ["sticker/gold-light", "--sticker-gold-light", "#C8B880"],
]

/** Figma collection "Paper Cut / Primitives", sticker/* group. */
export const Palette: StoryObj = {
  name: "Colour primitives",
  render: () => (
    <div className="grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-5">
      {PALETTE.map(([name, v, hex]) => (
        <div key={name} className="flex flex-col gap-2">
          <div className="aspect-[4/3] rounded-20 ring-2 ring-cream/20" style={{ background: `var(${v})` }} />
          <p className="text-mono-md text-cream">{name}</p>
          <p className="text-mono-sm text-cream/60">{hex} · {v}</p>
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
  name: "Colour semantics (Sticker mode)",
  render: () => (
    <div className="max-w-3xl">
      <p className="text-mono-md mb-6 text-cream/75">Figma collection “Paper Cut”, mode Sticker. CSS names follow the variables’ code syntax; Tailwind: bg-pc-*, text-pc-*.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PC_VARS.map(([name, v, alias]) => (
          <div key={name} className="flex items-center gap-3 rounded-12 bg-cream/10 p-2.5">
            <span className="size-10 shrink-0 rounded-12 ring-2 ring-cream/20" style={{ background: `var(${v})` }} />
            <div className="min-w-0">
              <p className="text-mono-md text-cream">{name}</p>
              <p className="text-mono-sm truncate text-cream/60">{v} → {alias}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

const OVERRIDES = [
  ["flex-web/button/primary/background", "--flex-web-button-primary-background", "sticker/ink"],
  ["flex-web/button/primary/label", "--flex-web-button-primary-label", "#FAFAFA"],
  ["flex-web/button/outline/background", "--flex-web-button-outline-background", "sticker/paper"],
  ["flex-web/button/outline/border", "--flex-web-button-outline-border", "sticker/orange"],
  ["flex-web/button/outline/label", "--flex-web-button-outline-label", "sticker/orange"],
  ["flex-web/button/outline-light/background", "--flex-web-button-outline-light-background", "#FFFFFF 80%"],
  ["fluent/icon/default", "--fluent-icon-default", "sticker/ink"],
  ["fluent/icon/rating", "--fluent-icon-rating", "sticker/orange"],
]

/** Figma collection "Library overrides": every colour the file overrides on Flex Web buttons and Fluent icons. */
export const LibraryOverrides: StoryObj = {
  name: "Library overrides",
  render: () => (
    <div className="grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
      {OVERRIDES.map(([name, v, alias]) => (
        <div key={name} className="flex items-center gap-3 rounded-12 bg-cream/10 p-2.5">
          <span className="size-10 shrink-0 rounded-12 ring-2 ring-cream/20" style={{ background: `var(${v})` }} />
          <div className="min-w-0">
            <p className="text-mono-sm text-cream">{name}</p>
            <p className="text-mono-sm truncate text-cream/60">→ {alias}</p>
          </div>
        </div>
      ))}
    </div>
  ),
}

const TYPE = [
  ["text-display-hero", "Sticker/Display/Hero", "Bagel Fat One · 102.74 / 98%", "YOU DID IT!"],
  ["text-display", "Sticker/Display/Large", "Bagel Fat One · 60 / 98%", "You are a star!"],
  ["text-title-lg", "Sticker/Title/Large", "Bagel Fat One · 36 / 98% · +4%", "Let it go"],
  ["text-title-md", "Sticker/Title/Medium", "Bagel Fat One · 32 / 98% · +4%", "Let it go"],
  ["text-title-md uppercase", "Sticker/Title/Medium Caps", "Bagel Fat One · 32 / 98% · +4% · caps", "Proud of you!"],
  ["text-title-sm", "Sticker/Title/Small", "Bagel Fat One · 24 / 98% · +4%", "Let it go"],
  ["text-mono-xl", "Sticker/Mono/XL", "DM Mono Medium · 24 / 98%", "Frozen · Played by Noa"],
  ["text-mono-lg", "Sticker/Mono/Large", "DM Mono Medium · 20 / 98%", "Today at 14:05"],
  ["text-mono-md", "Sticker/Mono/Medium", "DM Mono Medium · 16 / 98%", "Frozen · Played by Noa"],
  ["text-mono-sm", "Sticker/Mono/Small", "DM Mono Medium · 14 / 98%", "0:34  1:30"],
  ["text-paragraph-title", "Sticker/Paragraph/Title", "Bagel Fat One · 36 / 40px · caps", "I got 3 stars on this song, mom!"],
  ["text-paragraph-body", "Sticker/Paragraph/Body", "DM Mono Medium · 16 / 20px", "It took 6 tries but they kept going until both hands were together!"],
  ["text-functional-title-sm", "Flex Web · Functional/Title Small", "DM Mono Medium · 24 / 28px · −0.15px (button labels)", "Share"],
  ["text-functional-subtitle", "Flex Web · Functional/Subtitle", "DM Mono Medium · 20 / 28px · −0.15px (button labels)", "Send Noa a surprise"],
]

export const Type: StoryObj = {
  name: "Type scale",
  render: () => (
    <div className="flex flex-col gap-7 text-cream">
      {TYPE.map(([cls, figma, spec, sample]) => (
        <div key={figma} className="grid grid-cols-[300px_1fr] items-baseline gap-6">
          <div>
            <p className="text-mono-md">{figma}</p>
            <p className="text-mono-sm text-cream/60">{cls}</p>
            <p className="text-mono-sm text-cream/60">{spec}</p>
          </div>
          <p className={`${cls} max-w-md`}>{sample}</p>
        </div>
      ))}
    </div>
  ),
}

export const Radii: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8 text-cream">
      {["rounded-12", "rounded-20", "rounded-40", "rounded-60", "rounded-full"].map((r) => (
        <div key={r} className="flex flex-col items-center gap-2">
          <div className={`size-32 bg-pc-piece-secondary ${r}`} />
          <p className="text-mono-sm">{r}</p>
        </div>
      ))}
    </div>
  ),
}

export const DieCut: StoryObj = {
  name: "Die-cut anatomy",
  render: () => (
    <div className="flex flex-wrap items-center gap-16 text-cream">
      <Sticker name="heart" size={220} tilt={-8} />
      <ul className="text-mono-lg max-w-sm space-y-3">
        <li><b>9px cream border</b> follows the silhouette with rounded corners.</li>
        <li><b>3.5px kiss-cut edge</b> outside it, in a palette colour that contrasts with the art.</li>
        <li><b>Lift:</b> 7px down, 10px blur, 30% black.</li>
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
          <span className="text-mono-sm text-cream/70">{n}</span>
          <span className="text-mono-sm -mt-2 text-cream/45 uppercase">{n in FIGMA_STICKERS ? "Figma · app assets" : "local"}</span>
        </div>
      ))}
    </div>
  ),
}
