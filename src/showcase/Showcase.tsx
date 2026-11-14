import { useState, type ReactNode } from "react"
import { BookOpen, PenTool as Figma, GitBranch as Github, ExternalLink } from "lucide-react"
import { Sticker, type StickerName } from "@/art/stickers"
import { Sheet } from "@/components/sticker/Sheet"
import { StarScore, STAR_INFO, type StarKey } from "@/components/kid/StarScore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeviceFrame } from "./DeviceFrame"
import { LINKS, NOTES, PROJECT, figmaEmbedUrl } from "@/config"
import { cn } from "@/lib/utils"

/**
 * The one page you send: both flows live, the process, links to Figma / GitHub / Storybook, and notes.
 */
const KID_SCENARIOS = [
  { id: "first", label: "First share", note: "Full onboarding moment: voice-over asks, Mom and Dad wave, the button wiggles, and a first-time line explains that a reply may come back." },
  { id: "early", label: "Shares 2–5", note: "Same layout, shorter voice line, no coaching." },
  { id: "habitual", label: "Habitual", note: "About 5+ shares: the share sits inline with the stars, a short sound, no big animation." },
  { id: "better", label: "Played it better", note: "Already shared this song, played it better: \"Even better than last time!\" with an offer to send the new take." },
  { id: "struggle", label: "Struggle win", note: "3 stars after many tries: the strongest prompt. The parent also gets the effort story." },
  { id: "quiet", label: "Ignored prompts", note: "Skipped 3 times in a row: a quiet button with no voice-over. Never removed, never nags." },
  { id: "noContact", label: "No contact yet", note: "\"Ask a grown-up\" behind a press-and-hold gate. Until then the recording waits on a Ready to send shelf." },
] as const

const KID_STEPS: { title: string; sound: string; motion: string; actions: string }[] = [
  { title: "Success screen", sound: "\"You did it!\", one line per star, then the recording plays very quietly underneath while the share suggestion is voiced on top.", motion: "Stars pop in one by one; the share prompt zooms in; avatars wave.", actions: "Send to Mom & Dad · Play again · Next song. Tapping anything stops the sequence." },
  { title: "Send confirmation", sound: "Whoosh, chime, \"Mom and Dad will hear it soon!\"", motion: "The recording flies as a paper plane along a dotted trail; avatars get a check.", actions: "None — it closes on its own. Offline looks identical for the kid." },
  { title: "Reply notification", sound: "Chime and \"Mom sent you a surprise!\"", motion: "Banner drops in with the parent's face (held until a song ends).", actions: "Tap to open. Several replies become \"3 surprises!\"." },
  { title: "Reply reveal", sound: "The parent's voice message.", motion: "The sticker slaps on with confetti stickers.", actions: "Hear it again · Next surprise / Yay!" },
]

const PARENT_STEPS: { title: string; body: string }[] = [
  { title: "Email or SMS", body: "Chosen at setup. SMS is one line plus the link; email is one card with one button. The first message explains what this is." },
  { title: "Listen widget", body: "The recording, the same three star icons the kid saw, and the effort story (\"It took 6 tries\"). Mobile-first." },
  { title: "Send a reply", body: "Sticker first (fastest), voice or video. Praise prompts focus on effort, never on mistakes. Camera denied falls back to voice." },
  { title: "Confirmation", body: "The reply reaches the kid next time they open the app. The kid never sees who didn't reply." },
]

export function Showcase() {
  const [scenario, setScenario] = useState<(typeof KID_SCENARIOS)[number]["id"]>("first")
  const [replies, setReplies] = useState(1)
  const [channel, setChannel] = useState<"sms" | "email">("sms")
  const [first, setFirst] = useState(true)
  const active = KID_SCENARIOS.find((s) => s.id === scenario)!

  return (
    <Sheet ground="ink" className="min-h-full">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <Sticker name="ratingStar1" size={40} tilt={-8} lift={false} />
            <span className="font-display text-xl text-cream">{PROJECT.title}</span>
          </a>
          <nav className="hidden items-center gap-1 text-sm font-semibold text-cream/75 md:flex">
            {[["Kid flow", "#kid"], ["Parent flow", "#parent"], ["Process", "#process"], ["System", "#system"], ["Notes", "#notes"]].map(([l, h]) => (
              <a key={h} href={h} className="rounded-full px-3 py-1.5 hover:bg-cream/10 hover:text-cream">{l}</a>
            ))}
          </nav>
          <LinkButtons compact />
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Hero */}
        <section className="relative grid gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="cream" className="px-3 py-1 text-[13px]">{PROJECT.context}{PROJECT.author ? ` · ${PROJECT.author}` : ""}</Badge>
            <h1 className="font-display text-[56px] leading-[0.95] text-cream sm:text-[84px]">Share the Moment</h1>
            <p className="max-w-[560px] text-lg leading-relaxed text-cream/80 sm:text-xl">
              When a kid earns 3 stars on a song, they can send the recording to their family with one tap, and a parent can send a surprise back. Built to make the pride the kid's own, and to turn "did you practise?" into "I heard you play!".
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="sticker" tone="orange" size="lg" className="h-14 rounded-2xl px-6 text-lg" asChild>
                <a href="#kid">Play the kid flow</a>
              </Button>
              <Button variant="sticker" tone="cream" size="lg" className="h-14 rounded-2xl px-6 text-lg" asChild>
                <a href="#parent">Parent flow</a>
              </Button>
            </div>
          </div>
          <div className="relative hidden min-h-[360px] md:block" aria-hidden>
            <Sticker name="stripedPlanet" size={230} tilt={-8} motion="float" className="absolute -top-4 left-0" />
            <Sticker name="kid" size={130} tilt={8} className="absolute top-40 left-[44%]" />
            <Sticker name="drippyComet" size={170} tilt={-20} className="absolute top-0 right-0" />
            <Sticker name="ringedPlanet" size={190} tilt={6} motion="float" className="absolute right-6 bottom-0" style={{ animationDelay: "600ms" }} />
            <Sticker name="sparkle" size={80} tilt={0} className="absolute bottom-6 left-16" />
          </div>
        </section>

        {/* Kid flow */}
        <Section id="kid" eyebrow="iPad · landscape" title="Kid flow" lead="Success → share → the recording flies to Mom & Dad → a surprise comes back. Tap Start inside the frame, with sound on.">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {KID_SCENARIOS.map((s) => (
              <Pill key={s.id} on={scenario === s.id} onClick={() => setScenario(s.id)}>{s.label}</Pill>
            ))}
            <span className="mx-2 h-6 w-px bg-cream/20" />
            <Pill on={replies === 1} onClick={() => setReplies(1)}>1 reply</Pill>
            <Pill on={replies === 3} onClick={() => setReplies(3)}>3 replies</Pill>
          </div>
          <p className="mb-6 max-w-[760px] text-base text-cream/75"><b className="text-cream">{active.label}:</b> {active.note}</p>
          <DeviceFrame device="ipad" width={1180} height={820} src={`./#/kid?variant=${scenario}&replies=${replies}`} title="Kid flow prototype" />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {KID_STEPS.map((s, i) => (
              <div key={s.title} className="rounded-3xl bg-muted p-5">
                <p className="font-display text-lg text-orange">{i + 1}. {s.title}</p>
                <dl className="mt-3 space-y-2.5 text-sm leading-snug">
                  <Row k="Sound" v={s.sound} />
                  <Row k="Motion" v={s.motion} />
                  <Row k="Actions" v={s.actions} />
                </dl>
              </div>
            ))}
          </div>
        </Section>

        {/* Stars */}
        <Section id="stars" eyebrow="What 3 stars mean" title="Stars that say what went right" lead="Each star is one part of a mistake-free performance, so the kid hears what they got right, and the parent sees the same icons.">
          <div className="flex flex-col items-center gap-10 rounded-[36px] bg-muted px-6 py-12 lg:flex-row lg:justify-around">
            <StarScore size="md" />
            <ul className="space-y-4 text-cream/85">
              {(Object.keys(STAR_INFO) as StarKey[]).map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <Sticker name={STAR_INFO[k].icon} size={40} lift={false} />
                  <span><b className="text-cream">{STAR_INFO[k].voice}</b> · missing it: “{STAR_INFO[k].hint}”</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Parent flow */}
        <Section id="parent" eyebrow="Phone · web" title="Parent flow" lead="A message, a listen page, a reply. No app to install, and replying takes one tap.">
          <div className="grid items-start gap-10 md:grid-cols-[360px_1fr]">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Pill on={channel === "sms"} onClick={() => setChannel("sms")}>SMS</Pill>
                <Pill on={channel === "email"} onClick={() => setChannel("email")}>Email</Pill>
                <Pill on={first} onClick={() => setFirst(!first)}>{first ? "✓ " : ""}First message</Pill>
              </div>
              <DeviceFrame device="phone" width={390} height={844} src={`./#/parent?channel=${channel}&first=${first ? 1 : 0}`} title="Parent flow prototype" />
            </div>
            <ol className="grid gap-4 md:pt-14">
              {PARENT_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-3xl bg-muted p-5">
                  <span className="font-display grid size-11 shrink-0 place-items-center rounded-full bg-cream text-xl text-ink">{i + 1}</span>
                  <div>
                    <p className="font-display text-xl text-cream">{s.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-cream/75">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* Process */}
        <Section id="process" eyebrow="From sketch to final design" title="Process" lead="How it got from the whiteboard to the screens above.">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <figure className="overflow-hidden rounded-[28px] bg-muted">
              <img src="./process/whiteboard.jpg" alt="Brainstorm whiteboard: kid flow, parent flow, metrics and motivations for ages 6–9" className="w-full" loading="lazy" />
              <figcaption className="p-4 text-sm text-cream/70">1 · The brainstorm: the kid and parent flows, metrics, and three reasons a 6–9 year old plays.</figcaption>
            </figure>
            <div className="grid gap-4">
              <Step n={2} sticker="eighthNote" title="Personas → rules">Wants to learn, parents said so, it's a game. Each one shaped the rules: voice first, faces not names, one action per screen, no negative signals.</Step>
              <Step n={3} sticker="drum" title="States, not screens">Every step designed in layers (screen, sound, motion, actions) and every sub-state mapped: first share to habitual, offline, no contact, reply queues.</Step>
              <Step n={4} sticker="sparkle" title="Visual language">Sticker: die-cut vinyl on an ink sheet. Playful and tactile for kids, calm enough for parents.</Step>
              <Step n={5} sticker="piano" title="Design system → code">shadcn/ui as the base, re-themed with Sticker tokens and kid sizes, documented in Storybook, mirrored in Figma.</Step>
            </div>
          </div>
        </Section>

        {/* System */}
        <Section id="system" eyebrow="Design system" title="Sticker on shadcn/ui" lead="Every colour belongs to the language. Components live in Storybook with each of their states.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] bg-muted p-6">
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                {[["Cream", "#EDE2C2"], ["Orange", "#FD6117"], ["Teal", "#0B7563"], ["Periwinkle", "#8BA1EF"], ["Pink", "#EC70BB"], ["Ink", "#112F29"], ["Gold", "#91781E"]].map(([n, c]) => (
                  <div key={n} className="flex flex-col gap-2">
                    <span className="aspect-square rounded-2xl ring-2 ring-cream/20" style={{ background: c }} />
                    <span className="text-xs font-semibold text-cream">{n}</span>
                    <span className="-mt-1.5 font-mono text-[11px] text-cream/60">{c}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-end gap-6 border-t border-cream/10 pt-6">
                <div>
                  <p className="font-display text-4xl text-cream">Bagel Fat One</p>
                  <p className="text-sm text-cream/60">Headlines</p>
                </div>
                <div>
                  <p className="text-2xl text-cream">DM Mono</p>
                  <p className="text-sm text-cream/60">Text</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-6 border-t border-cream/10 pt-8">
                <Button variant="sticker" tone="orange" size="kid">Kid button</Button>
                <Button variant="sticker" tone="teal" size="kid">Teal</Button>
                <Button variant="sticker" tone="periwinkle" size="kid-icon" aria-label="Icon button">★</Button>
              </div>
            </div>
            <a href={LINKS.storybook} target="_blank" rel="noreferrer" className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[28px] bg-teal p-6">
              <div className="absolute inset-0 flex flex-wrap content-start gap-4 p-6 opacity-95" aria-hidden>
                {(["stripedPlanet", "heart", "ratingStar1", "eighthNotes", "drippyComet", "sparkle", "trebleClef", "ringedPlanet", "burst", "cloudComet"] as StickerName[]).map((s, i) => (
                  <Sticker key={s} name={s} size={64} tilt={i % 2 ? 10 : -10} />
                ))}
              </div>
              <div className="relative flex items-center justify-between gap-4 rounded-2xl bg-ink/90 p-5">
                <div>
                  <p className="font-display text-2xl text-cream">Open Storybook</p>
                  <p className="text-sm text-cream/70">Every component and state: shadcn base, stickers, kid and parent components, full screens.</p>
                </div>
                <BookOpen className="size-8 shrink-0 text-cream transition group-hover:scale-110" />
              </div>
            </a>
          </div>
        </Section>

        {/* Figma */}
        <Section id="figma" eyebrow="Design file" title="Figma" lead="The source file: screens, components and the Sticker variables.">
          {LINKS.figma ? (
            <div className="overflow-hidden rounded-[28px] ring-2 ring-cream/10">
              <iframe title="Figma file" src={figmaEmbedUrl(LINKS.figma)} className="h-[640px] w-full border-0 bg-muted" allowFullScreen />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[28px] border-2 border-dashed border-cream/25 p-12 text-center">
              <Figma className="size-10 text-cream/60" />
              <p className="text-lg text-cream">The Figma embed appears here once the link is added.</p>
              <p className="text-sm text-cream/60">Set <code className="rounded bg-cream/10 px-1.5 py-0.5">LINKS.figma</code> in <code className="rounded bg-cream/10 px-1.5 py-0.5">src/config.ts</code>.</p>
            </div>
          )}
        </Section>

        {/* Notes */}
        <Section id="notes" eyebrow="Notes" title="Decisions & open questions">
          <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
            {NOTES.map((n) => (
              <div key={n.title} className="mb-4 break-inside-avoid rounded-3xl bg-cream p-6 text-ink">
                {n.tag && <Badge variant={n.tag === "Open" ? "destructive" : n.tag === "Visual" ? "accent" : n.tag === "Prototype" ? "default" : "secondary"} className="mb-3">{n.tag}</Badge>}
                <p className="text-lg leading-snug font-bold">{n.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed opacity-80">{n.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <footer className="mt-10 border-t border-cream/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <p className="text-sm text-cream/60">{PROJECT.title} · {PROJECT.context}{PROJECT.author ? ` · ${PROJECT.author}` : ""}</p>
          <LinkButtons />
        </div>
      </footer>
    </Sheet>
  )
}

function LinkButtons({ compact = false }: { compact?: boolean }) {
  const items = [
    { label: "Figma", href: LINKS.figma, icon: Figma },
    { label: "GitHub", href: LINKS.repo, icon: Github },
    { label: "Storybook", href: LINKS.storybook, icon: BookOpen },
  ].filter((i) => i.href)
  return (
    <div className="flex items-center gap-2">
      {items.map(({ label, href, icon: Icon }) => (
        <Button key={label} variant="outline" size="sm" className="rounded-full border-cream/25 text-cream hover:bg-cream/10" asChild>
          <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon /> <span className={cn(compact && "hidden sm:inline")}>{label}</span>
            {!compact && <ExternalLink className="size-3 opacity-60" />}
          </a>
        </Button>
      ))}
    </div>
  )
}

function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-14 md:py-20">
      <p className="text-sm font-semibold tracking-[0.18em] text-orange uppercase">{eyebrow}</p>
      <h2 className="font-display mt-2 text-4xl text-cream sm:text-5xl">{title}</h2>
      {lead && <p className="mt-3 mb-8 max-w-[720px] text-lg text-cream/75">{lead}</p>}
      {!lead && <div className="mb-8" />}
      {children}
    </section>
  )
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", on ? "bg-cream text-ink" : "bg-cream/8 text-cream/80 hover:bg-cream/15")}
    >
      {children}
    </button>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-widest text-cream/50 uppercase">{k}</dt>
      <dd className="text-cream/85">{v}</dd>
    </div>
  )
}

function Step({ n, sticker, title, children }: { n: number; sticker: StickerName; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 rounded-3xl bg-muted p-5">
      <Sticker name={sticker} size={52} tilt={n % 2 ? -8 : 8} lift={false} />
      <div>
        <p className="font-display text-lg text-cream">{n} · {title}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-cream/75">{children}</p>
      </div>
    </div>
  )
}
