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
- **Art:** sticker assets from the Figma file's **app assets** page (`src/art/figma-stickers.ts`), plus a few local hand-drawn ones (`src/art/stickers.tsx`). `<StickerArt>` generates the die-cut from each silhouette.
- **From Figma:** only what the components on the **app asets** page use: the Sticker primitives (`--sticker-*`) and Sticker-mode variables (`--pc-*`), the type scale measured from the components (Bagel Fat One + DM Mono), the sticker lift and die-cut, radii and the effects in `src/lib/effects.ts`. Value-by-value audit and outliers: `docs/FIGMA-AUDIT.md`.

## Structure

```
src/
  art/            sticker art library (flat SVG)
  components/
    ui/           shadcn/ui base, Sticker-themed
    sticker/      StickerArt, Sheet (riso grain), FitStage, StartCurtain
    kid/          StarScore, SharePrompt, SendOverlay, ParentGate, ReplyNotification, ReplyReveal, SuccessScreen…
    parent/       MessagePreview, ListenWidget, ReplyComposer, StickerPicker…
  flows/          KidFlow, ParentFlow (the playable prototypes)
  showcase/       the page you send
  stories/        Storybook stories
  lib/audio.ts    synthesised sounds, the recording, voice-over + captions
  config.ts       links, names and the notes section
```

## What's simulated

The example song is "Let It Go" (set in `src/config.ts` as `DEMO_SONG`). Only its title is used: the kid's "recording" is a short original tune synthesised in the browser. Voice-over uses the browser's speech voice, and the parent's reply arrives on a timer. Flows, states, layout and timing are the real design.
