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
    drawStickers(ctx, images, 'back');                                                  // background stickers hold still here
    const [x, y, w, h] = CARD; ctx.drawImage(images['share-card'], x, y, w, h); // panel with both planets and the Share button
    drawStickers(ctx, images, 'front');
    drawTraveller(ctx, pose(f, cut));
    sparkle(ctx, k, f);
  }

  return { id: 'share-screen-' + variant, title: opt.title, frameCount: N, fps: FPS, phases: SHARE_SCREEN_PHASES, recording: true, loops: true, stillBackground: true, draw };
}

// the screen's stickers: all behind the card at 70%, except the gold star, which sits above the card layer (Figma 88:6449)
function drawStickers(ctx, images, which) {
  STICKERS.forEach(([name, [x, y, w, h]]) => { if ((name === 'star') !== (which === 'front')) return;
    ctx.save(); ctx.globalAlpha = name === 'star' ? 1 : DIM; ctx.drawImage(images[name], x, y, w, h); ctx.restore(); });
}
export const SHARE_SCREEN_ASSETS = ['share-card', 'share-card-blank', 'mom-planet', 'kid-planet', 'mom-avatar', 'kid-avatar', 'note-quarter', 'note-beamed', 'player', 'heart-big', ...STICKERS.map(s => s[0])];

// ---- Option C (Figma 212:12320, updated 14 Nov): planets side by side low in the panel; the song player
// rises from beside the kid's planet to above mom's planet. There it explodes like the glow-up, in paper layers:
// the text peels off first, then the note travels on to the heart's spot, glows in torn-paper halos, turns into
// a light paper blob, and that blob explodes into a paper-light disc with confetti — and the heart sticker pops out. ----
const C_N = 84;
const C_PHASES = [
  { name: 'At kid planet', from: 0, to: 11 },
  { name: 'Take-off', from: 12, to: 13 },
  { name: 'Climb', from: 14, to: 25 },
  { name: 'Descend', from: 26, to: 35 },
  { name: 'Land + text peels', from: 36, to: 41 },
  { name: 'Note glows', from: 42, to: 47 },
  { name: 'Burst → heart', from: 48, to: 55 },
  { name: 'Heart', from: 56, to: 75 },
  { name: 'Back to kid', from: 76, to: 83 },
];
// positions from the share panel component (Figma 187:3554) as it sits on the screen
const C_MOM = [548, 284.5, 288.4, 270], C_KID = [444.9, 393.5, 158.1, 148];
const C_K1 = [315, 320.5], C_K2 = [456, 118], C_PW = 322, C_PH = 123; // C_K2 = peak of the jump, from the hand-drawn trail: halfway across, up at the panel's top edge // player top-left at keyframes 1 and 2
const C_NOTE_W = 122;                                                      // the note part of the player (left); the rest is text
const C_HEART = [549, 172.5, 218, 218];                                    // heart at keyframe 3
const LIGHT = '#FFF4D6', PINK = '#EC70BB', PERI = '#8BA1EF';

function smooth(pts) { const n = pts.length, p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) { const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n], d = pts[(i + 2) % n];
    p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]); }
  p.closePath(); return p; }
function torn(cx, cy, rx, ry, seed, jit = .07, n = 11) { const r = rng(seed); const a0 = r() * 6.28;
  return smooth(Array.from({ length: n }, (_, i) => { const a = a0 + (i + (r() - .5) * jit * 2) / n * 6.2832, k = 1 + (r() - .5) * 2 * jit; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; })); }
function tornStar(cx, cy, R, ri, rot, seed) { const r = rng(seed), p = new Path2D();
  for (let i = 0; i < 12; i++) { const a = rot + i * Math.PI / 6 - Math.PI / 2, rr = (i % 2 ? ri : R) * (1 + (r() - .5) * .1); i ? p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : p.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  p.closePath(); return p; }
function diamond(cx, cy, r, a) { const p = new Path2D(); [[0, -r], [r * .62, 0], [0, r], [-r * .62, 0]].forEach(([u, v], i) => { const x = cx + u * Math.cos(a) - v * Math.sin(a), y = cy + u * Math.sin(a) + v * Math.cos(a); i ? p.lineTo(x, y) : p.moveTo(x, y); }); p.closePath(); return p; }

// Option D (Figma 228:16325): the same motion with the avatar characters instead of the planets —
// the kid's small avatar and mom's big avatar, each on a periwinkle circle (tilted −6° / +6° in Figma).
const LAYOUTS = {
  c: { id: 'share-screen-c', title: 'Share screen C · planets', mom: ['mom-planet', C_MOM], kid: ['kid-planet', C_KID], k1: C_K1, peak: C_K2, heart: C_HEART },
  d: { id: 'share-screen-d', title: 'Share screen D · avatars', mom: ['mom-avatar', [503.6, 298.2, 283.1, 283.1]], kid: ['kid-avatar', [409.3, 388.5, 160, 162.3]],
       k1: [303, 299.5], peak: [443.5, 118], heart: [536, 209, 218, 218] }, // heart centred on the top edge of mom's circle
};

// animationOnly: draw just the motion (the travelling song, the explosion, the heart) on a transparent canvas, to lay over
// the flow's own share screen. characters: also draw the wiggling characters (then hide the screen's own static ones).
export function createShareScreenC({ images, paperGrain, layout = 'c', animationOnly = false, characters = true }) {
  const L = LAYOUTS[layout], C_K1 = L.k1, C_K2 = L.peak, C_HEART = L.heart;
  const mid = [(C_K1[0] + C_K2[0]) / 2 - 30, (C_K1[1] + C_K2[1]) / 2 - 30];
  const NOTE_C = [C_K2[0] + 61, C_K2[1] + 62];                                 // note centre at keyframe 2
  const HC = [C_HEART[0] + C_HEART[2] / 2, C_HEART[1] + C_HEART[3] / 2];       // heart centre
  const hold = (f, a) => a[Math.min(a.length - 1, Math.max(0, Math.floor(f / 2)))]; // value per 2-frame hold

  function img(ctx, name, [x, y, w, h], s = 1, r = 0, dy = 0) {
    ctx.save(); ctx.translate(x + w / 2, y + h / 2 + dy); ctx.rotate(r * Math.PI / 180); ctx.scale(s, s); ctx.drawImage(images[name], -w / 2, -h / 2, w, h); ctx.restore();
  }
  // the player image, either part: 'note' (left) or 'text' (right), with its own offset/turn
  function playerPart(ctx, part, p, { s = 1, r = 0, dx = 0, dy = 0 } = {}) {
    const cx = p[0] + (part === 'note' ? C_NOTE_W / 2 : (C_NOTE_W + C_PW) / 2), cy = p[1] + C_PH / 2;
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(r * Math.PI / 180); ctx.scale(s, s); ctx.translate(-cx, -cy);
    ctx.beginPath(); part === 'note' ? ctx.rect(p[0] - 20, p[1] - 20, C_NOTE_W + 20, C_PH + 40) : ctx.rect(p[0] + C_NOTE_W, p[1] - 20, C_PW, C_PH + 40); ctx.clip();
    ctx.drawImage(images.player, p[0], p[1], C_PW, C_PH); ctx.restore();
  }
  const FINAL = [HC[0] - 61, HC[1] - 62]; // player top-left that puts the note's centre on the heart's centre
  // one smooth jump, in held 2-frame steps: a ballistic arc up to the peak and straight back down onto the heart's spot (no stop at the top)
  const lerp2 = (a, b, x, y) => [a[0] + (b[0] - a[0]) * x, a[1] + (b[1] - a[1]) * y];
  function travellerPos(f) {
    if (f < 14 || f >= 76) return C_K1;
    if (f < 26) { const t = (Math.floor((f - 14) / 2) + 1) / 6; return lerp2(C_K1, C_K2, t, 1 - (1 - t) * (1 - t)); } // rises, slowing into the peak
    if (f < 36) { const t = (Math.floor((f - 26) / 2) + 1) / 5; return lerp2(C_K2, FINAL, t, t * t); }               // and falls straight away, speeding up
    return FINAL;
  }
  // the tilt turns over with the arc, one small step per hold: nose-up on the way up, level at the top, nose-down on the way down
  function travellerTilt(f) { const i = Math.floor((f - 14) / 2); return [-4, -3.5, -3, -2, -1, 0, 1, 1.5, 2, 2.5, 3][Math.max(0, Math.min(10, i))]; }

  function draw(ctx, k, f, cut) {
    if (!animationOnly) { drawStickers(ctx, images, 'back'); const [x, y, w, h] = CARD; ctx.drawImage(images['share-card-blank'], x, y, w, h); drawStickers(ctx, images, 'front'); }
    // planet characters wiggle softly: a 4-pose sway, each held 4 frames, the two planets out of step
    const SWAY = [[0, 0], [1.6, -1], [0, -1.5], [-1.6, -1]];
    const [mr, mdy] = SWAY[Math.floor(f / 4) % 4], [kr, kdy] = SWAY[(Math.floor(f / 4) + 2) % 4];
    if (!animationOnly || characters) { img(ctx, L.mom[0], L.mom[1], 1, mr, mdy); img(ctx, L.kid[0], L.kid[1], 1, kr * 1.3, kdy); }
    const bob = [0, -1.5, 1][cut], tilt = [0, .5, -.4][cut], sd = 100 + cut * 17; // boil seed
    const p = travellerPos(f);

    // 1. resting / travelling: the whole player
    if (f < 36 || f >= 76) {
      let s = 1, r = tilt, dy = bob;
      if (f >= 12 && f < 14) { s = .97; r = -2; dy = 2; }
      if (f >= 14 && f < 36) { r = travellerTilt(f); dy = 0; }
      if (f >= 76 && f < 80) { s = f < 78 ? .55 : 1.03; r = -1; dy = 0; }
      playerPart(ctx, 'note', p, { s, r, dy }); playerPart(ctx, 'text', p, { s, r, dy });
      return;
    }
    // 2. at the heart's spot: the text peels off (lift → drop → gone), the note stays
    const noteAt = c => [c[0] - 61, c[1] - 62];
    if (f < 42) {
      if (f < 38) { // landing squash, note and text together
        playerPart(ctx, 'note', p, { s: .96, dy: 3 });
        if (f < 38) playerPart(ctx, 'text', p, { s: .96, dy: 3 });
        return;
      }
      playerPart(ctx, 'note', p, { r: tilt, dy: bob });
      if (f < 40) playerPart(ctx, 'text', p, { dy: -8, r: 4, s: 1.03 });        // text lifts…
      else playerPart(ctx, 'text', p, { dy: 34, dx: 10, r: 14, s: .96 });      // …drops, then it's gone at 42
      return;
    }
    // 4. at the heart's spot: torn-paper halos grow behind the note, it shakes, then becomes a light paper blob
    if (f < 48) {
      const st = Math.floor((f - 42) / 2), R = [52, 66, 80][st];
      paper(ctx, k, torn(HC[0], HC[1], R * 1.3, R * 1.2, sd + 1), PERI, paperGrain);
      paper(ctx, k, torn(HC[0], HC[1], R, R * .92, sd + 2), PINK, paperGrain);
      if (st < 2) playerPart(ctx, 'note', noteAt(HC), { r: [3, -4][st], s: [1.04, 1.08][st] });
      else paper(ctx, k, torn(HC[0], HC[1], 50, 54, sd + 3, .1), LIGHT, paperGrain);
      return;
    }
    // 5. burst: the light blob explodes — a paper-light disc pops open with two halo rings, confetti flies out, the heart pops out on top
    const b = f - 48;
    const disc = hold(b, [62, 88, 104, 108, 100, 84, 62, 38, 16, 0]); // starts from the blob's size and opens out
    if (disc > 0) {
      paper(ctx, k, torn(HC[0], HC[1], disc * 1.22, disc * 1.12, sd + 8), PERI, paperGrain);
      paper(ctx, k, torn(HC[0], HC[1], disc * 1.1, disc, sd + 9), PINK, paperGrain);
      paper(ctx, k, torn(HC[0], HC[1], disc, disc * .92, sd + 10, .1), LIGHT, paperGrain);
    }
    if (b < 12) { const st = Math.floor(b / 2), cr = rng(4242 + cut);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + cr() * .35, d = 90 + st * 34 + cr() * 30, sz = 7 + cr() * 7, cx = HC[0] + Math.cos(a) * d, cy = HC[1] + Math.sin(a) * d * .85 + st * st * 1.5;
        paper(ctx, k, i % 3 === 0 ? tornStar(cx, cy, sz * 1.3, sz * .55, a + f * .3, sd + 20 + i) : diamond(cx, cy, sz, a + f * .4), COLORS[i % COLORS.length], paperGrain); } }
    if (f >= 50 && f < 76) { // the heart, then it tucks into mom's planet
      let s = hold(f - 50, [1.22, .94, 1.04]), r = f < 56 ? -2 : tilt, dy = f < 56 ? 0 : bob;
      if (f >= 72) { s = f < 74 ? .75 : .4; r = 4; dy = f < 74 ? 30 : 70; }
      img(ctx, 'heart-big', C_HEART, f >= 56 && f < 72 ? 1 : s, r, dy);
    }
  }
  return { id: L.id, title: L.title, frameCount: C_N, fps: FPS, phases: C_PHASES, recording: true, loops: true, stillBackground: true, draw };
}
