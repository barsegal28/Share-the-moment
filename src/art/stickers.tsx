import type { ReactNode } from "react"
import { StickerArt, type StickerArtProps, type StickerColor } from "@/components/sticker/StickerArt"

/*
 * Sticker art library — flat palette shapes; <StickerArt> adds the die-cut.
 * Faces follow the Sticker rules: dot eyes with a small cream highlight, pink blush ovals, a line smile.
 * All art is original (no characters, logos or brands).
 */

const C = {
  cream: "var(--sticker-cream)",
  orange: "var(--sticker-orange)",
  teal: "var(--sticker-teal)",
  peri: "var(--sticker-periwinkle)",
  pink: "var(--sticker-pink)",
  ink: "var(--sticker-ink)",
  gold: "var(--sticker-gold)",
}

export function Face({ cx, cy, s = 1, blush = C.pink, open = false }: { cx: number; cy: number; s?: number; blush?: string; open?: boolean }) {
  return (
    <g>
      <ellipse cx={cx - 15 * s} cy={cy + 6 * s} rx={5 * s} ry={3 * s} fill={blush} />
      <ellipse cx={cx + 15 * s} cy={cy + 6 * s} rx={5 * s} ry={3 * s} fill={blush} />
      <circle cx={cx - 8 * s} cy={cy} r={3.8 * s} fill={C.ink} />
      <circle cx={cx + 8 * s} cy={cy} r={3.8 * s} fill={C.ink} />
      <circle cx={cx - 9.2 * s} cy={cy - 1.3 * s} r={1.3 * s} fill={C.cream} />
      <circle cx={cx + 6.8 * s} cy={cy - 1.3 * s} r={1.3 * s} fill={C.cream} />
      {open ? (
        <path d={`M${cx - 6 * s} ${cy + 6 * s} Q${cx} ${cy + 15 * s} ${cx + 6 * s} ${cy + 6 * s} Z`} fill={C.ink} />
      ) : (
        <path d={`M${cx - 6 * s} ${cy + 6 * s} Q${cx} ${cy + 12 * s} ${cx + 6 * s} ${cy + 6 * s}`} fill="none" stroke={C.ink} strokeWidth={2.6 * s} strokeLinecap="round" />
      )}
    </g>
  )
}

function starPoints(cx: number, cy: number, R: number, r: number, n = 5, rot = -90) {
  const pts: string[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180
    const rad = i % 2 ? r : R
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(" ")
}

type Def = { art: ReactNode; kiss: StickerColor; viewBox?: [number, number]; label: string }

export const STICKERS = {
  star: {
    label: "Star",
    kiss: "teal",
    art: (
      <g>
        <polygon points={starPoints(50, 54, 46, 22)} fill={C.orange} stroke={C.orange} strokeWidth={8} strokeLinejoin="round" />
        <Face cx={50} cy={56} s={0.85} />
      </g>
    ),
  },
  starEmpty: {
    label: "Star to earn",
    kiss: "periwinkle",
    art: <polygon points={starPoints(50, 54, 46, 22)} fill={C.ink} stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />,
  },
  heart: {
    label: "Heart",
    kiss: "orange",
    art: (
      <g>
        <path d="M50 88 C20 68 6 50 12 32 C18 14 40 12 50 30 C60 12 82 14 88 32 C94 50 80 68 50 88 Z" fill={C.pink} />
        <Face cx={50} cy={48} s={0.9} blush={C.orange} />
      </g>
    ),
  },
  note: {
    label: "Music note",
    kiss: "orange",
    art: (
      <g>
        <rect x={52} y={12} width={11} height={62} rx={5.5} fill={C.peri} />
        <path d="M58 12 C74 14 84 24 86 40 C78 32 70 30 60 30 Z" fill={C.peri} />
        <ellipse cx={42} cy={74} rx={22} ry={18} fill={C.peri} />
        <Face cx={42} cy={72} s={0.62} />
      </g>
    ),
  },
  drum: {
    label: "Drum",
    kiss: "orange",
    art: (
      <g>
        <line x1={26} y1={8} x2={44} y2={34} stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
        <line x1={76} y1={8} x2={58} y2={34} stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
        <circle cx={26} cy={8} r={6} fill={C.gold} />
        <circle cx={76} cy={8} r={6} fill={C.gold} />
        <rect x={14} y={40} width={72} height={46} rx={12} fill={C.teal} />
        <ellipse cx={50} cy={42} rx={36} ry={11} fill={C.peri} />
        <Face cx={50} cy={64} s={0.75} />
      </g>
    ),
  },
  hands: {
    label: "Two hands",
    kiss: "periwinkle",
    art: (
      <g>
        <g transform="rotate(-14 32 56)">
          <rect x={16} y={28} width={32} height={50} rx={16} fill={C.orange} />
          <ellipse cx={14} cy={58} rx={8} ry={13} fill={C.orange} />
        </g>
        <g transform="rotate(14 68 56)">
          <rect x={52} y={28} width={32} height={50} rx={16} fill={C.pink} />
          <ellipse cx={86} cy={58} rx={8} ry={13} fill={C.pink} />
        </g>
        <path d="M50 10 L53 19 L62 20 L55 26 L57 35 L50 30 L43 35 L45 26 L38 20 L47 19 Z" fill={C.gold} />
      </g>
    ),
  },
  plane: {
    label: "Paper plane",
    kiss: "orange",
    art: (
      <g>
        <polygon points="6,52 94,12 66,90" fill={C.peri} />
        <polygon points="44,62 94,12 52,86" fill={C.teal} />
        <polygon points="44,62 52,86 40,80" fill={C.teal} />
      </g>
    ),
  },
  piano: {
    label: "Piano",
    kiss: "pink",
    viewBox: [120, 90],
    art: (
      <g>
        <rect x={6} y={12} width={108} height={70} rx={14} fill={C.teal} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={16 + i * 15.5} y={34} width={12} height={40} rx={3} fill={C.cream} />
        ))}
        {[0, 1, 3, 4].map((i) => (
          <rect key={i} x={25 + i * 15.5} y={34} width={9} height={24} rx={2} fill={C.ink} />
        ))}
        <circle cx={22} cy={23} r={3.2} fill={C.orange} />
        <circle cx={32} cy={23} r={3.2} fill={C.pink} />
      </g>
    ),
  },
  trophy: {
    label: "Trophy",
    kiss: "periwinkle",
    art: (
      <g>
        <circle cx={22} cy={34} r={12} fill="none" stroke={C.gold} strokeWidth={6} />
        <circle cx={78} cy={34} r={12} fill="none" stroke={C.gold} strokeWidth={6} />
        <path d="M24 14 H76 V40 C76 58 64 66 50 66 C36 66 24 58 24 40 Z" fill={C.gold} />
        <rect x={44} y={64} width={12} height={14} fill={C.gold} />
        <rect x={28} y={78} width={44} height={12} rx={5} fill={C.orange} />
        <Face cx={50} cy={38} s={0.7} blush={C.orange} />
      </g>
    ),
  },
  rocket: {
    label: "Rocket",
    kiss: "orange",
    art: (
      <g transform="rotate(35 50 50)">
        <path d="M42 70 L50 96 L58 70 Z" fill={C.orange} />
        <path d="M34 58 L22 76 L36 72 Z" fill={C.pink} />
        <path d="M66 58 L78 76 L64 72 Z" fill={C.pink} />
        <path d="M50 4 C66 18 70 40 66 70 H34 C30 40 34 18 50 4 Z" fill={C.peri} />
        <circle cx={50} cy={36} r={10} fill={C.cream} />
        <circle cx={50} cy={36} r={6} fill={C.teal} />
      </g>
    ),
  },
  sun: {
    label: "Sunshine",
    kiss: "teal",
    art: (
      <g>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 * Math.PI) / 180
          return <circle key={i} cx={50 + 40 * Math.cos(a)} cy={50 + 40 * Math.sin(a)} r={7} fill={C.orange} />
        })}
        <circle cx={50} cy={50} r={32} fill={C.orange} />
        <Face cx={50} cy={48} s={1} open />
      </g>
    ),
  },
  rainbow: {
    label: "Rainbow",
    kiss: "teal",
    viewBox: [120, 80],
    art: (
      <g fill="none" strokeLinecap="round">
        <path d="M14 70 A46 46 0 0 1 106 70" stroke={C.pink} strokeWidth={11} />
        <path d="M27 70 A33 33 0 0 1 93 70" stroke={C.orange} strokeWidth={11} />
        <path d="M40 70 A20 20 0 0 1 80 70" stroke={C.peri} strokeWidth={11} />
      </g>
    ),
  },
  crown: {
    label: "Crown",
    kiss: "pink",
    art: (
      <g>
        <polygon points="10,30 30,52 50,18 70,52 90,30 82,80 18,80" fill={C.gold} stroke={C.gold} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={50} cy={64} r={7} fill={C.pink} />
        <circle cx={30} cy={66} r={5} fill={C.peri} />
        <circle cx={70} cy={66} r={5} fill={C.orange} />
      </g>
    ),
  },
  sparkle: {
    label: "Sparkle",
    kiss: "pink",
    art: <path d="M50 4 C54 38 62 46 96 50 C62 54 54 62 50 96 C46 62 38 54 4 50 C38 46 46 38 50 4 Z" fill={C.gold} />,
  },
  // ── People: avatars, never names alone ("Mom" is her face) ─────────────────
  mom: {
    label: "Mom",
    kiss: "orange",
    art: (
      <g>
        <circle cx={50} cy={50} r={46} fill={C.pink} />
        <path d="M18 70 C14 34 30 18 50 18 C70 18 86 34 82 70 Z" fill={C.ink} />
        <circle cx={50} cy={54} r={24} fill={C.cream} />
        <path d="M26 46 C30 30 44 26 56 28 C48 36 38 42 26 46 Z" fill={C.ink} />
        <Face cx={50} cy={56} s={0.8} />
      </g>
    ),
  },
  dad: {
    label: "Dad",
    kiss: "pink",
    art: (
      <g>
        <circle cx={50} cy={50} r={46} fill={C.teal} />
        <circle cx={50} cy={54} r={25} fill={C.cream} />
        <path d="M24 48 C24 28 36 22 50 22 C66 22 78 30 76 48 C70 38 58 34 46 36 C38 37 30 42 24 48 Z" fill={C.gold} />
        <path d="M38 72 Q50 82 62 72 Q58 80 50 80 Q42 80 38 72 Z" fill={C.gold} />
        <Face cx={50} cy={56} s={0.8} />
      </g>
    ),
  },
  kid: {
    label: "Noa",
    kiss: "orange",
    art: (
      <g>
        <circle cx={50} cy={50} r={46} fill={C.peri} />
        <circle cx={20} cy={40} r={11} fill={C.orange} />
        <circle cx={80} cy={40} r={11} fill={C.orange} />
        <circle cx={50} cy={56} r={24} fill={C.cream} />
        <path d="M26 50 C26 32 38 26 50 26 C62 26 74 32 74 50 C66 40 58 38 50 40 C42 38 34 40 26 50 Z" fill={C.orange} />
        <Face cx={50} cy={58} s={0.8} open />
      </g>
    ),
  },
  grandma: {
    label: "Grandma",
    kiss: "teal",
    art: (
      <g>
        <circle cx={50} cy={50} r={46} fill={C.gold} />
        <circle cx={50} cy={22} r={12} fill={C.cream} />
        <circle cx={50} cy={56} r={24} fill={C.cream} />
        <path d="M26 52 C24 34 36 28 50 28 C64 28 76 34 74 52 C68 42 60 40 50 40 C40 40 32 42 26 52 Z" fill={C.peri} />
        <Face cx={50} cy={58} s={0.8} />
      </g>
    ),
  },
} satisfies Record<string, Def>

export type StickerName = keyof typeof STICKERS
/** Stickers a parent can send back. */
export const REPLY_STICKERS: StickerName[] = ["heart", "star", "trophy", "rocket", "sun", "rainbow", "crown", "note"]

export function Sticker({ name, ...props }: { name: StickerName } & Omit<StickerArtProps, "children">) {
  const d = STICKERS[name] as Def
  return (
    <StickerArt kiss={d.kiss} viewBox={d.viewBox} title={props.title ?? d.label} {...props}>
      {d.art}
    </StickerArt>
  )
}
