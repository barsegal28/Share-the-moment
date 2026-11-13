// @ts-nocheck — ported verbatim from the "You did it! · glow-up" artifact (src/glowup.js).
// Glow-up planet — frame generator. Spec: paper-cut/motion/glow-up.md (incl. "Full-screen variant").
// Every frame is a list of layers in screen pixels on a 1194 x 834 stage, painted in order:
//   ['p', fill, pathD, shadowDy, shadowBlur]   torn-paper piece
//   ['s', edgeColor, [silhouettePathD…], [art…]] sticker; art: ['f', fill, d, 'NONZERO'|'EVENODD'] | ['l', stroke, d, width]
// Deterministic: the same frame index always yields the same cut (stop-motion boil = 3 cuts, every 2 frames).
let _s = 7, BOIL = 0; const seed = v => { _s = v + BOIL }; const R = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };
const f = v => v.toFixed(1), D2R = Math.PI / 180;
const rot = (p, c, a) => { const s = Math.sin(a), co = Math.cos(a), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co]; };
const ST = { hand: { n: 11, jit: .05, sm: 1 }, soft: { n: 14, jit: .025, sm: 1 } };
function local(n, jit, rx, ry) { const o = []; const a0 = jit ? R() * 6.2832 : 0; for (let i = 0; i < n; i++) { const a = a0 + (i + (R() - .5) * jit * 2) / n * 6.2832; const k = 1 + (R() - .5) * 2 * jit; o.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]); } return o; }
const place = (o, cx, cy, t) => o.map(q => rot([cx + q[0], cy + q[1]], [cx, cy], t * D2R));
const poly = p => 'M' + p.map(q => f(q[0]) + ' ' + f(q[1])).join(' L') + ' Z';
function smooth(p) { const n = p.length; let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]); for (let i = 0; i < n; i++) { const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n]; d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`; } return d + ' Z'; }
const draw = (st, p) => ST[st].sm ? smooth(p) : poly(p);
const shapeD = (st, cx, cy, rx, ry, t = 0, jm = 1) => { const s = ST[st]; return draw(st, place(local(s.n, s.jit * jm, rx, ry), cx, cy, t)); };
let LASTRING = null;
function ringD(st, cx, cy, rx, ry, th, t = 0) { const s = ST[st]; const N = Math.max(s.n * 2, 22); const o = local(N, s.jit * .35, rx, ry); LASTRING = { o, rx, ry, th, cx, cy, t }; const inner = o.map(q => [q[0] * (rx - th) / rx, q[1] * (ry - th) / ry]).reverse(); return draw(st, place(o, cx, cy, t)) + ' ' + draw(st, place(inner, cx, cy, t)); }
function starD(st, cx, cy, Ro, ri, t) { const tips = [[0, 1], [62, 0.86], [118, 1.04], [178, 0.9], [238, 1.08], [302, 0.84]]; const p = []; tips.forEach((tp, i) => { const a1 = (-90 + tp[0] + t) * D2R; const r1 = Ro * tp[1] * (1 + (R() - .5) * ST[st].jit * 1.5); p.push([cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1]); const nxt = tips[(i + 1) % 6][0] + (i === 5 ? 360 : 0); const a2 = (-90 + (tp[0] + nxt) / 2 + t) * D2R; const r2 = ri * 1.15 * (1 + (R() - .5) * ST[st].jit * 1.5); p.push([cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2]); }); return poly(p); }
const PL2 = { cx: 232, cy: 242, rx: 152, ry: 136, t: -15 };
const RG = { cx: 250, cy: 246, rx: 208, ry: 46, t: -13 };
const SK = { cream: '#EDE2C2', orange: '#FD6117', teal: '#0B7563', peri: '#8BA1EF', pink: '#EC70BB', ink: '#112F29', gold: '#91781E' };
const LIGHT = '#FFF4D6';
const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const step = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const N = 108, BOB = [0, -2, -5, -7, -7, -5, -2, 0, 2, 3, 3, 2];
let SD = 500; const nx = () => seed(SD += 7);
const torn = (cx, cy, rx, ry, jm = 1.4) => { nx(); return shapeD('hand', cx, cy, rx, ry, 0, jm); };
const tornStar = (cx, cy, Ro, ri, t) => { nx(); return starD('hand', cx, cy, Ro, ri, t); };
const geoE = (cx, cy, rx, ry, t) => { nx(); return shapeD('soft', cx, cy, rx, ry, t, .55); };
const smoothStar = p => { const n = p.length; let d = ''; for (let i = 0; i < n; i++) { const a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n]; const q1 = [b[0] + (a[0] - b[0]) * .12, b[1] + (a[1] - b[1]) * .12], q2 = [b[0] + (c[0] - b[0]) * .12, b[1] + (c[1] - b[1]) * .12]; d += (i ? 'L' : 'M') + f(q1[0]) + ' ' + f(q1[1]) + `Q${f(b[0])} ${f(b[1])} ${f(q2[0])} ${f(q2[1])}`; } return d + 'Z'; };
const starPath = (cx, cy, Ro, ri, t) => { const tips = [[0, 1], [62, .86], [118, 1.04], [178, .9], [238, 1.08], [302, .84]]; const p = []; tips.forEach((tp, i) => { const a1 = (-90 + tp[0] + t) * D2R; p.push([cx + Math.cos(a1) * Ro * tp[1], cy + Math.sin(a1) * Ro * tp[1]]); const nxt = tips[(i + 1) % 6][0] + (i === 5 ? 360 : 0); const a2 = (-90 + (tp[0] + nxt) / 2 + t) * D2R; p.push([cx + Math.cos(a2) * ri * 1.15, cy + Math.sin(a2) * ri * 1.15]); }); return smoothStar(p); };
const diamond = (cx, cy, r, t) => poly([[0, -r], [r * .62, 0], [0, r], [-r * .62, 0]].map(q => rot([cx + q[0], cy + q[1]], [cx, cy], t * D2R)));
const CONF = [SK.orange, SK.pink, SK.peri, SK.teal, SK.gold];

// Periwinkle ringed planet (this screen's colourway)
const C = { planet: SK.peri, ring: SK.pink, star: SK.teal, edge: SK.peri, starEdge: SK.peri, P: PL2, glow: [SK.pink, SK.peri] };

// front half of the last ring (local y >= 0), as a closed band — used instead of a clip/boolean
function crSample(p, steps = 6) { const n = p.length, out = []; for (let i = 0; i < n; i++) { const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  for (let k = 0; k < steps; k++) { const u = k / steps, v = 1 - u; out.push([v*v*v*p1[0] + 3*v*v*u*c1[0] + 3*v*u*u*c2[0] + u*u*u*p2[0], v*v*v*p1[1] + 3*v*v*u*c1[1] + 3*v*u*u*c2[1] + u*u*u*p2[1]]); } } return out; }
function frontArc(pts) { const n = pts.length; let s = 0; for (let i = 0; i < n; i++) if (pts[i][1] < 0 && pts[(i + 1) % n][1] >= 0) { s = (i + 1) % n; break; }
  const out = []; for (let k = 0; k < n; k++) { const q = pts[(s + k) % n]; if (q[1] < 0) break; out.push(q); } return out; }
function ringFrontD() { const { o, rx, ry, th, cx, cy, t } = LASTRING; const outer = frontArc(crSample(o)); const inner = frontArc(crSample(o.map(q => [q[0] * (rx - th) / rx, q[1] * (ry - th) / ry])));
  return poly(place(outer.concat(inner.reverse()), cx, cy, t)); }

const W = 1194, H = 834;
const PLACE = { x: 569.4, y: 534.9, s: 1.227, r: -3.9 };
const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
const T = (x, y) => [1, 0, 0, 1, x, y], S = k => [k, 0, 0, k, 0, 0], Rt = deg => { const a = deg * D2R; return [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]; };
const chain = (...m) => m.reduce((a, b) => mul(a, b));
const G = chain(T(PLACE.x, PLACE.y), Rt(PLACE.r), S(PLACE.s), T(-230, -238));
const INNER = chain(T(230, 238), S(.8), T(-230, -238));
const I = [1, 0, 0, 1, 0, 0];
const ap = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
const sc = M => Math.hypot(M[0], M[1]);
const r0 = v => Math.round(v * 2) / 2;
function tx(d, M) {
  const tk = d.match(/[MLCQHZ]|-?\d*\.?\d+(?:e-?\d+)?/g); let out = [], i = 0, cmd = '', cy = 0;
  const pt = () => { const x = +tk[i++], y = +tk[i++]; cy = y; const p = ap(M, x, y); return r0(p[0]) + ' ' + r0(p[1]); };
  while (i < tk.length) { const t = tk[i]; if (/[MLCQHZ]/.test(t)) { cmd = t; i++; if (cmd === 'Z') { out.push('Z'); continue; } }
    if (cmd === 'M' || cmd === 'L') out.push(cmd + ' ' + pt());
    else if (cmd === 'C') out.push('C ' + pt() + ' ' + pt() + ' ' + pt());
    else if (cmd === 'Q') out.push('Q ' + pt() + ' ' + pt());
    else if (cmd === 'H') { const x = +tk[i++]; const p = ap(M, x, cy); out.push('L ' + r0(p[0]) + ' ' + r0(p[1])); } }
  return out.join(' ');
}
const ellD = (x, y, rx, ry, deg = 0) => { const k = .5523, M = chain(T(x, y), Rt(deg)); const P = (a, b) => ap(M, a, b).map(v => v.toFixed(2)).join(' ');
  return `M ${P(rx, 0)} C ${P(rx, ry * k)} ${P(rx * k, ry)} ${P(0, ry)} C ${P(-rx * k, ry)} ${P(-rx, ry * k)} ${P(-rx, 0)} C ${P(-rx, -ry * k)} ${P(-rx * k, -ry)} ${P(0, -ry)} C ${P(rx * k, -ry)} ${P(rx, -ry * k)} ${P(rx, 0)} Z`; };
const qD = (x1, y1, qx, qy, x2, y2) => `M${f(x1)} ${f(y1)} Q${f(qx)} ${f(qy)} ${f(x2)} ${f(y2)}`;

const SR = [0, 0, 10, 22, 38, 54, 66, 74, 76, 70, 58, 44, 30, 18, 8, 0, 0, 0];
const DISC = [24, 32, 46, 70, 110, 170, 260, 390, 560, 760, 960, 1010, 1010, 1000, 990, 980, 975, 970];
const RECEDE = [940, 700, 500, 350, 240, 0];
const BOXSH = [5 * PLACE.s, 5 * PLACE.s], SCRSH = [7, 7];

function frame(i) {
  const P = C.P, CX = P.cx, CY = P.cy;
  BOIL = (Math.floor(i / 2) % 3) * 53; SD = 500;
  const bob = i < 54 ? BOB[i % 12] : i >= 84 ? BOB[i % 12] * .6 : 0;
  const L = [];
  const [SX, SY] = ap(G, CX, CY);
  const pBox = (d, c) => L.push(['p', c, tx(d, G), ...BOXSH.map(r0)]);
  const pScr = (d, c) => L.push(['p', c, tx(d, I), ...SCRSH]);
  const halo = (r1, r2, cy) => { const k = .8; if (r2 > 0) pBox(torn(CX, cy, r2 * k, r2 * .9 * k), C.glow[1]); if (r1 > 0) pBox(torn(CX, cy, r1 * k, r1 * .9 * k), C.glow[0]); };
  const screenDisc = r => { pScr(torn(SX, SY, r * 1.2, r * 1.1 * .92), C.glow[1]); pScr(torn(SX, SY, r * 1.08, r * .92), C.glow[0]); pScr(torn(SX, SY, r, r * .92 * .92, 1.2), LIGHT); };
  const M = mul(G, INNER), MS = sc(M);
  if (i < 54 || i >= 84) {
    let fill = C.planet, face = 'base', haloK = 0, scale = 1;
    if (i < 36) { face = ['base', 'content', 'look', 'look', 'surprised', 'blink'][Math.floor(i / 6) % 6]; if (i % 12 === 11 && face === 'base') face = 'blink'; }
    else if (i < 54) { const t = (i - 36) / 17; face = t < .25 ? 'surprised' : t < .5 ? 'calm' : 'none'; fill = t < .35 ? C.planet : t < .6 ? mix(C.planet, LIGHT, .5) : LIGHT; haloK = step(0, 1, t * 1.6); }
    else { const t = (i - 84) / 23; scale = step(1.12, 1, t * 3); face = t < .55 ? 'calm' : 'base'; fill = t < .45 ? LIGHT : t < .6 ? mix(LIGHT, C.planet, .5) : C.planet; haloK = step(.8, 0, t * 2.2);
      const rr = RECEDE[Math.min(RECEDE.length - 1, i - 84)]; if (rr > 0) screenDisc(rr); }
    const cy = CY + bob, light = fill !== C.planet;
    if (haloK > 0) halo(P.ry * (1.08 + .1 * haloK) * (haloK > .05 ? 1 : 0), P.ry * (1.18 + .3 * haloK), cy);
    const RX = P.rx * scale, RY = P.ry * scale;
    const art = [], sil = [];
    const F = (d, c, rule) => art.push(['f', c, tx(d, M), rule || 'NONZERO']);
    const Ln = (d, c, w) => art.push(['l', c, tx(d, M), r0(w * MS)]);
    const tB = i >= 36 && i < 54 ? (i - 36) / 17 : null, tE = i >= 84 ? (i - 84) / 23 : null;
    const ringSt = tB !== null ? (tB < .3 ? 'on' : tB < .45 ? 'fall' : 'off') : tE !== null ? (tE < .62 ? 'off' : tE < .7 ? 'land' : 'on') : 'on';
    const starSt = tB !== null ? (tB < .18 ? 'on' : tB < .3 ? 'fall' : 'off') : tE !== null ? (tE < .74 ? 'off' : tE < .8 ? 'land' : 'on') : 'on';
    const rdy = ringSt === 'fall' ? 26 : ringSt === 'land' ? -22 : 0, rdt = ringSt === 'fall' ? 7 : ringSt === 'land' ? -5 : 0;
    nx(); const ring = ringD('soft', RG.cx, RG.cy + bob + rdy, RG.rx, RG.ry, 17, RG.t + rdt);
    const ringOuter = ring.slice(0, ring.indexOf(' M'));
    if (ringSt !== 'off') { F(ring, C.ring, 'EVENODD'); sil.push(tx(ringOuter, M)); }
    const body = geoE(CX, cy, RX, RY, P.t); F(body, fill); sil.push(tx(body, M));
    const front = ringFrontD();
    if (ringSt !== 'off') F(front, C.ring);
    const e1 = [152.1, 175.2 + bob], e2 = [281.6, 151.4 + bob], m = [219.5, 172 + bob];
    const bl = () => { F(ellD(154.1, 196.1 + bob, 11, 7, -9.5), SK.pink); F(ellD(283.6, 172.3 + bob, 11, 7, -7.6), SK.pink); };
    const sm = (dx = 0, w = 12) => { const Msm = mul(M, chain(T(207.4 + dx, 167 + bob), Rt(-8.06), S(1.7037 * w / 12))); art.push(['l', SK.ink, tx('M0 1.17 C4.7 6.65 9.39 6.26 14.09 0', Msm), r0(2.935 * 12 / w * sc(Msm))]); };
    const eye = (e, dx = 0, dy = 0, r = 9) => { F(ellD(e[0] + dx, e[1] + dy, r, r * 1.1), SK.ink); F(ellD(e[0] + dx + 3, e[1] + dy - 3, 3, 3), SK.cream); };
    const arcU = (x, y, w) => Ln(qD(x - w, y + 4, x, y - w, x + w, y + 4), SK.ink, 5);
    const arcD = (x, y, w) => Ln(qD(x - w, y - 2, x, y + w * .9, x + w, y - 2), SK.ink, 5);
    if (face === 'base' || face === 'look') { const dx = face === 'look' ? 6 : 0, dy = face === 'look' ? -3 : 0; eye(e1, dx, dy); eye(e2, dx, dy); sm(dx); bl(); }
    if (face === 'content') { arcU(e1[0], e1[1] + 2, 11); arcU(e2[0], e2[1] + 2, 11); sm(-3, 16); bl(); }
    if (face === 'surprised') { eye(e1, 0, -3, 12); eye(e2, 0, -3, 12); F(ellD(m[0], m[1] + 4, 7, 9, -8), SK.ink); bl(); }
    if (face === 'blink') { Ln(`M${e1[0] - 11} ${e1[1]} L${e1[0] + 11} ${e1[1] - 2}`, SK.ink, 5); Ln(`M${e2[0] - 11} ${e2[1]} L${e2[0] + 11} ${e2[1] - 2}`, SK.ink, 5); sm(); bl(); }
    if (face === 'calm') { arcD(e1[0], e1[1], 12); arcD(e2[0], e2[1], 12); sm(2, 8); if (!light) bl(); }
    L.push(['s', C.edge, sil, art]);
    if (starSt !== 'off') { const sy = starSt === 'fall' ? 30 : starSt === 'land' ? -24 : 0; const d = tx(starPath(62, 398 + sy + bob * .5, 34, 15, -8 + (starSt === 'fall' ? 20 : 0)), M); L.push(['s', C.starEdge, [d], [['f', C.star, d, 'NONZERO']]]); }
  } else if (i < 66) {
    const t = (i - 54) / 11, r = [150, 110, 78, 54, 36, 24, 16, 11][Math.min(7, Math.floor(t * 8))];
    if (t < .7) { halo(r * 1.25, r * 1.55, CY); pBox(torn(CX, CY, r * .8, r * .92 * .8, 1.2), LIGHT); }
    else { const Rr = [22, 30, 26][Math.floor((t - .7) / .1) % 3]; pBox(torn(CX, CY, Rr * 1.6 * .8, Rr * 1.5 * .8), C.glow[1]); pBox(tornStar(CX, CY, Rr * .8, Rr * .45 * .8, i * 9), LIGHT); }
  } else {
    const k = i - 66;
    screenDisc(DISC[k]);
    const sr = SR[k] * 2.1; if (sr > 0) pScr(tornStar(SX, SY, sr, sr * .42, k * 7), C.planet);
    seed(4242 + BOIL); const pts = []; for (let q = 0; q < 22; q++) pts.push([(q / 22) * 360 + R() * 14, 30 + R() * 50, 760 + R() * 420, 11 + R() * 12]);
    if (k >= 3) pts.forEach(([a, d0, sp, sz], q) => { const tt = (k - 3) / 14; const dd = DISC[k] * (1.1 + d0 / 300) + sp * Math.pow(tt, .75) * .7; const x = SX + Math.cos(a * D2R) * dd, y = SY + Math.sin(a * D2R) * dd * .8; if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return; const c = CONF[q % CONF.length];
      pScr(q % 3 === 0 ? tornStar(x, y, sz * 1.25, sz * .5, a + i * 20) : diamond(x, y, sz, a + i * 25), c); });
  }
  return L;
}

export type Layer = (string | number | string[] | (string | number)[][])[]
export const FRAME_COUNT: number = N
export const STAGE = { width: W, height: H }
/** Screen-space centre of the planet (where the scatter starts). */
export const PLANET_CENTER = { x: ap(G, PL2.cx, PL2.cy)[0], y: ap(G, PL2.cx, PL2.cy)[1] }
export const PHASES = [
  { name: 'Idle', from: 0, to: 35 }, { name: 'Glow-up', from: 36, to: 53 }, { name: 'Condense', from: 54, to: 65 },
  { name: 'Burst', from: 66, to: 83 }, { name: 'Reborn', from: 84, to: 107 },
]
let cache: Layer[][] | null = null
export function buildFrames(): Layer[][] { if (!cache) { cache = []; for (let i = 0; i < N; i++) cache.push(frame(i)); } return cache }
