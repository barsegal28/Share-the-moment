// The ink sheet: #112F29 with riso grain, the Figma specks and the top bar (from the Figma "background" component).
// Stop-motion boil: 3 cuts. Each cut shifts the grain and the specks a pixel or two.

const SHEET = '#112F29';
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

// Figma "background" component (updated 14 Nov): Base sheet + Confetti bits (specks, 50%) + learner (avatar, "Noa") + Reward progress.
// The specks and the top bar are 2x captures (assets/bg/). Specks boil with the grain; the top bar holds still.
export const BACKGROUND_ASSETS = ['specks', 'topbar'];
const SPECK_SHIFT = [[0, 0], [1, -1], [-1, 1]];

export function createBackground(W, H, images = {}) {
  const grain = makeSheetGrain(W + MARGIN * 2, H + MARGIN * 2);
  return function draw(ctx, cut, { topbar = true } = {}) {
    ctx.fillStyle = SHEET; ctx.fillRect(0, 0, W, H);
    const [gx, gy] = GRAIN_SHIFT[cut];
    ctx.drawImage(grain, -MARGIN + gx, -MARGIN + gy);
    if (images.specks) { const [sx, sy] = SPECK_SHIFT[cut]; ctx.drawImage(images.specks, sx, sy, W, H); }
    if (topbar && images.topbar) ctx.drawImage(images.topbar, 0, 0, W, H);
  };
}
