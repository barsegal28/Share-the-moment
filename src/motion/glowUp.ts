/*
 * Motion: Glow-up (sticker + paper)
 * ---------------------------------
 * A celebration loop for a sticker character. It idles, glows, shrinks into a star,
 * bursts into light and comes back. The character stays a sticker (clean, die-cut,
 * no grain); the light effects are torn paper (grain, lift). Everything moves like
 * stop-motion: every edge is re-cut every 2 frames, and frames are never tweened.
 *
 * This file is the definition. `GLOW_UP` holds the timing and the rules, and
 * `glowUpFrame()` draws any frame as an SVG string in a 460 × 460 box.
 * Spec: docs/MOTION-GLOW-UP.md · Component: <GlowUp> · Stories: Motion/Glow-up
 */

// ───────────────────────────── definition ─────────────────────────────

export const GLOW_UP = {
  frames: 108,
  /** Default playback. 17 fps ≈ 6.4 s; 12 fps = 9 s. */
  fps: 17,
  /** Edges are re-cut every `boilEvery` frames, cycling through `boilCuts` cuts. */
  boilEvery: 2,
  boilCuts: 3,
  /** Artwork box; the character is drawn at 80% so the border and halos fit. */
  box: 460,
  artScale: 0.8,
  /** Idle bob in box units, one value per frame, repeating. */
  bob: [0, -2, -5, -7, -7, -5, -2, 0, 2, 3, 3, 2],
  phases: [
    { id: "idle", from: 0, to: 35, label: "A · Idle", note: "Bob and change faces every 6 frames" },
    { id: "glow", from: 36, to: 53, label: "B · Glow-up", note: "Details peel off, fill fades to light, paper halos grow" },
    { id: "condense", from: 54, to: 65, label: "C · Condense", note: "Light shrinks in steps, then a small spinning paper star" },
    { id: "burst", from: 66, to: 83, label: "D · Burst", note: "Paper light disc pops, a star spins open and closed, confetti flies" },
    { id: "reborn", from: 84, to: 107, label: "E · Reborn", note: "Starts 12% big, colour returns, details stick back on" },
  ],
  faces: ["base", "content", "look", "look", "surprised", "blink"] as const,
  condenseRadii: [150, 110, 78, 54, 36, 24, 16, 11],
  burstDisc: [26, 34, 48, 72, 110, 150, 182, 200, 206, 206, 206, 206, 206, 204, 200, 196, 192, 190],
  burstStar: [0, 0, 10, 22, 38, 54, 66, 74, 76, 70, 58, 44, 30, 18, 8, 0, 0, 0],
  light: "#FFF4D6",
  sticker: { border: 9, kiss: 3.5, shadow: { y: 7, blur: 5, alpha: 0.38 } },
  paper: { grain: 0.1, shadow: { y: 5, blur: 2.5, alpha: 0.28 } },
} as const

export type GlowUpPhase = (typeof GLOW_UP.phases)[number]["id"]
export const phaseAt = (i: number): GlowUpPhase => GLOW_UP.phases.find((p) => i >= p.from && i <= p.to)!.id

const SK = { cream: "#EDE2C2", orange: "#FD6117", teal: "#0B7563", peri: "#8BA1EF", pink: "#EC70BB", ink: "#112F29", gold: "#91781E" }
const CONFETTI = [SK.orange, SK.pink, SK.peri, SK.teal, SK.gold]

export const GLOW_UP_CHARACTERS = {
  stripedPlanet: { label: "Striped planet", fill: SK.orange, detail: SK.peri, kiss: SK.pink, glow: [SK.peri, SK.pink] },
  ringedPlanet: { label: "Ringed planet", fill: SK.teal, detail: SK.pink, star: SK.gold, kiss: SK.peri, glow: [SK.pink, SK.peri] },
} as const
export type GlowUpCharacter = keyof typeof GLOW_UP_CHARACTERS

// ───────────────────────────── geometry ─────────────────────────────

type Pt = [number, number]
let seedV = 7
let boil = 0
let sd = 500
const seed = (v: number) => { seedV = v + boil }
const R = () => { seedV = (seedV * 16807) % 2147483647; return (seedV - 1) / 2147483646 }
const nx = () => seed((sd += 7))
const f = (v: number) => v.toFixed(1)
const D2R = Math.PI / 180
const rot = (p: Pt, c: Pt, a: number): Pt => {
  const s = Math.sin(a), co = Math.cos(a), dx = p[0] - c[0], dy = p[1] - c[1]
  return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co]
}
const STYLE = { soft: { n: 14, jit: 0.025 }, hand: { n: 11, jit: 0.05 } }
type Cut = keyof typeof STYLE
function local(n: number, jit: number, rx: number, ry: number): Pt[] {
  const o: Pt[] = []
  const a0 = jit ? R() * 6.2832 : 0
  for (let i = 0; i < n; i++) {
    const a = a0 + ((i + (R() - 0.5) * jit * 2) / n) * 6.2832
    const k = 1 + (R() - 0.5) * 2 * jit
    o.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k])
  }
  return o
}
const place = (o: Pt[], cx: number, cy: number, t: number) => o.map((q) => rot([cx + q[0], cy + q[1]], [cx, cy], t * D2R))
const poly = (p: Pt[]) => "M" + p.map((q) => f(q[0]) + " " + f(q[1])).join(" L") + " Z"
function smooth(p: Pt[]) {
  const n = p.length
  let d = "M" + f(p[0][0]) + " " + f(p[0][1])
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n]
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + " Z"
}
const shapeD = (st: Cut, cx: number, cy: number, rx: number, ry: number, t = 0, jm = 1) =>
  smooth(place(local(STYLE[st].n, STYLE[st].jit * jm, rx, ry), cx, cy, t))
function ringD(cx: number, cy: number, rx: number, ry: number, th: number, t: number) {
  const o = local(28, STYLE.soft.jit * 0.35, rx, ry)
  const inner = o.map((q): Pt => [(q[0] * (rx - th)) / rx, (q[1] * (ry - th)) / ry]).reverse()
  return smooth(place(o, cx, cy, t)) + " " + smooth(place(inner, cx, cy, t))
}
const TIPS: Pt[] = [[0, 1], [62, 0.86], [118, 1.04], [178, 0.9], [238, 1.08], [302, 0.84]]
function starD(st: Cut, cx: number, cy: number, Ro: number, ri: number, t: number) {
  const p: Pt[] = []
  TIPS.forEach((tp, i) => {
    const a1 = (-90 + tp[0] + t) * D2R, r1 = Ro * tp[1] * (1 + (R() - 0.5) * STYLE[st].jit * 1.5)
    p.push([cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1])
    const nxt = TIPS[(i + 1) % 6][0] + (i === 5 ? 360 : 0)
    const a2 = (-90 + (tp[0] + nxt) / 2 + t) * D2R, r2 = ri * 1.15 * (1 + (R() - 0.5) * STYLE[st].jit * 1.5)
    p.push([cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2])
  })
  return poly(p)
}
/** The six-point sticker star, corners softened. */
function stickerStar(cx: number, cy: number, Ro: number, ri: number, t: number) {
  const p: Pt[] = []
  TIPS.forEach((tp, i) => {
    const a1 = (-90 + tp[0] + t) * D2R
    p.push([cx + Math.cos(a1) * Ro * tp[1], cy + Math.sin(a1) * Ro * tp[1]])
    const nxt = TIPS[(i + 1) % 6][0] + (i === 5 ? 360 : 0)
    const a2 = (-90 + (tp[0] + nxt) / 2 + t) * D2R
    p.push([cx + Math.cos(a2) * ri * 1.15, cy + Math.sin(a2) * ri * 1.15])
  })
  const n = p.length
  let d = ""
  for (let i = 0; i < n; i++) {
    const a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n]
    const q1 = [b[0] + (a[0] - b[0]) * 0.12, b[1] + (a[1] - b[1]) * 0.12], q2 = [b[0] + (c[0] - b[0]) * 0.12, b[1] + (c[1] - b[1]) * 0.12]
    d += (i ? "L" : "M") + f(q1[0]) + " " + f(q1[1]) + `Q${f(b[0])} ${f(b[1])} ${f(q2[0])} ${f(q2[1])}`
  }
  return d + "Z"
}
const diamond = (cx: number, cy: number, r: number, t: number) =>
  poly(([[0, -r], [r * 0.62, 0], [0, r], [-r * 0.62, 0]] as Pt[]).map((q) => rot([cx + q[0], cy + q[1]], [cx, cy], t * D2R)))
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number) =>
  "#" + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, "0")).join("")
const step = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t))

// character geometry (460 box)
const m1 = (x: number, y: number): Pt => [230 + (x - 225) * 0.92, 236 + (y - 210) * 0.92]
const STRIPES = ([[232, 100, 342, 90], [30, 155, 105, 147], [335, 185, 420, 175], [68, 322, 157, 312], [280, 303, 377, 295]] as const).map(
  (s) => [...m1(s[0], s[1]), ...m1(s[2], s[3])],
)
const E1 = [m1(118, 228), m1(345, 242)], M1 = m1(218, 232)
const BODY = {
  stripedPlanet: { cx: 230, cy: 236, rx: 190, ry: 158, t: -4 },
  ringedPlanet: { cx: 232, cy: 242, rx: 152, ry: 136, t: -15 },
}
const RING = { cx: 250, cy: 246, rx: 208, ry: 46, t: -13 }

// ───────────────────────────── drawing ─────────────────────────────

const Fp = (d: string, c: string, x = "") => `<path d="${d}" fill="${c}" ${x}/>`
const Sp = (d: string, c: string, w: number) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
const ell = (x: number, y: number, rx: number, ry: number, c: string, t = 0) =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${c}" transform="rotate(${t} ${f(x)} ${f(y)})"/>`
const dotEye = (x: number, y: number, r: number) => ell(x, y, r, r * 1.1, SK.ink) + ell(x + r * 0.35, y - r * 0.4, r * 0.32, r * 0.32, SK.cream)
const blush = (x: number, y: number, rx = 13) => ell(x, y, rx, rx * 0.62, SK.pink)
const smile = (x: number, y: number, w: number) => Sp(`M${f(x - w)} ${f(y)} Q${f(x)} ${f(y + w * 1.1)} ${f(x + w)} ${f(y)}`, SK.ink, 5)
const arcUp = (x: number, y: number, w: number) => Sp(`M${f(x - w)} ${f(y + 4)} Q${f(x)} ${f(y - w)} ${f(x + w)} ${f(y + 4)}`, SK.ink, 5)
const arcDn = (x: number, y: number, w: number) => Sp(`M${f(x - w)} ${f(y - 2)} Q${f(x)} ${f(y + w * 0.9)} ${f(x + w)} ${f(y - 2)}`, SK.ink, 5)
const softE = (cx: number, cy: number, rx: number, ry: number, t: number) => { nx(); return shapeD("soft", cx, cy, rx, ry, t, 0.55) }
const torn = (cx: number, cy: number, rx: number, ry: number, jm = 1.4) => { nx(); return shapeD("hand", cx, cy, rx, ry, 0, jm) }
const tornStar = (cx: number, cy: number, Ro: number, ri: number, t: number) => { nx(); return starD("hand", cx, cy, Ro, ri, t) }

export interface GlowUpFrameOptions {
  /** Rendered width in px; keeps the sticker border at 9 px whatever the size. */
  size?: number
  /** Prefix for SVG ids, so several animations can share a page. */
  idPrefix?: string
}

/** Draws frame `i` (0–107) of the glow-up as an SVG string. */
export function glowUpFrame(character: GlowUpCharacter, i: number, { size = 300, idPrefix = "gu" }: GlowUpFrameOptions = {}) {
  const G = GLOW_UP, C = GLOW_UP_CHARACTERS[character], P = BODY[character]
  const CX = P.cx, CY = P.cy, LIGHT = G.light, K = size / G.box
  const id = (s: string) => `${idPrefix}-${s}`
  let fid = 0
  boil = (Math.floor(i / G.boilEvery) % G.boilCuts) * 53
  sd = 500

  const sticker = (inner: string, edge: string) => {
    const fi = id("s" + fid++), r1 = G.sticker.border / K, r2 = (G.sticker.border + G.sticker.kiss) / K, b = 3.4 / K
    const mask = (r: number, res: string) =>
      `<feMorphology in="SourceAlpha" operator="dilate" radius="${f(r)}"/><feGaussianBlur stdDeviation="${f(b)}"/><feComponentTransfer result="${res}"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer>`
    const sh = G.sticker.shadow
    return `<filter id="${fi}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">${mask(r1, "m1")}${mask(r2, "m2")}<feFlood flood-color="${SK.cream}"/><feComposite in2="m1" operator="in" result="cream"/><feFlood flood-color="${edge}"/><feComposite in2="m2" operator="in" result="edge"/><feGaussianBlur in="m2" stdDeviation="${f(sh.blur / K)}"/><feOffset dy="${f(sh.y / K)}" result="sb"/><feFlood flood-color="#000" flood-opacity="${sh.alpha}"/><feComposite in2="sb" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="edge"/><feMergeNode in="cream"/><feMergeNode in="SourceGraphic"/></feMerge></filter><g filter="url(#${fi})"><g transform="translate(230 238) scale(${G.artScale}) translate(-230 -238)">${inner}</g></g>`
  }
  const paper = (d: string, c: string) => `<path d="${d}" fill="${c}" filter="url(#${id("paper")})"/>`
  const g = G.paper.grain, ps = G.paper.shadow
  const defs = `<defs><filter id="${id("paper")}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="4" stitchTiles="stitch" result="t"/><feColorMatrix in="t" type="saturate" values="0" result="m"/><feComponentTransfer in="m" result="n"><feFuncR type="linear" slope="${2.2 * g}" intercept="${1 - 1.8 * g}"/><feFuncG type="linear" slope="${2.2 * g}" intercept="${1 - 1.8 * g}"/><feFuncB type="linear" slope="${2.2 * g}" intercept="${1 - 1.8 * g}"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer><feBlend in="SourceGraphic" in2="n" mode="multiply" result="b"/><feComposite in="b" in2="SourceGraphic" operator="in" result="gr"/><feDropShadow in="gr" dx="0" dy="${ps.y}" stdDeviation="${ps.blur}" flood-color="#000" flood-opacity="${ps.alpha}"/></filter></defs>`

  const bob = i < 54 ? G.bob[i % 12] : i >= 84 ? G.bob[i % 12] * 0.6 : 0
  const halo = (r1: number, r2: number, cy: number) => {
    let h = ""
    const k = G.artScale
    if (r2 > 0) h += paper(torn(CX, cy, r2 * k, r2 * 0.9 * k), C.glow[1])
    if (r1 > 0) h += paper(torn(CX, cy, r1 * k, r1 * 0.9 * k), C.glow[0])
    return h
  }
  let layers = ""

  if (i < 54 || i >= 84) {
    // A idle · B glow-up · E reborn
    let fill: string = C.fill, stripesOn = 5, face: string = "base", haloK = 0, scale = 1
    if (i < 36) {
      face = G.faces[Math.floor(i / 6) % 6]
      if (i % 12 === 11 && face === "base") face = "blink"
    } else if (i < 54) {
      const t = (i - 36) / 17
      face = t < 0.25 ? "surprised" : t < 0.5 ? "calm" : "none"
      stripesOn = Math.max(0, 5 - Math.floor((i - 36) / 2))
      fill = t < 0.35 ? C.fill : t < 0.6 ? mix(C.fill, LIGHT, 0.5) : LIGHT
      haloK = step(0, 1, t * 1.6)
    } else {
      const t = (i - 84) / 23
      scale = step(1.12, 1, t * 3)
      face = t < 0.55 ? "calm" : "base"
      fill = t < 0.45 ? LIGHT : t < 0.6 ? mix(LIGHT, C.fill, 0.5) : C.fill
      stripesOn = Math.max(0, Math.min(5, Math.floor((t - 0.55) * 14)))
      haloK = step(0.8, 0, t * 2.2)
    }
    const cy = CY + bob, light = fill !== C.fill
    if (haloK > 0) layers += halo(P.ry * (1.08 + 0.1 * haloK) * (haloK > 0.05 ? 1 : 0), P.ry * (1.18 + 0.3 * haloK), cy)
    const RX = P.rx * scale, RY = P.ry * scale
    let art = ""
    if (character === "stripedPlanet") {
      art += Fp(softE(CX, cy, RX, RY, P.t), fill)
      if (stripesOn)
        art += `<clipPath id="${id("cp")}"><path d="${softE(CX, cy, RX - 2, RY - 2, P.t)}"/></clipPath><g clip-path="url(#${id("cp")})">` +
          STRIPES.slice(0, stripesOn).map((s) => Sp(`M${f(s[0])} ${f(s[1] + bob)}L${f(s[2])} ${f(s[3] + bob)}`, C.detail, 17)).join("") + "</g>"
      const e1: Pt = [E1[0][0], E1[0][1] + bob], e2: Pt = [E1[1][0], E1[1][1] + bob], m: Pt = [M1[0], M1[1] + bob]
      const bl = () => blush(e1[0] - 6, e1[1] + 30) + blush(e2[0] + 2, e2[1] + 30)
      if (face === "base" || face === "look") {
        const dx = face === "look" ? 6 : 0, dy = face === "look" ? -3 : 0
        art += dotEye(e1[0] + dx, e1[1] + dy, 10) + dotEye(e2[0] + dx, e2[1] + dy, 10) + smile(m[0] + dx, m[1] - 2, 13) + bl()
      }
      if (face === "content") art += arcUp(e1[0], e1[1] + 2, 11) + arcUp(e2[0], e2[1] + 2, 11) + smile(m[0], m[1] - 4, 18) + bl()
      if (face === "surprised") art += dotEye(e1[0], e1[1] - 3, 13) + dotEye(e2[0], e2[1] - 3, 13) + ell(m[0], m[1] + 6, 7.5, 9.5, SK.ink) + bl()
      if (face === "blink") art += Sp(`M${e1[0] - 11} ${e1[1]}H${e1[0] + 11}`, SK.ink, 5) + Sp(`M${e2[0] - 11} ${e2[1]}H${e2[0] + 11}`, SK.ink, 5) + smile(m[0], m[1] - 2, 13) + bl()
      if (face === "calm") art += arcDn(e1[0], e1[1], 12) + arcDn(e2[0], e2[1], 12) + smile(m[0], m[1] + 2, 8) + (light ? "" : bl())
      layers += sticker(art, C.kiss)
    } else {
      // ring and star sticker peel off during B and stick back on in E
      const tB = i >= 36 && i < 54 ? (i - 36) / 17 : null, tE = i >= 84 ? (i - 84) / 23 : null
      const ringSt = tB !== null ? (tB < 0.3 ? "on" : tB < 0.45 ? "fall" : "off") : tE !== null ? (tE < 0.62 ? "off" : tE < 0.7 ? "land" : "on") : "on"
      const starSt = tB !== null ? (tB < 0.18 ? "on" : tB < 0.3 ? "fall" : "off") : tE !== null ? (tE < 0.74 ? "off" : tE < 0.8 ? "land" : "on") : "on"
      const rdy = ringSt === "fall" ? 26 : ringSt === "land" ? -22 : 0, rdt = ringSt === "fall" ? 7 : ringSt === "land" ? -5 : 0
      nx()
      const ring = ringD(RING.cx, RING.cy + bob + rdy, RING.rx, RING.ry, 17, RING.t + rdt)
      if (ringSt !== "off") art += Fp(ring, C.detail, 'fill-rule="evenodd"')
      art += Fp(softE(CX, cy, RX, RY, P.t), fill)
      if (ringSt !== "off") {
        const clip = poly(place([[-600, 0], [600, 0], [600, 600], [-600, 600]], RING.cx, RING.cy + bob + rdy, RING.t + rdt))
        art += `<clipPath id="${id("rc")}"><path d="${clip}"/></clipPath><g clip-path="url(#${id("rc")})">${Fp(ring, C.detail, 'fill-rule="evenodd"')}</g>`
      }
      // face from Figma (12 Nov): small ink dot eyes set wide, ink smile, blush under the eyes
      const e1: Pt = [152.1, 175.2 + bob], e2: Pt = [281.6, 151.4 + bob], m: Pt = [219.5, 172 + bob]
      const bl = () => ell(154.1, 196.1 + bob, 11, 7, SK.pink, -9.5) + ell(283.6, 172.3 + bob, 11, 7, SK.pink, -7.6)
      const sm = (dx = 0, w = 12) =>
        `<path transform="translate(${207.4 + dx} ${167 + bob}) rotate(-8.06) scale(${(1.7037 * w) / 12})" d="M0 1.17C4.7 6.65 9.39 6.26 14.09 0" fill="none" stroke="${SK.ink}" stroke-width="${(2.935 * 12) / w}" stroke-linecap="round"/>`
      const eye = (e: Pt, dx = 0, dy = 0, r = 9) => ell(e[0] + dx, e[1] + dy, r, r * 1.1, SK.ink) + ell(e[0] + dx + 3, e[1] + dy - 3, 3, 3, SK.cream)
      if (face === "base" || face === "look") {
        const dx = face === "look" ? 6 : 0, dy = face === "look" ? -3 : 0
        art += eye(e1, dx, dy) + eye(e2, dx, dy) + sm(dx) + bl()
      }
      if (face === "content") art += arcUp(e1[0], e1[1] + 2, 11) + arcUp(e2[0], e2[1] + 2, 11) + sm(-3, 16) + bl()
      if (face === "surprised") art += eye(e1, 0, -3, 12) + eye(e2, 0, -3, 12) + ell(m[0], m[1] + 4, 7, 9, SK.ink, -8) + bl()
      if (face === "blink") art += Sp(`M${e1[0] - 11} ${e1[1]}L${e1[0] + 11} ${e1[1] - 2}`, SK.ink, 5) + Sp(`M${e2[0] - 11} ${e2[1]}L${e2[0] + 11} ${e2[1] - 2}`, SK.ink, 5) + sm() + bl()
      if (face === "calm") art += arcDn(e1[0], e1[1], 12) + arcDn(e2[0], e2[1], 12) + sm(2, 8) + (light ? "" : bl())
      layers += sticker(art, C.kiss)
      if (starSt !== "off") {
        const sy = starSt === "fall" ? 30 : starSt === "land" ? -24 : 0
        layers += sticker(Fp(stickerStar(62, 398 + sy + bob * 0.5, 34, 15, -8 + (starSt === "fall" ? 20 : 0)), "star" in C ? C.star : SK.gold), SK.orange)
      }
    }
  } else if (i < 66) {
    // C condense
    const t = (i - 54) / 11, r = G.condenseRadii[Math.min(7, Math.floor(t * 8))], k = G.artScale
    if (t < 0.7) {
      layers += halo(r * 1.25, r * 1.55, CY) + paper(torn(CX, CY, r * k, r * 0.92 * k, 1.2), LIGHT)
    } else {
      const rs = [22, 30, 26][Math.floor((t - 0.7) / 0.1) % 3]
      layers += paper(torn(CX, CY, rs * 1.6 * k, rs * 1.5 * k), C.glow[1]) + paper(tornStar(CX, CY, rs * k, rs * 0.45 * k, i * 9), LIGHT)
    }
  } else {
    // D burst
    const t = (i - 66) / 17, k = G.artScale
    const disc = G.burstDisc[i - 66] * 0.82, sr = G.burstStar[i - 66]
    layers += paper(torn(CX, CY, disc * 1.2 * k, disc * 1.1 * k), C.glow[1]) + paper(torn(CX, CY, disc * 1.08 * k, disc * k), C.glow[0]) + paper(torn(CX, CY, disc * k, disc * 0.92 * k, 1.2), LIGHT)
    if (sr > 0) layers += paper(tornStar(CX, CY, sr * k, sr * 0.42 * k, (i - 66) * 7), C.fill)
    if (t < 0.75) {
      seed(4242 + boil)
      const pts: number[][] = []
      for (let n = 0; n < 12; n++) pts.push([(n / 12) * 360 + R() * 20, 40 + R() * 30, 150 + R() * 90, 6 + R() * 7])
      pts.forEach(([a, d0, sp, sz], n) => {
        const dd = (disc * 1.25 + 14 + d0 * 0.3 + sp * t * 0.45) * k
        const x = CX + Math.cos(a * D2R) * dd, y = CY + Math.sin(a * D2R) * dd * 0.9, c = CONFETTI[n % CONFETTI.length]
        layers += n % 3 === 0 ? paper(tornStar(x, y, sz * 1.2, sz * 0.5, a + i * 20), c) : paper(diamond(x, y, sz, a + i * 25), c)
      })
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${G.box} ${G.box}" overflow="visible">${defs}${layers}</svg>`
}
