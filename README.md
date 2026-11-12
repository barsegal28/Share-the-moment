# Share the Moment

When a kid earns 3 stars on a song, they can send the recording to their family with one tap, and a parent can send a surprise back.
Product design home assignment for Simply: a playable prototype of the kid flow (iPad, landscape) and the parent flow (phone web), a component library in Storybook, and one showcase page that ties it all together.

| | |
|---|---|
| **Showcase** | `/` — both flows embedded live, process, links, notes |
| **Kid flow** | `/#/kid?variant=first` — full screen |
| **Parent flow** | `/#/parent?channel=sms&first=1` — full screen |
| **Storybook** | `/storybook/` |

## Run it

```bash
npm install
npm run dev            # app + showcase at http://localhost:5173
npm run storybook      # Storybook at http://localhost:6006
npm run build:all      # app → dist/, Storybook → dist/storybook/
```

Sound is part of the design (voice-over, tap sounds, the recording), so turn it on. Browsers only allow sound after a tap, which is why each flow starts with a **Start** button.

## Publish (GitHub Pages)

1. Create an empty repo on GitHub and push this folder to `main`.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds everything and publishes it to `https://<user>.github.io/<repo>/`.
4. Put the repo URL and your Figma link in `src/config.ts` (the Figma file is embedded automatically) and push again.

All paths are relative, so it works under any repo name.

## Prototype URLs

Kid flow: `#/kid?variant=…&replies=…&autostart=1`

| `variant` | State |
|---|---|
| `first` | First share ever: full onboarding moment |
| `early` | Shares 2–5: shorter line, no coaching |
| `habitual` | ~5+ shares: compact, inline with the stars |
| `better` | Already shared, played it better |
| `struggle` | 3 stars after many tries |
| `quiet` | Skipped 3 times: quiet button, no voice |
| `noContact` | No family set up: "Ask a grown-up" gate and Ready to send shelf |

`replies=3` shows the reply queue ("3 surprises!").

Parent flow: `#/parent?channel=sms|email&first=1`

## Design system

- **Base:** [shadcn/ui](https://ui.shadcn.com) (new-york, Tailwind v4) in `src/components/ui`. `components.json` is set up, so `npx shadcn@latest add <component>` adds more.
- **Language:** Sticker (die-cut vinyl on the ink sheet). Tokens live in `src/index.css`: the raw palette (`--sticker-*`) and the shadcn semantic tokens mapped onto it. See `docs/STICKER-LANGUAGE.md`.
- **Kid extensions:** `Button` gets a `sticker` variant with `tone`, and `kid` / `kid-lg` / `kid-icon` sizes (80px+ targets). The `sticker` utility die-cuts any box: cream border, kiss-cut edge, lift.
- **Art:** `src/art/stickers.tsx` holds original flat SVG art; `<StickerArt>` generates the die-cut from each silhouette.
- **Motion:** `src/motion/` holds animation definitions. `<GlowUp>` (sticker character + torn-paper light, stop-motion) is specced in `docs/MOTION-GLOW-UP.md` and shown in Storybook under Motion.

## Structure

```
src/
  art/            sticker art library (flat SVG)
  components/
    ui/           shadcn/ui base, Sticker-themed
    sticker/      StickerArt, Sheet (riso grain), FitStage, StartCurtain
    motion/       GlowUp
    kid/          StarScore, SharePrompt, SendOverlay, ParentGate, ReplyNotification, ReplyReveal, SuccessScreen…
    parent/       MessagePreview, ListenWidget, ReplyComposer, StickerPicker…
  motion/         animation definitions (glowUp.ts)
  flows/          KidFlow, ParentFlow (the playable prototypes)
  showcase/       the page you send
  stories/        Storybook stories
  lib/audio.ts    synthesised sounds, the recording, voice-over + captions
  config.ts       links, names and the notes section
```

## What's simulated

Voice-over uses the browser's speech voice, the kid's recording is synthesised in the browser ("Twinkle Twinkle Little Star", public domain), and the parent's reply arrives on a timer. Flows, states, layout and timing are the real design.
