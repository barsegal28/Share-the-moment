// Share the moment — the kid sends the song to mom.
// The light-blue song widget crumples like paper into the light-blue comet sticker, the sky clears,
// the comet flies (its own tail waves + speed dashes, like the reference) and zooms off, then "mom got it".
// Paper-cut / stop-motion rules (same as the glow-up): everything holds for 2 frames, cycles 3 cuts, no tweening.
import { drawLettering } from '../lettering.js';

const FPS = 17;
export const SHARE_PHASES = [
  { name: 'Ready', from: 0, to: 13 },
  { name: 'Crumple', from: 14, to: 33 },
  { name: 'Comet', from: 34, to: 43 },
  { name: 'Clear sky', from: 44, to: 65 },
  { name: 'Fly off', from: 66, to: 81 },
  { name: 'Mom got it', from: 82, to: 127 },
];
const N = 128;

// ---- assets (2x captures from Figma "share keyframes"; boxes are 1x render bounds on the 1194 x 834 stage) ----
const STICKERS = [ // name, box [x, y, w, h], peel order
  ['heart', [563.2, 503.5, 182, 182], 0],
  ['sparkle-top', [508.3, 3.1, 178, 178], 1],
  ['striped-planet', [66, 78, 297, 297], 2],
  ['sparkle-left', [-13, 271.3, 174, 174], 3],
  ['cloud-comet', [74, 433, 305, 305], 4],
  ['ringed-planet', [754, 106, 310, 302], 5],
  ['sparkle-right', [918, 293, 192.5, 192.5], 6],
  ['star', [788, 477, 313, 313], 7],
];
const WIDGET = { box: [314.5, 289.4, 567, 220.5], card: { cx: 598.5, cy: 394.5, w: 547, h: 201, r: 64 }, color: '#C3CAF7' };
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
function roundedRectOutline(w, h, r, n) { // perimeter samples, starting mid-left, clockwise (y down)
  const segs = []; const hw = w / 2, hh = h / 2;
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + i / 8 * Math.PI / 2; segs.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  segs.push([-hw, 0]); arc(-hw + r, -hh + r, Math.PI); arc(hw - r, -hh + r, -Math.PI / 2); arc(hw - r, hh - r, 0); arc(-hw + r, hh - r, Math.PI / 2); segs.push([-hw, 0]);
  const d = [0]; for (let i = 1; i < segs.length; i++) d.push(d[i - 1] + Math.hypot(segs[i][0] - segs[i - 1][0], segs[i][1] - segs[i - 1][1]));
  const L = d[d.length - 1], out = [];
  for (let k = 0; k < n; k++) { const s = L * k / n; let j = 1; while (d[j] < s) j++; const t = (s - d[j - 1]) / (d[j] - d[j - 1] || 1); out.push([lerp(segs[j - 1][0], segs[j][0], t), lerp(segs[j - 1][1], segs[j][1], t)]); }
  return out;
}
const CARD_OUTLINE = roundedRectOutline(WIDGET.card.w, WIDGET.card.h, WIDGET.card.r, COMET_OUTLINE.length);

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
      const start = 44 + order * 2, r = f - start;
      if (r >= 4) continue; // peeled off
      let o = { dx: bx, dy: by, rot: br, scale: 1 };
      if (r >= 0 && r < 2) o = { dx: bx, dy: by - 6, rot: br + 4, scale: 1.06 };
      if (r >= 2) o = { dx: bx + 6, dy: by + 34, rot: br + 13, scale: 0.97 };
      drawImg(ctx, name, box, o);
    }
  }

  // ---- widget: idle → tap → lift ----
  function drawWidget(ctx, f) {
    const s = f === 12 || f === 13 ? 0.97 : f === 14 || f === 15 ? 1.04 : 1;
    const [x, y, w, h] = WIDGET.box; const { cx, cy } = WIDGET.card;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.drawImage(images['song-widget'], x - cx, y - cy, w, h); ctx.restore();
  }

  // ---- the card's content flakes off (play button, title, bar) and falls ----
  function drawFlakes(ctx, k, f) {
    const r = f - 16; if (r < 0 || r >= 8) return;
    const st = Math.floor(r / 2); const fall = [0, 22, 58, 110][st], spin = [0, 8, 20, 38][st];
    const { cx, cy } = WIDGET.card; const rad = d => d * Math.PI / 180;
    const piece = (x, y, a, draw) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rad(a)); draw(); ctx.restore(); };
    // play button
    piece(cx - 182, cy + fall * 1.1, -spin, () => {
      const outer = new Path2D(); outer.arc(0, 0, 58, 0, Math.PI * 2); paper(ctx, k, outer, C.teal, paperGrain);
      const inner = new Path2D(); inner.arc(0, 0, 48, 0, Math.PI * 2); ctx.fillStyle = '#F2ECDD'; ctx.fill(inner);
      const tri = new Path2D(); tri.moveTo(-16, -24); tri.lineTo(28, 0); tri.lineTo(-16, 24); tri.closePath(); ctx.fillStyle = C.orange; ctx.fill(tri);
    });
    // title + subtitle strips, progress bar
    piece(cx + 30, cy - 50 + fall * .8, spin * .7, () => paper(ctx, k, capsule(0, 0, 150, 30, 0), C.teal, paperGrain));
    piece(cx + 115, cy - 6 + fall * 1.3, -spin * .5, () => paper(ctx, k, capsule(0, 0, 300, 18, 0), '#8F7A28', paperGrain));
    piece(cx + 120, cy + 45 + fall * .9, spin, () => { paper(ctx, k, capsule(0, 0, 316, 18, 0), '#F2ECDD', paperGrain); ctx.fillStyle = C.pink; ctx.fill(capsule(-89, 0, 138, 18, 0)); });
  }

  // ---- crumple: the blank card folds into the comet's silhouette in held steps ----
  function drawCrumple(ctx, k, f) {
    const steps = 9, s = Math.min(steps - 1, Math.floor((f - 16) / 2)), t = s / (steps - 1), e = ease(t);
    const rnd = rng(100 + s * 7), J = 2 + 15 * Math.sin(Math.PI * t), twist = Math.sin(Math.PI * t) * -14 * Math.PI / 180;
    const cx = lerp(WIDGET.card.cx, P2[0], e), cy = lerp(WIDGET.card.cy, P2[1], e);
    const shrink = lerp(1, 0.86, Math.sin(Math.PI * t)); // squeezes smaller mid-crumple, then opens into the comet
    const pts = CARD_OUTLINE.map((p, i) => { const q = COMET_OUTLINE[i]; let x = lerp(p[0], q[0], e) * shrink, y = lerp(p[1], q[1], e) * shrink;
      const a = Math.atan2(y, x), j = (rnd() - .5) * 2 * J; x += Math.cos(a) * j; y += Math.sin(a) * j;
      const c = Math.cos(twist), sn = Math.sin(twist); return [cx + x * c - y * sn, cy + x * sn + y * c]; });
    const path = smoothPath(pts);
    // late steps: it already wears the sticker's cream die-cut and orange kiss-cut
    if (t >= .75) { ctx.save(); ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowOffsetY = 9 * k; ctx.shadowBlur = 12 * k;
      ctx.strokeStyle = C.orange; ctx.lineWidth = t >= 1 ? 14 : 8; ctx.stroke(path); ctx.restore(); ctx.fillStyle = C.orange; ctx.fill(path);
      ctx.strokeStyle = C.cream; ctx.lineWidth = t >= 1 ? 6 : 3; ctx.stroke(path); }
    paper(ctx, k, path, mix(C.light, C.peri, clamp01((t - .3) / .6)), paperGrain, { dy: lerp(9, 6, t), blur: lerp(18, 8, t), alpha: .3 });
    // fold creases while it is crumpled
    if (t > .1 && t < 1) { ctx.save(); ctx.clip(path); const cr = rng(500 + s);
      for (let i = 0; i < 4; i++) { const a = pts[Math.floor(cr() * pts.length)], b = pts[Math.floor(cr() * pts.length)];
        ctx.strokeStyle = 'rgba(17,47,41,.16)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0] + 2, a[1] + 2); ctx.lineTo(b[0] + 2, b[1] + 2); ctx.stroke(); }
      ctx.restore(); }
  }

  // ---- comet pose over time ----
  function cometPose(f, cut) {
    const bob = [0, -4, 2][cut], wob = [0, 1.6, -1.2][cut];
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
    const amp = f < 38 ? 0 : (f >= 66 ? 12 + 6 * held(f, 66, 78) : 5 + 7 * held(f, 38, 46)), phase = Math.floor(f / 2) * 1.9;
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
    if (f < 16) drawWidget(ctx, f);
    else if (f < 34) { drawCrumple(ctx, k, f); drawFlakes(ctx, k, f); }
    const pose = cometPose(f, cut);
    if (pose) {
      drawCometWaving(ctx, f, pose);
      if (f >= 42) drawDashes(ctx, k, f, pose);
    }
    burst(ctx, k, f, 34, P2[0], P2[1], 190, 10, 7);
    if (f >= 82) {
      const s = [1.45, 1.45, .88, .88, 1.06, 1.06][f - 82] || 1, [dx, dy, dr] = [[0, 0, 0], [1.2, -1, -.7], [-1, 1, .6]][cut];
      burst(ctx, k, f, 84, 584.5, 339.2, 360, 16, 21);
      drawLettering(ctx, k, { lines: ['mom got it'], x: 584.5 + dx, y: 339.2 + dy, tilt: -3 + dr, scale: s });
    }
  }

  return { id: 'share', title: 'Share · send to mom', frameCount: N, fps: FPS, phases: SHARE_PHASES, draw };
}

export const SHARE_ASSETS = ['song-widget', 'drippy-comet', ...STICKERS.map(s => s[0])];
