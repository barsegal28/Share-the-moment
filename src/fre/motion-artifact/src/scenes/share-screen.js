// Share screen — the panel that invites the kid to share (Figma "share keyframes" 212:9870 and 212:12320).
// The song travels from the kid's small planet to mom's big planet, in paper-cut stop-motion:
// held 2-frame poses, a gentle boil on the traveller, a soft landing and a paper sparkle burst when it lands.
// The background (sheet, specks, stickers) holds still on this screen.
//   Option A ('share-screen-a'): the two music-note stickers travel.
//   Option B ('share-screen-b'): the song player ("Let it go · Played by you") travels.
// The kid's recording plays quietly underneath (see recording.js). Loops until the kid taps Share.
import { STICKERS } from './share.js';

const N = 68, FPS = 17;
export const SHARE_SCREEN_PHASES = [
  { name: 'At kid planet', from: 0, to: 11 },
  { name: 'Take-off', from: 12, to: 13 },
  { name: 'Travel', from: 14, to: 33 },
  { name: 'Land at mom', from: 34, to: 35 },
  { name: 'Heart', from: 36, to: 55 },
  { name: 'Back to kid', from: 56, to: 67 },
];
const CARD = [278, 102.5, 640, 680], DIM = 0.7;
const KID = [323.9, 376.5]; // kid planet top-left on screen; keyframes are measured from it
const at = (dx, dy) => [KID[0] + dx, KID[1] + dy];
// keyframe positions (top-left of the travelling object), from the three Figma keyframes per option
const OPTIONS = {
  a: { title: 'Share screen A · notes', parts: [
         { img: 'note-quarter', size: [99, 111.5], off: [0, 0] },
         { img: 'note-beamed', size: [108.2, 111.5], off: [85.4, -18] }],
       keys: [at(23.1, -77.7), at(132.1, 57.3), at(211.1, -195.1)] },
  b: { title: 'Share screen B · song', parts: [{ img: 'player', size: [322, 123], off: [0, 0] }],
       keys: [at(21.1, -96), at(106.1, -13), at(250.1, -203)] },
};
const COLORS = ['#FD6117', '#EC70BB', '#8BA1EF', '#EDE2C2', '#91781E'];

const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function curve([a, m, b], t) { // quadratic through the middle keyframe at t = .5
  const c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2], u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}
function paper(ctx, k, path, fill, grain) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowOffsetY = 3 * k; ctx.shadowBlur = 3 * k; ctx.fillStyle = fill; ctx.fill(path); ctx.restore();
  if (grain) { ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(grain, 0, 0); ctx.restore(); }
}
function star(x, y, R, a, rnd) { const p = new Path2D(); for (let i = 0; i < 8; i++) { const ang = a + i * Math.PI / 4 - Math.PI / 2, r = (i % 2 ? R * .42 : R) * (1 + (rnd() - .5) * .15); i ? p.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r) : p.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); } p.closePath(); return p; }
function dot(x, y, r, rnd) { const p = new Path2D(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, rr = r * (.8 + rnd() * .4); i ? p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } p.closePath(); return p; }

export function createShareScreen({ images, paperGrain, variant = 'a' }) {
  const opt = OPTIONS[variant], [K1, K2, K3] = opt.keys;
  const W = opt.parts.reduce((m, p) => Math.max(m, p.off[0] + p.size[0]), 0), H = opt.parts.reduce((m, p) => Math.max(m, p.size[1]), 0);

  // pose of the travelling object: top-left position, scale, tilt (deg), and per-part hop for "playing" notes
  function pose(f, cut) {
    const bob = [0, -1.5, 1][cut], tilt = [0, .5, -.4][cut]; // gentle boil
    if (f < 12) return { p: K1, s: 1, r: tilt, dy: bob, hop: Math.floor(f / 4) % 2 };
    if (f < 14) return { p: K1, s: .97, r: -2, dy: 2 };                                   // small anticipation
    if (f < 34) { const t = ease((Math.floor((f - 14) / 2) + 1) / 10);                    // 10 held steps along the arc
      const p = curve(opt.keys, t), q = curve(opt.keys, Math.max(0, t - .05)); // tilt follows the direction of travel
      return { p, s: 1, r: p[1] > q[1] ? 3 : -4, dy: 0, travel: t }; }
    if (f < 36) return { p: K3, s: 1.04, r: 1, dy: 1 };                                   // soft landing + sparkle burst
    if (f < 38) return { p: K3, s: 1.08, r: -2, dy: 0, heart: true };                     // after the burst it is a heart
    if (f < 56) return { p: K3, s: 1, r: tilt, dy: bob, heart: true };
    if (f < 60) return { p: [K3[0], K3[1] + (f < 58 ? 8 : 24)], s: f < 58 ? .75 : .4, r: 4, dy: 0, heart: true }; // tucked into mom's planet
    if (f < 64) return { p: K1, s: f < 62 ? .55 : 1.03, r: -1, dy: 0 };                    // pops back out of the kid's planet
    return { p: K1, s: 1, r: tilt, dy: bob };
  }

  const HEART = 180; // heart sticker box (the capture includes its shadow margin)
  function drawTraveller(ctx, q) {
    const cx = q.p[0] + W / 2, cy = q.p[1] + H / 2 + q.dy;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(q.r * Math.PI / 180); ctx.scale(q.s, q.s);
    if (q.heart) { ctx.drawImage(images['heart-big'], -HEART / 2, -HEART / 2, HEART, HEART); ctx.restore(); return; }
    opt.parts.forEach((part, i) => {
      const hop = variant === 'a' && q.hop !== undefined && q.hop === i ? -3 : 0;
      ctx.drawImage(images[part.img], part.off[0] - W / 2, part.off[1] - H / 2 + hop + (H - part.size[1]) / 2, part.size[0], part.size[1]);
    });
    ctx.restore();
  }

  function sparkle(ctx, k, f) {
    const r = f - 34; if (r < 0 || r > 9) return; const st = Math.floor(r / 2), rnd = rng(55);
    const cx = K3[0] + W / 2, cy = K3[1] + H * .7;
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + rnd() * .3, d = (40 + st * 26) * (.8 + rnd() * .4), s = 6 + rnd() * 6;
      paper(ctx, k, i % 2 ? star(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, s * 1.3, st, rnd) : dot(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, s * .7, rnd), COLORS[i % COLORS.length], paperGrain); }
  }

  function draw(ctx, k, f, cut) {
    STICKERS.forEach(([name, [x, y, w, h]]) => { // background stickers hold still here (less going on)
      ctx.save(); ctx.globalAlpha = name === 'star' ? 1 : DIM; ctx.drawImage(images[name], x, y, w, h); ctx.restore(); });
    const [x, y, w, h] = CARD; ctx.drawImage(images['share-card'], x, y, w, h); // panel with both planets and the Share button
    drawTraveller(ctx, pose(f, cut));
    sparkle(ctx, k, f);
  }

  return { id: 'share-screen-' + variant, title: opt.title, frameCount: N, fps: FPS, phases: SHARE_SCREEN_PHASES, recording: true, loops: true, stillBackground: true, draw };
}

export const SHARE_SCREEN_ASSETS = ['share-card', 'note-quarter', 'note-beamed', 'player', 'heart-big', ...STICKERS.map(s => s[0])];
