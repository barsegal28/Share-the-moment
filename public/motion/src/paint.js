// Canvas painting for the paper-cut language: torn paper pieces and die-cut stickers.
// All geometry is in stage pixels (1194 x 834). `k` = device pixels per stage pixel,
// needed because canvas shadows ignore the current transform.

const CREAM = '#EDE2C2';
// Sticker border, matched to the Figma stickers (die-cut 9, kiss-cut 12.5, × 1.674 instance scale).
export const STICKER = { dieCut: 9 * 1.674, kissCut: 12.5 * 1.674, shadow: { dy: 7 * 1.674, blur: 10 * 1.674, alpha: 0.3 } };

// Paper grain: a grey multiply texture (spec: slope .22 / intercept .82 → values ~0.82–1).
export function makePaperGrain(w, h, seed = 4) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
  let s = seed * 9973 + 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.length; i += 4) {
    const v = 255 * (1 - 0.18 * (rnd() * 0.65 + rnd() * 0.35));
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}

const pathCache = new Map();
const P = d => { let p = pathCache.get(d); if (!p) { p = new Path2D(d); pathCache.set(d, p); } return p; };

function withShadow(ctx, k, dy, blur, alpha, draw) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = dy * k; ctx.shadowBlur = blur * k;
  draw(); ctx.restore();
}

export function paintPaper(ctx, k, [, fill, d, dy, blur], grain) {
  const p = P(d);
  withShadow(ctx, k, dy, blur, 0.28, () => { ctx.fillStyle = fill; ctx.fill(p); });
  if (grain) { ctx.save(); ctx.clip(p); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(grain, 0, 0); ctx.restore(); }
}

export function paintSticker(ctx, k, [, edge, sil, art]) {
  const s = new Path2D(); for (const d of sil) s.addPath(P(d));
  ctx.lineJoin = 'round';
  // kiss-cut edge (with the sticker's drop shadow), then the cream die-cut border, then the art
  withShadow(ctx, k, STICKER.shadow.dy, STICKER.shadow.blur, STICKER.shadow.alpha, () => { ctx.strokeStyle = edge; ctx.lineWidth = STICKER.kissCut * 2; ctx.stroke(s); });
  ctx.fillStyle = edge; ctx.fill(s);
  ctx.strokeStyle = CREAM; ctx.lineWidth = STICKER.dieCut * 2; ctx.stroke(s); ctx.fillStyle = CREAM; ctx.fill(s);
  for (const a of art) {
    if (a[0] === 'f') { ctx.fillStyle = a[1]; ctx.fill(P(a[2]), a[3] === 'EVENODD' ? 'evenodd' : 'nonzero'); }
    else if (a[0] === 'l') { ctx.strokeStyle = a[1]; ctx.lineWidth = a[3]; ctx.lineCap = 'round'; ctx.stroke(P(a[2])); }
  }
}

export function paintLayers(ctx, k, layers, grain) {
  for (const L of layers) L[0] === 'p' ? paintPaper(ctx, k, L, grain) : paintSticker(ctx, k, L);
}
