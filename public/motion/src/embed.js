// Embed API — drop the paper-cut motion scenes into any page (e.g. the app flow).
//
//   import { createMotion } from './motion/src/embed.js';
//   const motion = await createMotion(document.querySelector('canvas'), { base: './motion/' });
//   motion.play('glowup', { loop: true });                  // Kid: success — "You did it!" glow-up
//   motion.play('share', { onDone: () => goToNextStep() }); // Kid: confirmation — song flies to mom
//   motion.stop();
//
// The canvas fills its parent and keeps the 1194 x 834 stage (iPad 11" landscape), letterboxed.
// `base` is the folder that holds src/, assets/ and fonts/. Reduced motion: each scene shows its first frame.
import { STAGE } from './glowup.js';
import { makePaperGrain } from './paint.js';
import { createBackground } from './background.js';
import { LETTERING_FONT } from './lettering.js';
import { createSuccess } from './scenes/success.js';
import { createShare, SHARE_ASSETS } from './scenes/share.js';

export async function createMotion(canvas, { base = './', background = true } = {}) {
  const { width: W, height: H } = STAGE;
  const ctx = canvas.getContext('2d');
  const font = new FontFace('Bagel Fat One', `url(${base}fonts/bagel-fat-one-latin-400-normal.woff2)`);
  document.fonts.add(await font.load());
  await document.fonts.load(`100px ${LETTERING_FONT}`);
  const images = Object.fromEntries(await Promise.all(SHARE_ASSETS.map(name => new Promise((ok, fail) => {
    const i = new Image(); i.onload = () => ok([name, i]); i.onerror = fail; i.src = `${base}assets/share/${name}.webp`; }))));
  const paperGrain = makePaperGrain(W, H), drawBackground = createBackground(W, H);
  const scenes = { glowup: createSuccess({ paperGrain }), share: createShare({ images, paperGrain }) };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let k = 1, run = null;
  const draw = (scene, f) => { ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, W, H); const cut = Math.floor(f / 2) % 3; if (background) drawBackground(ctx, cut); scene.draw(ctx, k, f, cut); };
  const fit = () => {
    const box = canvas.parentElement.getBoundingClientRect(), scale = Math.min(box.width / W, box.height / H), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.style.width = `${W * scale}px`; canvas.style.height = `${H * scale}px`;
    canvas.width = Math.round(W * scale * dpr); canvas.height = Math.round(H * scale * dpr); k = scale * dpr;
    if (run) draw(run.scene, run.frame);
  };
  const ro = new ResizeObserver(fit); ro.observe(canvas.parentElement); fit();

  function stop() { if (run) cancelAnimationFrame(run.raf); run = null; }
  function play(id, { loop = false, onDone, fps } = {}) {
    stop(); const scene = scenes[id]; if (!scene) throw new Error(`Unknown scene "${id}" (use ${Object.keys(scenes).join(', ')})`);
    const r = run = { scene, frame: 0, raf: 0, last: 0, acc: 0 }; const step = 1000 / (fps || scene.fps);
    draw(scene, 0);
    if (reduce) { onDone && setTimeout(onDone, 1500); return; }
    const tick = t => {
      if (run !== r) return;
      if (!r.last) r.last = t; r.acc += t - r.last; r.last = t;
      while (r.acc >= step) { r.acc -= step; r.frame++;
        if (r.frame >= scene.frameCount) { if (loop) r.frame = 0; else { r.frame = scene.frameCount - 1; draw(scene, r.frame); run = null; onDone && onDone(); return; } } }
      draw(scene, r.frame); r.raf = requestAnimationFrame(tick);
    };
    r.raf = requestAnimationFrame(tick);
  }
  function showFrame(id, f = 0) { stop(); draw(scenes[id], f); }
  return { play, stop, showFrame, scenes: Object.keys(scenes), destroy() { stop(); ro.disconnect(); } };
}
