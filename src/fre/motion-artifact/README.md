# Share the Moment — paper-cut motion

Motion scenes for *Share the Moment*. Everything is paper-cut stop-motion: stickers with a die-cut border, torn paper effects, holds of 2 frames and 3 boil cuts.

- **Share · send to mom** (`#share`): the kid sends the song to mom. The light-blue song widget crumples like paper into the light-blue comet, and the other stickers peel off. The comet then flies across the sky with a wavy paper tail and speed dashes, zooms off, and "mom got it" slaps in.
- **Success · glow-up** (`#glowup`): the "You did it!" screen. The planet sticker glows, condenses into a star, and bursts into torn-paper light that fills the screen.

Everything is drawn live on a `<canvas>`. There are no image sequences, so it stays sharp at any size and weighs a few KB.

## Run

It uses plain ES modules with no build step. Serve the folder and open `index.html`:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

| File | What it does |
|---|---|
| `src/scenes/share.js` | Share scene (128 frames): widget → crumple → comet → clear sky → fly off → "mom got it". |
| `src/scenes/success.js` | Success scene: glow-up planet plus headline. |
| `src/lettering.js` | Bagel Fat One sticker lettering (cream die-cut, optional pink kiss-cut). |
| `assets/share/` | Stickers and the song widget, exported 2× from Figma ("share keyframes"). |
| `src/glowup.js` | Planet glow-up generator: 108 frames, each a list of paper pieces and stickers in stage px. Deterministic. |
| `src/paint.js` | Canvas painting for the two materials: torn paper (shadow + grain) and die-cut stickers (cream die-cut, coloured kiss-cut, shadow). |
| `src/background.js` | Ink sheet `#112F29` with grain and specks, plus a 3-cut boil. |
| `src/headline.js` | "YOU DID IT!" sticker in Bagel Fat One, plus a 3-cut boil. |
| `src/app.js` | Scene switcher, stage fit (1194 × 834, the iPad 11" landscape size), 17 fps loop, dev controls. |
| `fonts/` | Bagel Fat One (SIL OFL), bundled so the app works offline. |

## Motion

- **Timing:** 108 frames at 17 fps, about 6.4 s per loop.
- **Phases:** Idle (0–35) → Glow-up (36–53) → Condense (54–65) → Burst (66–83) → Reborn (84–107).
- **Boil:** every layer re-cuts every 2 frames, cycling through 3 cuts. Never tween between frames.
- **Reduced motion:** if the device asks for reduced motion, the screen shows frame 0 and does not play.

The full spec is in `paper-cut/motion/glow-up.md`, in the "Simply home assignment" project.

## Dev controls

- **Space:** play or pause.
- **← / →:** step one frame.
- **Slider and phase buttons:** jump to a frame or phase.
- **Speed:** 17, 12 or 8 fps.

## Embed in the app flow

```js
import { createMotion } from './motion/src/embed.js';
const motion = await createMotion(canvas, { base: './motion/' });     // folder holding src/, assets/, fonts/
motion.play('glowup', { loop: true });                                // Kid: success screen
motion.play('share', { onDone: () => next() });                       // Kid: confirmation — the song flies to mom
```

`play(id, { loop, onDone, fps })`, `stop()`, `showFrame(id, frame)` and `destroy()` are all available. Pass `background: false` to draw only the scene over your own sheet. With reduced motion, each scene shows its first frame and `onDone` still fires.
