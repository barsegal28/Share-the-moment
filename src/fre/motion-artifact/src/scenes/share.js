// Share the moment — the kid sends the song to mom. Figma "share keyframes": 6 → 7 → 2 → 3 → 4. Ends on "mom got it".
// The kid taps Share on the share panel; the card turns transparent, leaving the music-note stickers;
// the notes crumple into a paper ball that unfolds into the light-blue comet; the sky clears, the comet flies
// (its own tail waves + speed dashes, like the reference) and zooms off; "mom got it" with a heart, and it holds there.
// The "You are a star!" result panel is a separate screen in the flow.
// Paper-cut / stop-motion rules (same as the glow-up): everything holds for 2 frames, cycles 3 cuts, no tweening.
import { drawLettering } from '../lettering.js';
import { createShareSfx } from '../sfx.js';

const FPS = 17;
export const SHARE_PHASES = [
  { name: 'Share panel', from: 0, to: 11 },
  { name: 'Card fades', from: 12, to: 25 },
  { name: 'Crumple', from: 26, to: 41 },
  { name: 'Comet', from: 42, to: 51 },
  { name: 'Clear sky', from: 52, to: 73 },
  { name: 'Fly off', from: 74, to: 89 },
  { name: 'Mom got it', from: 90, to: 119 },
];
const N = 120;
const O = 8; // the comet part (pop → fly off → mom got it) starts 8 frames later than in v1

// ---- assets (2x captures from Figma "share keyframes"; boxes are 1x render bounds on the 1194 x 834 stage) ----
export const STICKERS = [ // name, box [x, y, w, h], peel order
  ['heart', [563.2, 503.5, 182, 182], 0],
  ['sparkle-top', [508.3, 3.1, 178, 178], 1],
  ['striped-planet', [66, 78, 297, 297], 2],
  ['sparkle-left', [-13, 271.3, 174, 174], 3],
  ['cloud-comet', [74, 433, 305, 305], 4],
  ['ringed-planet', [754, 106, 310, 302], 5],
  ['sparkle-right', [918, 293, 192.5, 192.5], 6],
  ['star', [788, 477, 313, 313], 7],
];
const CARD = [278, 102.5, 640, 680];                // share panel (frame 6), captured without the notes
const SHARE_BTN = [478, 604.5, 240, 80];             // the Share button on it
const NOTES = [['note-quarter', [347, 298.8, 99, 111.5]], ['note-beamed', [432.4, 280.8, 108.2, 111.5]]];
const NC = [443.8, 336.5];                            // centre of the two notes
const HEART = [449, 87, 295, 295];                    // heart sticker above "mom got it" (frame 4)
const MOM = [585.7, 403.2];                           // "mom got it" lettering centre (frame 4)
const DIM = 0.7;                                      // stickers behind a panel are at 70%
const COMET = { size: 380.5, center: [187.1, 204.6] }; // silhouette centre inside the comet image (1x)
const P2 = [271 + 187.1, 230 + 204.6], P3 = [543 + 187.1, 155 + 204.6], EXIT = [1390, -230];
// Comet die-cut silhouette (relative to its centre), traced from the Figma sticker; starts at the leftmost point, clockwise.
const COMET_OUTLINE = [[-101.8,32.9],[-101.3,19.4],[-99.3,6.6],[-94.8,-5.3],[-88.3,-16.3],[-82.3,-27.5],[-75.3,-38.3],[-64.6,-45.3],[-52,-47.9],[-45.8,-59],[-35,-65.8],[-22.1,-67.8],[-10,-71.8],[1.6,-76.8],[14.3,-79.2],[28,-79.3],[41.3,-78.3],[54.1,-76.3],[66.3,-72.5],[78,-67.8],[86.9,-72.8],[99.1,-76.1],[108.2,-67.7],[118.8,-63.3],[131.3,-60.5],[135.7,-48.6],[128.9,-37.7],[130.7,-26.6],[128,-14.4],[116,-10.3],[107.5,-2.8],[100.8,7.8],[88.7,9.7],[80.7,0],[76.2,-11.3],[64.8,-5.7],[54.4,2.3],[44.5,11.6],[35.6,21.6],[28,32.2],[20.8,42.9],[14.6,54],[8.5,65.2],[2.7,76.5],[-3.8,87.5],[-11.4,98.1],[-20.9,107.5],[-32.7,112.2],[-45.6,110.2],[-53.8,100.8],[-65.3,95.9],[-71.1,84.7],[-82.3,78.8],[-85.8,66.5],[-94.1,57.2],[-99.8,45.8]];
const TAIL = { dir: Math.atan2(0.3, -0.95) }; // direction the speed dashes stream back (local)
const HEAD = [112, -58];
const STAR = { at: [95.3, -36.1] }; // the comet's orange head star (local)
// The comet's own blue body waves along the axis from the star to the tail end (local).
const BODY = { tail: [-72, 70] };

const C = { cream: '#EDE2C2', orange: '#FD6117', pink: '#EC70BB', peri: '#8BA1EF', teal: '#0B7563', gold: '#91781E', ink: '#112F29', light: '#C3CAF7' };
const CONF = [C.orange, C.pink, C.peri, C.cream, C.gold];

// ---- helpers ----
const rng = seed => { let s = (seed * 9301 + 49297) % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const clamp01 = t => Math.max(0, Math.min(1, t));
const held = (f, from, to) => clamp01((Math.floor((f - from) / 2) * 2) / (to - from)); // progress that only changes every 2 frames
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => 'rgb(' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',') + ')';
function smoothPath(pts) { // closed Catmull-Rom through the points
  const n = pts.length, p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) { const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n], d = pts[(i + 2) % n];
    p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]); }
  p.closePath(); return p;
}


function paper(ctx, k, path, fill, grain, { dy = 5, blur = 6, alpha = .28 } = {}) {
  ctx.save(); ctx.shadowColor = `rgba(0,0,0,${alpha})`; ctx.shadowOffsetY = dy * k; ctx.shadowBlur = blur * k; ctx.fillStyle = fill; ctx.fill(path); ctx.restore();
  if (grain) { ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(grain, 0, 0); ctx.restore(); }
}
function diamond(x, y, r, a) { const p = new Path2D(); [[0, -r], [r * .62, 0], [0, r], [-r * .62, 0]].forEach(([u, v], i) => { const c = Math.cos(a), s = Math.sin(a); const X = x + u * c - v * s, Y = y + u * s + v * c; i ? p.lineTo(X, Y) : p.moveTo(X, Y); }); p.closePath(); return p; }
function star6(x, y, R, r, a, rnd) { const p = new Path2D(); for (let i = 0; i < 12; i++) { const ang = a + i * Math.PI / 6 - Math.PI / 2, rr = (i % 2 ? r : R) * (1 + (rnd() - .5) * .12); const X = x + Math.cos(ang) * rr, Y = y + Math.sin(ang) * rr; i ? p.lineTo(X, Y) : p.moveTo(X, Y); } p.closePath(); return p; }
function capsule(x, y, len, w, a) { const p = new Path2D(); const c = Math.cos(a), s = Math.sin(a), hl = len / 2 - w / 2;
  p.arc(x + c * hl, y + s * hl, w / 2, a - Math.PI / 2, a + Math.PI / 2); p.arc(x - c * hl, y - s * hl, w / 2, a + Math.PI / 2, a + 3 * Math.PI / 2); p.closePath(); return p; }

// ---- scene ----
export function createShare({ images, paperGrain }) {
  const boil = STICKERS.map((_, i) => { const r = rng(i + 3); return [0, 1, 2].map(c => c === 0 ? [0, 0, 0] : [(r() - .5) * 2.4, (r() - .5) * 2.4, (r() - .5) * 1.6]); });

  function drawImg(ctx, name, box, { dx = 0, dy = 0, scale = 1, rot = 0 } = {}) {
    const img = images[name]; const [x, y, w, h] = box; const cx = x + w / 2, cy = y + h / 2;
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot * Math.PI / 180); ctx.scale(scale, scale); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
  }

  // ---- the background stickers: idle boil, then peel off one by one (lift → drop → gone) ----
  function drawStickers(ctx, f, cut) {
    for (let i = 0; i < STICKERS.length; i++) {
      const [name, box, order] = STICKERS[i]; const [bx, by, br] = boil[i][cut];
      let o = { dx: bx, dy: by, rot: br, scale: 1 }, a = name === 'star' ? 1 : (f < 42 ? DIM : 1);
      const r = f - (44 + O + order * 2);
      if (r >= 4) continue; // peeled off
      if (r >= 0 && r < 2) o = { dx: bx, dy: by - 6, rot: br + 4, scale: 1.06 };
      if (r >= 2) o = { dx: bx + 6, dy: by + 34, rot: br + 13, scale: 0.97 };
      ctx.save(); ctx.globalAlpha = a; drawImg(ctx, name, box, o); ctx.restore();
    }
  }

  // ---- share panel: tap Share, then the card turns transparent in held steps (notes stay) ----
  function drawCard(ctx, f) {
    const [x, y, w, h] = CARD, img = images['share-card'];
    const a = f < 12 ? 1 : [.75, .5, .25, .1][Math.floor((f - 12) / 2)];
    if (a === undefined) return;
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(img, x, y, w, h); ctx.restore();
    if (f >= 10 && f < 12) { const [bx, by, bw, bh] = SHARE_BTN; const p = new Path2D(); p.roundRect(bx, by, bw, bh, 40); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fill(p); }
  }

  // ---- the music notes: float, then squeeze together into a ball ----
  function drawNotes(ctx, f, cut) {
    if (f >= 30) return;
    const bob = f >= 12 ? [0, -4, 2][cut] : 0;
    NOTES.forEach(([name, box], i) => {
      const cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2, side = i ? 1 : -1;
      let o = { dy: bob, scale: 1, rot: 0 };
      if (f === 12 || f === 13) o = { dy: -6, scale: 1.08, rot: side * 3 };
      if (f >= 26) { const t = f >= 28 ? .9 : .5; o = { dx: (NC[0] - cx) * t, dy: (NC[1] - cy) * t + bob, scale: f >= 28 ? .78 : .9, rot: -side * (f >= 28 ? 24 : 12) }; }
      drawImg(ctx, name, box, o);
    });
  }

  // ---- mixed paper blob: two held keyframes (A at the notes, B bigger at the comet spot), boiling, then the comet pops ----
  function blobLayer(cx, cy, r, seed, n = 9, jit = .16) {
    const rnd = rng(seed); return smoothPath(Array.from({ length: n }, (_, j) => { const a = j / n * Math.PI * 2, rr = r * (1 - jit + rnd() * jit * 2); return [cx + Math.cos(a) * rr * 1.12, cy + Math.sin(a) * rr * .9]; }));
  }
  function drawCrumple(ctx, k, f, cut) {
    const B = f >= 36; // keyframe B
    const cx = B ? lerp(NC[0], P2[0], .55) : NC[0], cy = B ? lerp(NC[1], P2[1], .55) : NC[1], R = B ? 74 : 58, rot = (B ? -12 : 8) * Math.PI / 180;
    const sd = (B ? 900 : 700) + cut * 13; // boil: re-cut every 2 frames
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
    // collage of torn paper scraps: periwinkle base, then the notes' colours folded in
    paper(ctx, k, blobLayer(cx, cy, R, sd), C.peri, paperGrain, { dy: 8, blur: 10, alpha: .3 });
    paper(ctx, k, blobLayer(cx - R * .28, cy + R * .12, R * .5, sd + 1, 7, .2), C.orange, paperGrain, { dy: 3, blur: 4, alpha: .22 });
    paper(ctx, k, blobLayer(cx + R * .25, cy - R * .2, R * .38, sd + 2, 7, .2), C.gold, paperGrain, { dy: 3, blur: 4, alpha: .22 });
    paper(ctx, k, blobLayer(cx + R * .05, cy + R * .3, R * .26, sd + 3, 6, .22), C.cream, paperGrain, { dy: 2, blur: 3, alpha: .2 });
    if (B) paper(ctx, k, blobLayer(cx - R * .1, cy - R * .32, R * .3, sd + 4, 6, .22), C.light, paperGrain, { dy: 2, blur: 3, alpha: .2 });
    ctx.restore();
  }

  // ---- comet pose over time ----
  function cometPose(f, cut) {
    const bob = [0, -4, 2][cut], wob = [0, 1.6, -1.2][cut];
    f -= O;
    if (f < 34) return null;
    if (f < 40) return { x: P2[0], y: P2[1], s: [1.18, 1.18, .94, .94, 1.03, 1.03][f - 34], r: 0 };
    if (f < 44) return { x: P2[0], y: P2[1] + bob, s: 1, r: wob };
    if (f < 66) { const u = ease(held(f, 44, 64)); return { x: lerp(P2[0], P3[0], u), y: lerp(P2[1], P3[1], u) + bob, s: 1, r: wob }; }
    if (f < 80) { const u = Math.pow(held(f, 66, 78), 2.1); return { x: lerp(P3[0], EXIT[0], u), y: lerp(P3[1], EXIT[1], u) + bob * (1 - u), s: lerp(1, .55, u), r: wob + 8 * u }; }
    return null;
  }

  // ---- speed dashes streaming back off the head ----
  function drawDashes(ctx, k, f, pose) {
    const c = Math.floor(f / 2), a = TAIL.dir + pose.r * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const rot = pose.r * Math.PI / 180, cs = Math.cos(rot), sn = Math.sin(rot);
    const H0 = HEAD; const hx = pose.x + (H0[0] * cs - H0[1] * sn) * pose.s, hy = pose.y + (H0[0] * sn + H0[1] * cs) * pose.s;
    const cols = [C.cream, C.pink, C.orange, C.cream, C.light, C.pink];
    for (let i = 0; i < 6; i++) { const s = ((i * 41 + c * 34) % 210) + 40; if (s > 230) continue;
      const off = [-34, -12, 10, 30, -22, 20][i], len = [52, 34, 44, 28, 40, 30][i] * (s > 170 ? .5 : 1);
      const x = hx + ux * s * pose.s + nx * off * pose.s, y = hy + uy * s * pose.s + ny * off * pose.s;
      paper(ctx, k, capsule(x, y, len * pose.s, 10 * pose.s, a), cols[i], paperGrain, { dy: 3, blur: 3, alpha: .25 }); }
  }

  // ---- the comet sticker itself, sliced across its head→tail axis; each slice shifts on a travelling wave ----
  function drawCometWaving(ctx, f, pose) {
    const img = images['drippy-comet'];
    const ax = BODY.tail[0] - STAR.at[0], ay = BODY.tail[1] - STAR.at[1], th = Math.atan2(ay, ax), L = Math.hypot(ax, ay);
    const hx = STAR.at[0] * Math.cos(th) + STAR.at[1] * Math.sin(th); // star position along the axis
    const g = f - O, amp = g < 38 ? 0 : (g >= 66 ? 12 + 6 * held(g, 66, 78) : 5 + 7 * held(g, 38, 46)), phase = Math.floor(f / 2) * 1.9;
    ctx.save(); ctx.translate(pose.x, pose.y); ctx.rotate(pose.r * Math.PI / 180); ctx.scale(pose.s, pose.s); ctx.rotate(th);
    const R = 200, step = 3;
    for (let x = -R; x < R; x += step) {
      const u = clamp01((x - hx) / L), dy = amp * Math.pow(u, 1.3) * Math.sin((x - hx) / 18 - phase);
      ctx.save(); ctx.beginPath(); ctx.rect(x, -R, step + .7, R * 2); ctx.clip();
      ctx.translate(0, dy); ctx.rotate(-th); ctx.drawImage(img, -COMET.center[0], -COMET.center[1], COMET.size, COMET.size); ctx.restore();
    }
    ctx.restore();
  }

  function burst(ctx, k, f, f0, x, y, R, n, seed) {
    const r = f - f0; if (r < 0 || r > 13) return; const st = Math.floor(r / 2), rnd = rng(seed);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rnd() * .4, sp = .7 + rnd() * .6, sz = 7 + rnd() * 8, d = R * (.35 + st * .22) * sp;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .85 + st * st * 2, col = CONF[i % CONF.length];
      paper(ctx, k, i % 3 === 0 ? star6(px, py, sz * 1.3, sz * .6, st * .5 + i, rnd) : diamond(px, py, sz, st * .7 + i), col, paperGrain, { dy: 3, blur: 3 }); }
  }

  function draw(ctx, k, f, cut) {
    drawStickers(ctx, f, cut);
    if (f < 20) drawCard(ctx, f);
    drawNotes(ctx, f, cut);
    if (f >= 30 && f < 42) drawCrumple(ctx, k, f, cut);
    const pose = cometPose(f, cut);
    if (pose) {
      drawCometWaving(ctx, f, pose);
      if (f >= 42 + O) drawDashes(ctx, k, f, pose);
    }
    burst(ctx, k, f, 34 + O, P2[0], P2[1], 190, 10, 7);
    if (f >= 82 + O) { // "mom got it" slaps in, then the heart; both hold still to the end (no boil)
      const r = f - (82 + O), s1 = [1.45, 1.45, .88, .88, 1.06, 1.06][r] || 1;
      burst(ctx, k, f, 84 + O, MOM[0], MOM[1] - 60, 380, 16, 21);
      const hr = r - 4; if (hr >= 0) { const s2 = [1.3, 1.3, .9, .9, 1.04, 1.04][hr] || 1, [x, y, w, h] = HEART;
        ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s2, s2); ctx.drawImage(images['heart-big'], -w / 2, -h / 2, w, h); ctx.restore(); }
      drawLettering(ctx, k, { lines: ['mom got it'], x: MOM[0], y: MOM[1], tilt: -3, scale: s1 });
    }
  }

  return { id: 'share', title: 'Share · send to mom', frameCount: N, fps: FPS, phases: SHARE_PHASES, draw, sfx: createShareSfx() }; // sound: comet engine + "mom got it" only
}

export const SHARE_ASSETS = ['share-card', 'note-quarter', 'note-beamed', 'heart-big', 'drippy-comet', ...STICKERS.map(s => s[0])];
