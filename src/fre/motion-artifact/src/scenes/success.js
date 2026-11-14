// "You did it!" success screen — the planet glow-up under the headline.
import { buildFrames, FRAME_COUNT, PHASES } from '../glowup.js';
import { paintLayers } from '../paint.js';
import { drawHeadline } from '../headline.js';

export function createSuccess({ paperGrain }) {
  const frames = buildFrames();
  return {
    id: 'glowup', title: 'Success · glow-up', frameCount: FRAME_COUNT, fps: 17, phases: PHASES,
    draw(ctx, k, f, cut) { paintLayers(ctx, k, frames[f], paperGrain); drawHeadline(ctx, k, cut); },
  };
}
