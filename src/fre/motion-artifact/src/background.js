// The ink sheet: #112F29 with riso grain and scattered specks (from the Figma "background" component).
// Stop-motion boil: 3 cuts. Each cut shifts the grain a couple of pixels and re-places the specks slightly.

const SHEET = '#112F29';
const SHAPES = { // speck outlines from Figma (local coords)
  o: 'M5.02 .98L5.87 2.48L5.74 4.11L4.63 5.41L3.13 5.74L1.5 5.48L.46 4.24L0 2.61L.72 .98L2.02 .07L3.91 0Z',
  l: 'M.65 6.91L18.91 3.2L18.26 0L0 3.91Z',
  g: 'M.65 6.85L18.91 2.87L18.26 0L0 3.78Z',
  b: 'M4.17 .52L5.41 1.57L6 2.93L5.61 4.57L4.37 5.8L2.54 5.87L1.17 5.22L0 3.91L.26 2.41L.98 .72L2.54 0Z',
  e: 'M5.93 3.2L5.22 4.76L4.04 5.8L2.35 5.67L.78 4.96L0 3.52L.33 1.83L1.43 .59L2.8 0L4.43 .52L5.61 1.7Z',
  f: 'M2.87 0L4.43 .65L5.48 1.76L5.87 3.33L5.35 4.83L4.04 5.93L2.28 5.74L1.04 5.02L0 3.65L.13 1.96L1.37 .85Z',
};
const COLOR = { o: '#FF9600', g: '#00A92A' }; // everything else is white
const ALPHA = 0.5;
// [x, y, shape, rotation°] — positions include the specks frame offset (-2, 39)
const SPECKS = [
  [1034, 49.2, 'o', 0], [809.1, 126.8, 'l', 0], [998.1, 133.8, 'b', 0], [591.3, 224, 'g', 0], [389, 256.8, 'e', 0], [268, 0, 'e', 0],
  [866, 312, 'e', 0], [0, 252, 'e', 0], [105, 55, 'e', 0], [614, 361.2, 'o', 0], [493, 104.3, 'o', 0], [1091, 416.3, 'o', 0],
  [225, 356.3, 'o', 0], [578.1, 445.8, 'b', 0], [40, 489.8, 'e', 0], [737.1, 503, 'b', 0], [710, 539.8, 'e', 0], [265, 594.2, 'o', 0],
  [935, 644.2, 'o', 0], [424, 651.3, 'o', 0], [40.1, 671.8, 'l', 0], [229.1, 678.8, 'b', 0], [414.6, 276.1, 'e', 14.9], [293.6, 19.3, 'e', 14.9],
  [891.6, 331.3, 'e', 14.9], [25.6, 271.3, 'e', 14.9], [130.6, 74.3, 'e', 14.9], [658.8, 319.2, 'o', 14.9], [537.8, 62.4, 'o', 14.9], [1135.8, 374.4, 'o', 14.9],
  [269.8, 314.4, 'o', 14.9], [645.9, 410.3, 'b', 14.9], [524.9, 153.5, 'b', 14.9], [1122.9, 465.5, 'b', 14.9], [256.9, 405.5, 'b', 14.9], [461.3, 452, 'l', 14.9],
  [537, 363.8, 'f', 0], [416, 107, 'f', 0], [1014, 419, 'f', 0], [148, 359, 'f', 0],
].map(([x, y, s, r]) => [x - 2, y + 39, s, r]);

const GRAIN_SHIFT = [[0, 0], [2, -1], [-1, 2]];
const MARGIN = 8;

function makeSheetGrain(w, h) {
  // Calibrated to the Figma sheet: mostly fine light speckle, a little dark.
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
  let s = 12345; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.length; i += 4) {
    const r = rnd();
    if (r < 0.32) { const u = rnd(); d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = 255 * 0.26 * u * u * u; }
    else if (r < 0.52) { d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = 255 * 0.1 * rnd(); }
  }
  g.putImageData(img, 0, 0); return c;
}

export function createBackground(W, H) {
  const grain = makeSheetGrain(W + MARGIN * 2, H + MARGIN * 2);
  const paths = Object.fromEntries(Object.entries(SHAPES).map(([k, d]) => [k, new Path2D(d)]));
  // per-cut speck placement: cut 0 is the Figma layout; cuts 1–2 jitter ±2px, ±8°, and dim about a quarter
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cuts = [0, 1, 2].map(c => SPECKS.map(([x, y, sh, r]) => c === 0 ? [x, y, sh, r, ALPHA]
    : [x + Math.round((rnd() - 0.5) * 4), y + Math.round((rnd() - 0.5) * 4), sh, r + (rnd() - 0.5) * 16, rnd() < 0.25 ? ALPHA * 0.55 : ALPHA]));
  return function draw(ctx, cut) {
    ctx.fillStyle = SHEET; ctx.fillRect(0, 0, W, H);
    const [gx, gy] = GRAIN_SHIFT[cut];
    ctx.drawImage(grain, -MARGIN + gx, -MARGIN + gy);
    for (const [x, y, sh, r, a] of cuts[cut]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(-r * Math.PI / 180); ctx.globalAlpha = a;
      ctx.fillStyle = COLOR[sh] || '#FFFFFF'; ctx.fill(paths[sh]); ctx.restore();
    }
  };
}
