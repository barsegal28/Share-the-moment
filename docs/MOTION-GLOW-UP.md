# Motion: Glow-up (sticker + paper)

A celebration loop for a sticker character: it idles, glows, shrinks into a star, bursts into light and comes back. The **character stays a sticker**. The **light effects are torn paper**. Everything moves like stop-motion.

- **Definition (source of truth):** `src/motion/glowUp.ts`: `GLOW_UP` holds the timing and rules, and `glowUpFrame()` draws any frame.
- **Component:** `<GlowUp character size fps playing loop frame onComplete />` in `src/components/motion/GlowUp.tsx`.
- **Storybook:** Motion / Glow-up (playground, both characters, phases, frame by frame, other sheets).
- **Design canvas:** "Sticker · planet glow-up" board on the Sticker page.
- Characters done: striped planet, ringed planet. The rules below apply to any sticker character.

## Timing

- **108 frames.** 17 fps on the board (about 6.4 s); 12 fps gives 9 s. Loops.
- Frames are drawn in a 460 × 460 box and delivered at 300 × 300 (600 × 600 for retina).
- **Stop-motion boil:** every edge is re-cut every 2 frames, cycling through 3 cuts. Holds and boil are what make it feel hand-made, so never tween between frames.
- **Reduced motion:** show frame 0 only.

## Phases

| Frames | Phase | What happens |
|---|---|---|
| 0–35 | **A · Idle** | Gentle bob (`0,-2,-5,-7,-7,-5,-2,0,2,3,3,2` px, repeating every 12 frames). Face changes every 6 frames: base → content → look → look → surprised → blink. Blink on every 12th frame. |
| 36–53 | **B · Glow-up** | Face goes surprised → calm → none. Details peel off (stripes one every 2 frames; ring and star fall away). Fill fades from the character colour to light `#FFF4D6`. Two torn-paper halos grow behind it. |
| 54–65 | **C · Condense** | The light shrinks in steps (radius 150, 110, 78, 54, 36, 24, 16, 11), then becomes a small spinning paper star in a halo. |
| 66–83 | **D · Burst** | A paper light disc pops open (radius 26 → 206, then settles to 190) with two halo rings. A star in the character's colour spins, grows to 76 and closes. 12 paper confetti pieces (stars and diamonds) fly out. |
| 84–107 | **E · Reborn** | Starts 12% big and settles to full size. Light fades back to the character colour. Face calm → base. Details stick back on one by one. Halo fades out. |

### Ringed planet extras
- **Ring:** on until 30% of B, falls (26 px down, 7° turn), then off. It lands back (22 px up, −5°) at 62–70% of E.
- **Star sticker:** falls first (at 18–30% of B, 30 px down) and lands last (at 74–80% of E).

## Two materials

| | Sticker layer (the character) | Paper layer (the effects) |
|---|---|---|
| Used for | Planet, stripes, ring, star sticker, face | Halos, condensing light, burst disc, star hole, confetti |
| Edge | Smooth vector shape with very subtle boil | Torn, freehand edge with stronger boil |
| Border | 9 px cream `#EDE2C2` die-cut and a 3.5 px coloured kiss-cut edge | None |
| Shadow | 7 px down, 5 px blur, 38% black | 5 px down, 2.5 px blur, 28% black |
| Grain | **None.** Stickers stay clean. | Paper grain on every piece |
| Scale | Drawn at 80% of the box so the border and halos fit | Same |

The background is the ink sheet `#112F29` with riso grain on the sheet only.

## Colours per character

| Character | Fill | Details | Kiss-cut edge | Halo (inner / outer) | Light |
|---|---|---|---|---|---|
| Striped planet | orange `#FD6117` | periwinkle stripes | pink | periwinkle / pink | `#FFF4D6` |
| Ringed planet | teal `#0B7563` | pink ring, gold star sticker (orange edge) | periwinkle | pink / periwinkle | `#FFF4D6` |

Confetti uses orange, pink, periwinkle, teal and gold.

## Faces
These are sticker faces: ink dot eyes with a cream highlight, pink blush and an ink line smile.
- **Ringed planet:** uses the face from Figma (12 Nov), with small eyes set wide apart.
- **content:** eyes become arcs (^ ^).
- **surprised:** bigger eyes and a small "o" mouth.
- **blink:** eyes become lines.
- **calm:** eyes become closed arcs and the smile gets smaller. It's drawn in ink so it reads on the light fill.

## Delivery
- **In the app:** `<GlowUp>` draws every frame once as SVG when it mounts, then steps through them at `fps` with requestAnimationFrame. The sticker border stays 9 px at any `size`. With reduced motion it holds frame 0.
- **Outside the app:** render each frame to PNG at 600 px and pack them as a 12 × 9 sprite. Play it with `background-position` keyframes and `step-end` timing, one keyframe per frame, over `108 / fps` seconds.

## Adding a character
Add an entry to `GLOW_UP_CHARACTERS` (fill, detail, kiss-cut edge, glow pair) and its body and face drawing in `glowUpFrame()`. The timeline, materials and burst stay the same.
