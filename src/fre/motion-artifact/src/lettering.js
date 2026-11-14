// Sticker lettering in Bagel Fat One: optional pink kiss-cut (with shadow), cream die-cut, orange letters.

export const LETTERING_FONT = '"Bagel Fat One"';

export function drawLettering(ctx, k, { lines, x, y, size = 102.74, tilt = -3, scale = 1, kissCut = null, dieCut = 17.66 }) {
  const line = size * 0.98;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(tilt * Math.PI / 180); ctx.scale(scale, scale);
  ctx.font = `${size}px ${LETTERING_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const ys = lines.map((_, i) => (i - (lines.length - 1) / 2) * line + 4);
  const each = fn => lines.forEach((t, i) => fn(t, 0, ys[i]));
  if (kissCut) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowOffsetY = 5.62 * k * scale; ctx.shadowBlur = 8 * k * scale;
    ctx.strokeStyle = kissCut.color; ctx.lineWidth = kissCut.width * 2; each((t, a, b) => ctx.strokeText(t, a, b));
    ctx.restore();
    ctx.fillStyle = kissCut.color; each((t, a, b) => ctx.fillText(t, a, b));
  }
  ctx.strokeStyle = '#EDE2C2'; ctx.lineWidth = dieCut * 2; each((t, a, b) => ctx.strokeText(t, a, b));
  ctx.fillStyle = '#FD6117'; each((t, a, b) => ctx.fillText(t, a, b));
  ctx.restore();
}
