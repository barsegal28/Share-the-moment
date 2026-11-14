/**
 * Kid flow, iPad landscape (1194 × 834, the Figma frames 1–4 plus the send overlay and the reply).
 * One persistent scene, so the stickers that scatter out of the planet stay on the sheet and glide into place.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Check } from "lucide-react"
import { Sticker, type StickerName } from "@/art/stickers"
import { playRecording, stopRecording } from "@/lib/audio"
import { cn } from "@/lib/utils"
import { DEMO_SONG } from "@/config"
import { Obj, EASING } from "../Obj"
import { useFlow, useRecordingProgress } from "../runtime"
import { InkSheetCanvas } from "./canvases"
import { MotionScene } from "./MotionScene"
import { ArrowRightIcon, DismissIcon, RibbonIcon, ShareIcon } from "../icons"
import { DieCutText, KidActionButton, SONG_SECONDS, fmt, useReplyChoice } from "../shared"
import { playSound } from "../sounds"
import { cancelLater, later } from "@/lib/clock"
import type { StepId } from "../script"

export const IPAD = { w: 1194, h: 834 }

type Place = { cx: number; cy: number; size: number; rot: number }
type StickerId = "striped" | "ringed" | "drippy" | "cloud" | "burst" | "heart" | "spark1" | "spark2" | "spark3"
const ART: Record<StickerId, StickerName> = {
  striped: "stripedPlanet", ringed: "ringedPlanet", drippy: "drippyComet", cloud: "cloudComet", burst: "burst", heart: "heart", spark1: "sparkle", spark2: "sparkle", spark3: "sparkle",
}
/** Figma frame 2 (scatter) — sticker centres, sizes and tilts. */
const LAYOUT_SCATTER: Record<StickerId, Place> = {
  spark1: { cx: 552, cy: 177, size: 150, rot: 12 },
  striped: { cx: 289, cy: 278, size: 270, rot: -6 },
  ringed: { cx: 866, cy: 260, size: 279, rot: 7 },
  drippy: { cx: 585, cy: 438, size: 270, rot: 12 },
  cloud: { cx: 293, cy: 581, size: 270, rot: -8 },
  burst: { cx: 883, cy: 569, size: 270, rot: 10 },
  heart: { cx: 664, cy: 621, size: 150, rot: -14 },
  spark2: { cx: 171, cy: 478, size: 150, rot: -10 },
  spark3: { cx: 1040, cy: 391, size: 150, rot: 20 },
}
/** Figma frames 3–4 (success / share) — the stickers make room for the card. */
const LAYOUT_CARD: Record<StickerId, Place> = {
  cloud: { cx: 226, cy: 585, size: 270, rot: -8 },
  striped: { cx: 214, cy: 226, size: 270, rot: -6 },
  spark1: { cx: 597, cy: 92, size: 150, rot: 12 },
  ringed: { cx: 909, cy: 257, size: 279, rot: 7 },
  drippy: { cx: 575, cy: 411, size: 270, rot: 12 },
  heart: { cx: 654, cy: 594, size: 150, rot: -14 },
  spark2: { cx: 74, cy: 358, size: 150, rot: -10 },
  spark3: { cx: 1014, cy: 389, size: 150, rot: 20 },
  burst: { cx: 944, cy: 633, size: 270, rot: 10 },
}
const ORDER: StickerId[] = ["striped", "ringed", "drippy", "cloud", "burst", "heart", "spark1", "spark2", "spark3"]
/** Card: Figma "main", 620 × 660 centred at (598, 437). */
const CARD = { left: 288, top: 107, w: 620, h: 660 }

const KID_STEPS: StepId[] = ["k-glow", "k-scatter", "k-success", "k-share", "k-send", "k-notify", "k-reveal"]
export const isKidStep = (s: StepId) => KID_STEPS.includes(s)

export function KidScreens() {
  const flow = useFlow()
  const s = flow.step
  const layoutMs = flow.script["k-success"].params.layoutMs ?? 900

  if (s === "k-glow" || s === "k-send") {
    // Motion scenes from the "Share the Moment · motion" artifact, played as-is.
    const p = flow.script[s].params
    return (
      <div className="relative h-full w-full bg-ink" onClick={() => !flow.edit && s === "k-glow" && flow.next()}>
        <MotionScene
          scene={s === "k-glow" ? "glowup" : "share"}
          run={flow.run}
          fps={p.fps ?? 17}
          endFrame={s === "k-glow" ? p.endFrame : undefined}
          onStart={() => flow.signal("motionStart")}
          onDone={() => flow.signal("motionDone")}
        />
      </div>
    )
  }

  const layout = s === "k-scatter" ? LAYOUT_SCATTER : LAYOUT_CARD
  const cardState: CardState | null = s === "k-success" ? "success" : s === "k-share" ? "share" : s === "k-notify" ? "sent" : s === "k-reveal" ? "sent" : null

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink font-sans">
      <InkSheetCanvas className="absolute inset-0" />

      {/* Stickers that scatter out of the planet */}
      {ORDER.map((id) => {
        const p = layout[id]
        return (
          <Obj
            key={id}
            step="k-scatter"
            id={id}
            className="absolute"
            style={{
              left: p.cx - p.size / 2,
              top: p.cy - p.size / 2,
              width: p.size,
              height: p.size,
              transition: `left ${layoutMs}ms ${EASING.spring}, top ${layoutMs}ms ${EASING.spring}`,
              // Figma frames 3–4: the gold burst sits on top of the card; the other stickers are behind it.
              zIndex: id === "burst" && layout === LAYOUT_CARD ? 5 : undefined,
            }}
            onTap={() => {}}
          >
            <Sticker name={ART[id]} size={p.size} tilt={p.rot} />
          </Obj>
        )
      })}

      {s === "k-scatter" && (
        <Obj step="k-scatter" id="flash" className="pointer-events-none absolute inset-0" style={{ background: "#FFF4D6", opacity: 0 }}>
          <span />
        </Obj>
      )}

      {cardState && <TopBar />}
      {cardState && <Card state={cardState} />}
      {s === "k-notify" && <ReplyBanner />}
      {s === "k-reveal" && <Reveal />}
    </div>
  )
}

// ─── Top bar: profile avatar + reward progress ─────────────────────────────
function TopBar() {
  const flow = useFlow()
  const [n, setN] = useState(flow.step === "k-success" && flow.animate ? 17 : 18)
  useEffect(() => {
    if (flow.step !== "k-success" || !flow.animate) return setN(18)
    setN(17)
    // The level goes up as the last star lands.
    const m = flow.script["k-success"].objects.star3.motion
    let t = 0
    const go = () => (t = later(() => setN(18), m.delay + 500))
    const off = m.syncLine >= 0 ? flow.whenLine(m.syncLine, go) : (go(), () => {})
    return () => {
      off()
      cancelLater(t)
    }
  }, [flow.step, flow.run, flow.animate, flow.script])
  return (
    <>
      <Obj step="k-success" id="avatar" className="absolute" style={{ left: 32, top: 26, width: 52, height: 52 }}>
        <div className="grid h-[52px] w-[52px] place-items-center rounded-[26px] bg-surface">
          <Sticker name="stripedPlanet" size={42} lift={false} />
        </div>
      </Obj>
      <Obj step="k-success" id="progress" className="absolute" style={{ left: 864, top: 16, width: 314, height: 78 }}>
        <div className="flex h-[78px] items-center gap-[14px] rounded-[22px] py-3 pr-[18px] pl-[14px]">
          <div className="relative grid size-[54px] shrink-0 place-items-center">
            <RibbonIcon size={34} />
            <span className="absolute top-[4px] left-1/2 -translate-x-1/2 text-[24px] font-extrabold tracking-[-0.48px] text-ink">2</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[20px] leading-7 font-medium tracking-[-0.15px] whitespace-nowrap text-white">{n}/25 · Level 2</p>
            <div className="mt-[10px] h-3 w-[214px] overflow-hidden rounded-full bg-[rgb(251_249_242/0.4)]">
              <div className="h-full rounded-full bg-notebook transition-[width] duration-700" style={{ width: `${(n / 25) * 100}%`, transitionTimingFunction: EASING.spring }} />
            </div>
          </div>
        </div>
      </Obj>
    </>
  )
}

// ─── The card: success → share (FRE) → sent ────────────────────────────────
type CardState = "success" | "share" | "sent"
const BIG_STARS: { name: StickerName; rot: number }[] = [
  { name: "ratingStar1", rot: -8 },
  { name: "ratingStar2", rot: 4 },
  { name: "ratingStar3", rot: 10 },
]
const SMALL_ROT = [13.3, 4, 25.2]

function Card({ state }: { state: CardState }) {
  const flow = useFlow()
  return (
    <Obj step="k-success" id="card" className="absolute" style={{ left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h }}>
      <div className={cn("relative flex h-[660px] w-[620px] flex-col items-center overflow-visible rounded-[40px] bg-paper px-[79px] py-[65px] shadow-[0_5px_10px_rgb(0_0_0/0.2)]", state === "success" && "justify-center")}>
        <PaperGrain />
        {state === "success" ? (
          <div className="relative flex flex-col items-center gap-10">
            <Obj step="k-success" id="title">
              <p className="font-display text-[60px] leading-[0.98] whitespace-nowrap text-teal">
                <DieCutText stroke={20}>You are a star!</DieCutText>
              </p>
            </Obj>
            <div className="flex items-center">
              {BIG_STARS.map((st, i) => (
                <Obj key={i} step="k-success" id={`star${i + 1}`} className="-mr-[10px] last:mr-0" onTap={() => {}}>
                  <div className="grid size-[160px] place-items-center">
                    <Sticker name={st.name} size={142} tilt={st.rot} />
                  </div>
                </Obj>
              ))}
            </div>
            <div className="flex w-[240px] flex-col items-center gap-6">
              <Obj step="k-success" id="share" onTap={() => flow.go("k-share")}>
                <KidActionButton>
                  Share <ShareIcon size={32} />
                </KidActionButton>
              </Obj>
              <Obj step="k-success" id="next" onTap={() => flow.restart()}>
                <KidActionButton tone="light">
                  Play next <ArrowRightIcon size={32} />
                </KidActionButton>
              </Obj>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-[99px]">
            <div className="flex flex-col items-center gap-10">
              <Obj step="k-share" id="stars">
                <div className="flex items-center">
                  {BIG_STARS.map((st, i) => (
                    <div key={i} className="-mr-1 grid size-[74px] place-items-center last:mr-0">
                      <Sticker name={st.name} size={61.6} tilt={SMALL_ROT[i]} />
                    </div>
                  ))}
                </div>
              </Obj>
              <Obj step="k-share" id="player">
                <SongPlayer active={state === "share" && flow.step === "k-share"} />
              </Obj>
            </div>
            {state === "share" ? (
              <Obj step="k-share" id="share" hint onTap={() => flow.go("k-send")} className="rounded-[28px]">
                <KidActionButton>
                  Share <ShareIcon size={32} />
                </KidActionButton>
              </Obj>
            ) : (
              <KidActionButton tone="teal" className="gap-2">
                Sent <Check className="size-7" strokeWidth={3} />
              </KidActionButton>
            )}
            <Obj step="k-share" id="close" className="absolute top-[-33px] left-[487.5px]" onTap={() => {}}>
              <div className="grid size-16 place-items-center rounded-full border border-black/13 bg-white/80 text-[#242424]">
                <DismissIcon size={28} />
              </div>
            </Obj>
          </div>
        )}
      </div>
    </Obj>
  )
}

function PaperGrain() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full rounded-[40px] opacity-60 mix-blend-multiply">
      <filter id="card-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.08" />
      </filter>
      <rect width="100%" height="100%" filter="url(#card-grain)" opacity="0.35" />
    </svg>
  )
}

/** Figma "Player": the kid's recording, playing quietly while the share suggestion is voiced. */
function SongPlayer({ active }: { active: boolean }) {
  const flow = useFlow()
  // The player starts stopped, at 0:00; the kid can tap play to hear it.
  const [playing, setPlaying] = useState(false)
  const p = useRecordingProgress(active && playing)
  useEffect(() => setPlaying(false), [flow.run, flow.step])
  const vol = flow.script["k-share"].params.playerVolume ?? 0.6
  const bg = flow.script["k-glow"].recording
  const toggle = () => {
    if (playing) {
      // Back to the quiet background take, as the success screen had it.
      if (bg.mode === "background") playRecording({ volume: bg.volume, loop: true })
      else stopRecording()
    } else playRecording({ volume: vol, loop: true })
    setPlaying(!playing)
    playSound("tap", { volume: 0.7 })
  }
  const shown = playing ? p : 0
  return (
    <div className="flex items-center gap-8 rounded-[60px] bg-[#c0cdfb] px-10 py-[30px] shadow-[0_5px_10px_rgb(0_0_0/0.22)]">
      <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="relative shrink-0 transition-transform active:scale-90">
        {playing ? (
          // Pause: the same disc as the play button (teal ring, cream face), with orange bars instead of the triangle.
          <svg width={118} height={118} viewBox="0 0 118 118" aria-hidden>
            <circle cx="59" cy="59" r="54" fill="var(--sticker-cream)" stroke="var(--sticker-teal)" strokeWidth="7" />
            <rect x="41" y="36" width="12" height="46" rx="6" fill="var(--sticker-orange)" />
            <rect x="65" y="36" width="12" height="46" rx="6" fill="var(--sticker-orange)" />
          </svg>
        ) : (
          <Sticker name="play" size={118} lift={false} />
        )}
      </button>
      <div className="flex w-[318px] flex-col gap-5">
        <div className="flex flex-col gap-4 leading-[0.98]">
          <p className="font-display text-[36px] tracking-[1.44px] text-teal uppercase">{DEMO_SONG.title}</p>
          <p className="font-mono text-[24px] font-medium text-gold">
            {DEMO_SONG.from} · Played by Noa
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-[18px] w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full min-w-[18px] rounded-full bg-pink" style={{ width: `${shown * 100}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[16px] font-medium text-gold">
            <span>{fmt(shown * SONG_SECONDS)}</span>
            <span>{fmt(SONG_SECONDS)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── A surprise arrives ────────────────────────────────────────────────────
function ReplyBanner() {
  const flow = useFlow()
  const { sticker } = useReplyChoice()
  return (
    <Obj step="k-notify" id="banner" hint onTap={() => flow.go("k-reveal")} className="absolute z-10 rounded-[36px]" style={{ left: (IPAD.w - 600) / 2, top: 28, width: 600 }}>
      <div className="sticker flex items-center gap-5 rounded-[36px] bg-paper py-4 pr-6 pl-5 [--kiss:var(--sticker-pink)]">
        <Sticker name="mom" size={96} tilt={-6} />
        <div className="flex-1">
          <p className="font-display text-[34px] leading-none text-teal">Mom sent you</p>
          <p className="font-display text-[34px] leading-none text-orange">a surprise!</p>
        </div>
        <div className="grid size-[92px] place-items-center rounded-[24px] bg-cream/70">
          <Sticker name={sticker} size={70} tilt={8} motion="wiggle" />
        </div>
      </div>
    </Obj>
  )
}

// ─── The reveal ────────────────────────────────────────────────────────────
function Reveal() {
  const flow = useFlow()
  const { sticker, phrase } = useReplyChoice()
  const confettiAt = flow.script["k-reveal"].objects.confetti.motion.delay
  return (
    <div className="absolute inset-0 z-10">
      <Obj step="k-reveal" id="dim" className="absolute inset-0">
        <div className="h-full w-full bg-ink/85" />
      </Obj>
      <Confetti key={flow.run} delay={confettiAt} play={flow.animate} />
      <Obj step="k-reveal" id="tag" className="absolute" style={{ left: 0, right: 0, top: 96 }}>
        <p className="text-center font-display text-[72px] leading-none text-teal uppercase">
          <DieCutText stroke={22}>{phrase}</DieCutText>
        </p>
      </Obj>
      <Obj step="k-reveal" id="sticker" className="absolute" style={{ left: IPAD.w / 2 - 170, top: 230, width: 340, height: 340 }} onTap={() => {}}>
        <Sticker name={sticker} size={340} tilt={-8} />
      </Obj>
      <Obj step="k-reveal" id="mom" className="absolute" style={{ left: 300, top: 470, width: 150, height: 150 }}>
        <Sticker name="mom" size={150} tilt={-10} />
      </Obj>
      <Obj step="k-reveal" id="next" className="absolute" style={{ left: IPAD.w / 2 - 120, top: 680 }} onTap={() => flow.restart()}>
        <KidActionButton tone="light">
          Play next <ArrowRightIcon size={32} />
        </KidActionButton>
      </Obj>
    </div>
  )
}

const CONF_COLORS = ["var(--sticker-orange)", "var(--sticker-pink)", "var(--sticker-periwinkle)", "var(--sticker-teal)", "var(--sticker-gold)", "var(--sticker-cream)"]
function Confetti({ delay, play }: { delay: number; play: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || !play) return
    const anims = Array.from(root.children).map((el, i) => {
      const a = (i / root.children.length) * Math.PI * 2 + (i % 3) * 0.2
      const d = 260 + ((i * 97) % 300)
      return (el as HTMLElement).animate(
        [
          { transform: "translate(0,0) rotate(0) scale(0.4)", opacity: 0 },
          { opacity: 1, offset: 0.1 },
          { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d * 0.75 + 120}px) rotate(${(i % 2 ? 1 : -1) * 540}deg) scale(1)`, opacity: 0 },
        ],
        { duration: 1600 + (i % 5) * 160, delay, easing: "cubic-bezier(0.1, 0.7, 0.3, 1)", fill: "both" },
      )
    })
    return () => anims.forEach((x) => x.cancel())
  }, [delay, play])
  return (
    <div ref={ref} className="pointer-events-none absolute" style={{ left: IPAD.w / 2, top: 400 }}>
      {Array.from({ length: 28 }, (_, i) => {
        const st: CSSProperties = { background: CONF_COLORS[i % CONF_COLORS.length], position: "absolute", width: 18, height: i % 3 ? 26 : 18, opacity: 0, borderRadius: i % 3 ? 3 : 2, clipPath: i % 3 === 0 ? "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" : "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }
        return <span key={i} style={st} />
      })}
    </div>
  )
}
