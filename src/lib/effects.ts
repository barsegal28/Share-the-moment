/*
 * The Figma effect styles that the Sticker components on "app asets" actually use. Values copied from Figma.
 * Noise is Figma's monotone NOISE effect: speckles of one colour at `opacity`, covering `density` of the
 * surface, `size` px each. Shadows are DROP_SHADOW (blur = Figma radius).
 *
 * `status: "outlier"` marks styles from other Paper Cut languages that Sticker components borrow
 * (see docs/FIGMA-AUDIT.md §3). The sticker lift itself is a token (`--sticker-lift-*`, `shadow-sticker`).
 *
 * In code: <FigmaEffect name="…"> applies one to a box.
 */
export type Noise = { color: string; opacity: number; density: number; size: number }
export type Shadow = { y: number; blur: number; opacity: number }
export type FigmaEffectStyle = { figmaName: string; status: "system" | "outlier"; description: string; shadow?: Shadow; noise: Noise[] }

export const FIGMA_EFFECTS = {
  risoGrain: {
    figmaName: "Paper Cut/Riso grain",
    status: "system",
    description: "On the sheet only (background, Parent.Mobile backgrounds, the main card). Stickers stay clean.",
    noise: [
      { color: "#ffffff", opacity: 0.75, density: 0.3, size: 1 },
      { color: "#000000", opacity: 0.55, density: 0.22, size: 1.2 },
    ],
  },
  scrapbookLiftedPaper: {
    figmaName: "Paper Cut/Scrapbook/Lifted paper",
    status: "outlier",
    description: "Scrapbook style used on the main card and Parent.Mobile › Paper.",
    shadow: { y: 5, blur: 10, opacity: 0.2 },
    noise: [{ color: "#000000", opacity: 0.08, density: 0.55, size: 1.1 }],
  },
  snipLiftedGrain: {
    figmaName: "Paper Cut/Snip/Lifted grain",
    status: "outlier",
    description: "Snip style used on the Player in main › FRE and the progress scrubber.",
    shadow: { y: 5, blur: 10, opacity: 0.22 },
    noise: [{ color: "#000000", opacity: 0.14, density: 0.55, size: 1.1 }],
  },
} satisfies Record<string, FigmaEffectStyle>

export type FigmaEffectName = keyof typeof FIGMA_EFFECTS

/** Inverse of the standard normal CDF (Acklam's approximation, plenty for a threshold). */
function probit(p: number) {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924]
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857]
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878]
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742]
  const q = Math.min(Math.max(p, 1e-6), 1 - 1e-6)
  if (q < 0.02425) { const r = Math.sqrt(-2 * Math.log(q)); return (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1) }
  if (q > 1 - 0.02425) { const r = Math.sqrt(-2 * Math.log(1 - q)); return -(((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1) }
  const r = q - 0.5, s = r * r
  return ((((((a[0] * s + a[1]) * s + a[2]) * s + a[3]) * s + a[4]) * s + a[5]) * r) / (((((b[0] * s + b[1]) * s + b[2]) * s + b[3]) * s + b[4]) * s + 1)
}

/**
 * An alpha table that turns fractal noise into speckles: the brightest `density` of the noise
 * becomes `opacity`, the rest transparent. Fractal noise is roughly normal around 0.5 (sd ≈ 0.13).
 */
export function speckleTable({ density, opacity }: Pick<Noise, "density" | "opacity">, steps = 64) {
  const t = 0.5 + 0.13 * probit(1 - density)
  return Array.from({ length: steps }, (_, i) => (i / (steps - 1) >= t ? opacity : 0)).map((v) => +v.toFixed(3)).join(" ")
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) => +v.toFixed(3))
}
