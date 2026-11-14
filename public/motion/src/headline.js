// "YOU DID IT!" headline sticker — Bagel Fat One, pink kiss-cut, cream die-cut, orange lettering.
// Values from the Figma "Headline sticker". Stop-motion boil: 3 cuts (±1px, under 1°).
import { drawLettering } from './lettering.js';

const CENTER = { x: 563.1, y: 193.8 }, TILT = -3;
const CUTS = [[0, 0, 0], [1.2, -1, -0.7], [-1, 1, 0.6]]; // dx, dy, extra degrees

export function drawHeadline(ctx, k, cut) {
  const [dx, dy, dr] = CUTS[cut];
  drawLettering(ctx, k, { lines: ['YOU', 'DID IT!'], x: CENTER.x + dx, y: CENTER.y + dy, tilt: TILT + dr, kissCut: { color: '#EC70BB', width: 23.28 } });
}
