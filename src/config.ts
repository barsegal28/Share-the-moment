/**
 * Everything you'll want to edit before sending the page lives here.
 */
export const PROJECT = {
  title: "Share the Moment",
  /** Placeholder product name used inside the prototype. */
  appName: "Piano Pals",
  /** Your name, shown in the header and footer. */
  author: "",
  context: "Product design home assignment · Simply",
}

/** The example song in the prototype. Only the title is used: the demo recording is an original tune. */
export const DEMO_SONG = { title: "Let It Go", from: "Frozen" }

export const LINKS = {
  /** Paste the Figma file link ("Share the moment"). The page embeds it automatically. */
  figma: "https://www.figma.com/design/vlOm4rX8pbg54I4chyh3Wy/Share-the-moment?node-id=80-5958",
  /** Your GitHub repo URL. */
  repo: "https://github.com/barsegal28/Share-the-moment",
  /** Storybook is deployed next to the app. */
  storybook: "./storybook/",
}

export const figmaEmbedUrl = (url: string) => `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`

export type Note = { title: string; body: string; tag?: string }

/** The notes section at the bottom of the showcase. Edit freely. */
export const NOTES: Note[] = [
  {
    tag: "Decision",
    title: "The kid decides whether, never who",
    body: "Recordings always go to the contacts a parent set up. There's no recipient picker, so the moment stays one tap, and nothing is ever shared automatically: the pride stays the kid's own.",
  },
  {
    tag: "Decision",
    title: "Sound first, text second",
    body: "Every prompt is voiced; captions are a backup. People are faces, not names. One obvious action per screen, 80px+ touch targets, and every tap has a sound and a press.",
  },
  {
    tag: "Decision",
    title: "Stars that say what went right",
    body: "Each star stands for one thing: every note, on the beat, both hands. The kid learns what to work on next, and the parent sees the same icons so they can praise something specific.",
  },
  {
    tag: "Decision",
    title: "No negative signals, ever",
    body: "No 'not opened yet', no listen counts. The kid hears back only when a parent sends a reply on purpose. Failures show up only in parent settings.",
  },
  {
    tag: "Visual",
    title: "Sticker language on an ink sheet",
    body: "Die-cut vinyl stickers: clean vector art, a 9px cream border, a 3.5px kiss-cut edge and a soft lift. Riso grain sits on the sheet only, so stickers stay clean. Bagel Fat One for headlines, DM Sans for text. Built on shadcn/ui with Sticker tokens and kid sizes.",
  },
  {
    tag: "Prototype",
    title: "What's simulated",
    body: "Voice-over uses the browser's speech voice, the recording is synthesised in the browser, and the parent's reply arrives on a timer. The flows, states and timing are the real design.",
  },
  {
    tag: "Open",
    title: "Next questions",
    body: "Prompt thresholds (when is a kid a habitual sharer; how many skips quiet the prompt). A sticker book: should stickers from parent replies live there too? And a sticker-first reply, since it's the fastest thing for a busy parent to send.",
  },
]
