// Paper stop-motion sound for the share scene. Synthesised live (Web Audio), no files.
// Only two sounds, by design:
//   1. Comet engine (while the comet flies): a paper-fire rumble in space. Filtered noise whose level and tone jump
//      to a new value every 2 animation frames (held, like the drawings), plus dry paper crackles. It builds as the
//      comet zooms off, then cuts.
//   2. "mom got it": a paper slap (thump + papery snap + a few crackles), and a smaller paper pop for the heart.
// Call frame(f) once for every animation frame that plays; stop() when paused or leaving the scene.
// Browsers only allow audio after a tap, so the first frame() must follow a user gesture.

export function createShareSfx({ volume = 0.9 } = {}) {
  let ctx = null, out = null, noise = null, engine = null, rnd = mulberry(7);

  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function init() {
    if (ctx) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createDynamicsCompressor(); const g = ctx.createGain(); g.gain.value = volume; out.connect(g).connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noise.getChannelData(0);
    let b = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = .97 * b + .03 * w; d[i] = w * .55 + b * 2.2; } // grainy, a little brown
  }
  function src(loop = false) { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = loop; s.loopStart = rnd() * 1.5; return s; }

  // ---- 1. comet engine ----
  function engineOn() {
    if (engine) return;
    const s = src(true), bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.Q.value = .9; lp.type = 'lowpass'; lp.frequency.value = 2400; g.gain.value = 0;
    s.connect(bp).connect(lp).connect(g).connect(out); s.start();
    engine = { s, bp, g };
  }
  function engineOff(at = 0) {
    if (!engine) return; const { s, g } = engine, t = ctx.currentTime + at;
    g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .06); s.stop(t + .1); engine = null;
  }
  function crackle(t, level, hi = 2600) { // one dry paper tick
    const s = src(), f = ctx.createBiquadFilter(), g = ctx.createGain(), len = .012 + rnd() * .03;
    f.type = 'bandpass'; f.frequency.value = hi * (.7 + rnd() * .8); f.Q.value = 1.4;
    g.gain.setValueAtTime(level * (.5 + rnd() * .5), t); g.gain.exponentialRampToValueAtTime(.001, t + len);
    s.connect(f).connect(g).connect(out); s.start(t, rnd() * 1.8, len + .02);
  }
  function engineStep(f) { // a new held "cut" of the engine every 2 frames
    engineOn(); const t = ctx.currentTime;
    const zoom = f >= 74 ? Math.min(1, (f - 74) / 12) : 0;              // builds while zooming off
    const level = (f < 50 ? .1 + (f - 42) * .012 : .2) * (1 + zoom * 1.6) * (.65 + rnd() * .5);
    const tone = (240 + rnd() * 260) * (1 + zoom * 1.5);
    engine.g.gain.setValueAtTime(level, t); engine.bp.frequency.setValueAtTime(tone, t); // stepped, no glide
    const n = 1 + Math.floor(rnd() * (2 + zoom * 3));
    for (let i = 0; i < n; i++) crackle(t + rnd() * .11, .18 + zoom * .2);
  }

  // ---- 2. "mom got it" ----
  function slap(t, big = true) {
    const s = src(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), len = big ? .09 : .05; // papery snap
    lp.type = 'lowpass'; lp.frequency.value = big ? 2200 : 1500;
    g.gain.setValueAtTime(big ? .9 : .45, t); g.gain.exponentialRampToValueAtTime(.001, t + len);
    s.connect(lp).connect(g).connect(out); s.start(t, rnd(), len + .02);
    const o = ctx.createOscillator(), og = ctx.createGain(); // soft thump
    o.frequency.setValueAtTime(big ? 120 : 260, t); o.frequency.exponentialRampToValueAtTime(big ? 48 : 150, t + .14);
    og.gain.setValueAtTime(big ? .7 : .25, t); og.gain.exponentialRampToValueAtTime(.001, t + .18);
    o.connect(og).connect(out); o.start(t); o.stop(t + .2);
    for (let i = 0; i < (big ? 5 : 2); i++) crackle(t + .03 + i * (.035 + rnd() * .03), big ? .25 : .15, 3200); // paper settling
  }

  let last = -1;
  return {
    frame(f) {
      if (f === last) return; const prev = last; last = f; init();
      if (f < prev) engineOff();                                         // looped or jumped back
      if (f >= 42 && f < 88) { if (f % 2 === 0) engineStep(f); }
      else if (engine) engineOff(f >= 88 ? .02 : 0);                     // engine cuts as the comet leaves the screen
      if (f === 90) slap(ctx.currentTime);
      if (f === 94) slap(ctx.currentTime, false);
    },
    stop() { last = -1; if (ctx) engineOff(); },
  };
}
