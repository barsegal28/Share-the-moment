/**
 * Kid flow, iPad landscape (1194 × 834, the Figma frames 1–4 plus the send overlay and the reply).
 * One persistent scene, so the stickers that scatter out of the planet stay on the sheet and glide into place.
 */
import { useEffect, useState, type CSSProperties } from "react"
import { Sticker, type StickerName } from "@/art/stickers"
import { Obj, EASING } from "../Obj"
import { useFlow } from "../runtime"
import { ArrowExitIcon, BUTTON_ICON_SIZE, Button, KidBackground, Learner, MomMessageCard, ReplyNotification, ResultCard, RewardProgress, ShareIcon, SurpriseLabel } from "@/components/app"
import { useReplyChoice } from "../shared"
import { MotionScene, loadMotion } from "./MotionScene"

// Warm the motion scenes (font + stickers) so the glow-up starts at once.
if (typeof window !== "undefined") void loadMotion().catch(() => {})
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
  burst: { cx: 944.5, cy: 643, size: 270, rot: -10 },
}
const ORDER: StickerId[] = ["striped", "ringed", "drippy", "cloud", "burst", "heart", "spark1", "spark2", "spark3"]

const KID_STEPS: StepId[] = ["k-glow", "k-scatter", "k-success", "k-share", "k-send", "k-shared", "k-notify", "k-surprise"]
export const isKidStep = (s: StepId) => KID_STEPS.includes(s)

export function KidScreens() {
  const flow = useFlow()
  const s = flow.step
  const layoutMs = flow.script["k-success"].params.layoutMs ?? 900
  // Continue / Close on Mom's message hands Noa back to her lesson: the result screen she came from.
  const [backToLesson, setBackToLesson] = useState(false)
  useEffect(() => setBackToLesson(false), [s, flow.run])

  if (s === "k-glow") {
    // Motion scene "glowup" from the "Share the Moment · motion" artifact, played as-is.
    const p = flow.script[s].params
    return (
      <div className="relative h-full w-full bg-ink" onClick={() => !flow.edit && flow.next()}>
        <MotionScene scene="glowup" run={flow.run} fps={p.fps ?? 17} endFrame={p.endFrame} onStart={() => flow.signal("motionStart")} onDone={() => flow.signal("motionDone")} />
      </div>
    )
  }
  if (s === "k-share" || s === "k-send") return <ShareMoment />
  if (s === "k-surprise" && !backToLesson) return <MessageFromMom onDone={() => setBackToLesson(true)} />

  const layout = s === "k-scatter" ? LAYOUT_SCATTER : LAYOUT_CARD
  // k-notify: Mom's reply lands on top of the "You are a star! · Shared" screen.
  const cardState: CardState | null = s === "k-success" ? "success" : s === "k-shared" || s === "k-notify" || s === "k-surprise" ? "shared" : null

  return (
    <KidBackground learner={false} progress={false} className="font-mono">

      {/* k-notify: the screen behind Mom's reply blurs (Figma overlay: 2.15px blur, black 20%). A plain filter on
          the scene, not backdrop-filter, which smears the scaled stage edges. */}
      <div className="absolute inset-0" style={{ filter: s === "k-notify" ? "blur(2.15px)" : undefined }}>
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
            still={layout === LAYOUT_CARD}
          >
            {/* Behind the card the stickers sit at 70% (Figma "Sticker sheet · dark"); the gold burst is on top, at 100%. */}
            <span className="block transition-opacity duration-500" style={{ opacity: layout === LAYOUT_CARD && id !== "burst" ? 0.7 : 1 }}>
              <Sticker name={ART[id]} size={p.size} tilt={p.rot} />
            </span>
          </Obj>
        )
      })}

      {s === "k-scatter" && (
        <Obj step="k-scatter" id="flash" className="pointer-events-none absolute inset-0" style={{ background: "#FFF4D6", opacity: 0 }}>
          <span />
        </Obj>
      )}

      {(cardState || s === "k-scatter") && <TopBar />}
      {cardState && <Card state={cardState} />}
      </div>
      {s === "k-notify" && <ReplyArrives />}
    </KidBackground>
  )
}

// ─── Top bar: the learner and Reward progress (Figma "background") ─────────
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
      <Obj step="k-scatter" id="avatar" className="absolute top-0 left-0">
        <Learner />
      </Obj>
      <Obj step="k-scatter" id="progress" className="absolute top-4 right-4">
        {/* Figma: 144 of 214px at 18/25 */}
        <RewardProgress count={n} progress={(144 / 214) * (n / 18)} />
      </Obj>
    </>
  )
}

// ─── The card: Figma "main" ───────────────────────────────────────────────
type CardState = "success" | "shared"
const CARD_POS = { left: 288, top: 107 }

function Card({ state }: { state: CardState }) {
  const flow = useFlow()
  // k-success: main · timeline=FRE (title + stars). k-shared: main · default with Shared ✓ (Figma screen 5).
  const step: StepId = state === "success" ? "k-success" : "k-shared"
  return (
    <Obj step={step} id="card" className="absolute" style={{ left: CARD_POS.left, top: CARD_POS.top, width: 620, height: 660 }}>
      <ResultCard
        timeline={state === "success" ? "FRE" : "default"}
        shared
        slot={(part, node) => {
          if (part === "title") return <Obj step={step} id="title">{node}</Obj>
          if (part === "next") return <Obj step={step} id="next" className="w-full rounded-[28px]" hint onTap={() => flow.next()}>{node}</Obj>
          if (part === "secondary") return <Obj step={step} id="shared" className="w-full">{node}</Obj>
          if (part === "again") return <Obj step={step} id="again" className="w-full" onTap={() => flow.go("k-glow")}>{node}</Obj>
          return node
        }}
        renderStar={(star, i) => (
          <Obj key={i} step={step} id={`star${i + 1}`} onTap={() => {}}>
            {star}
          </Obj>
        )}
      />
    </Obj>
  )
}

/**
 * The whole share moment is the motion artifact's "share" scene: it starts on the share panel (frame 0) and
 * ends on the "You are a star!" result panel with "Shared" (frame 149). k-share holds the first frame until the
 * kid taps Share; k-send plays it, and its onDone turns the result panel's "Play next" and "Play again" on.
 * Tap areas are the scene's boxes on the 1194 × 834 stage.
 */
const SHARE_HIT = { share: [478, 604.5, 240, 80], close: [824, 140, 64, 64] } as const
const box = ([left, top, width, height]: readonly number[]): CSSProperties => ({ position: "absolute", left, top, width, height })

function ShareMoment() {
  const flow = useFlow()
  const sending = flow.step === "k-send"
  const p = flow.script["k-send"].params
  return (
    <div className="relative h-full w-full bg-ink">
      <MotionScene
        // Share screen: the "share-screen-a" invitation loops (the song travels kid → Mom); on the Share tap the
        // "share" scene plays once, with its own built-in sound (comet engine, "mom got it" slap, heart pop).
        scene={sending ? "share" : "share-screen-a"}
        loop={!sending}
        run={flow.run}
        fps={p.fps ?? 17}
        onStart={() => sending && flow.signal("motionStart")}
        endFrame={sending ? p.endFrame : undefined}
        onDone={() => sending && flow.signal("motionDone")}
      />
      {!sending && <CardSwap key={flow.run} />}
      {!sending && (
        <>
          {/* The scene paints the Share button into its first frame. A real Share button sits on top so it can
              move (idle wiggle), over a paper patch that hides the painted one. */}
          <div aria-hidden className="absolute rounded-[30px] bg-paper" style={box([SHARE_HIT.share[0] - 3, SHARE_HIT.share[1] - 3, SHARE_HIT.share[2] + 6, SHARE_HIT.share[3] + 8])} />
          <Obj step="k-share" id="share" hint onTap={() => flow.go("k-send")} className="rounded-[28px]" style={box(SHARE_HIT.share)}>
            <Button className="w-[240px]" iconEnd={<ShareIcon size={BUTTON_ICON_SIZE.xxl} />}>
              Share
            </Button>
          </Obj>
          <Obj step="k-share" id="close" className="rounded-full" style={box(SHARE_HIT.close)} onTap={() => {}}>
            <span className="block h-full w-full" aria-label="Close" />
          </Obj>
        </>
      )}
    </div>
  )
}

// ─── Mom's reply arrives · Figma "notification" (212:14829) ─────────────────
/** The result screen dims (black 20%) and blurs (2.15px); the banner drops in, centred 6px from the top. */
function ReplyArrives() {
  const flow = useFlow()
  return (
    <>
      <Obj step="k-notify" id="overlay" className="pointer-events-none absolute inset-0 z-10">
        <div className="h-full w-full bg-black/20" />
      </Obj>
      <Obj step="k-notify" id="notif" hint onTap={() => flow.next()} className="absolute top-1.5 left-1/2 z-20 -ml-[231px] rounded-[20px]" style={{ width: 462 }}>
        <ReplyNotification />
      </Obj>
    </>
  )
}

// ─── Message from Mom · Figma "message from mom" (212:13507) ────────────────
/** Top bar (Noa + Exit, Reward progress), the "A surprise from mom!" line and Mom's card (620 × 538, top 172). */
function MessageFromMom({ onDone }: { onDone: () => void }) {
  const choice = useReplyChoice()
  return (
    <KidBackground learner={false} progress={false} className="font-mono">
      <Learner />
      <span className="text-functional-subtitle absolute top-[21px] left-[148px] flex h-16 items-center gap-2 rounded-[24px] px-6 text-white">
        <ArrowExitIcon size={28} />
        Exit
      </span>
      <RewardProgress count={18} progress={144 / 214} className="absolute top-4 right-4" />
      <Obj step="k-surprise" id="label" className="absolute top-[91px] left-1/2 -translate-x-1/2">
        <SurpriseLabel />
      </Obj>
      <Obj step="k-surprise" id="card" className="absolute top-[172px] left-[287px]" style={{ width: 620 }}>
        <MomMessageCard
          message={choice.phrase}
          sticker={choice.sticker}
          slot={(part, node) => {
            if (part === "continue") return <Obj step="k-surprise" id="continue" hint onTap={onDone} className="rounded-[28px]">{node}</Obj>
            if (part === "close") return <Obj step="k-surprise" id="close" onTap={onDone} className="rounded-full">{node}</Obj>
            return <Obj step="k-surprise" id={part} onTap={part === "sticker" ? () => {} : undefined}>{node}</Obj>
          }}
        />
      </Obj>
    </KidBackground>
  )
}

// ─── k-success → k-share: the card stays; its content swaps with a pop ───────────
/**
 * A DOM copy of the "You are a star!" card sits over the share scene for ~0.6 s: the card grows to the share
 * card's size while its title and stars pop out, then a hole opens from the centre and reveals the share
 * content underneath (which pops in). The gold burst is redrawn on top so it never blinks.
 */
const RESULT_BOX = [288, 107, 620, 660] as const
const SHARE_BOX = [278, 102.5, 640, 680] as const
function CardSwap() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t = later(() => setGone(true), 700)
    return () => cancelLater(t)
  }, [])
  if (gone) return null
  const b = LAYOUT_CARD.burst
  const px = (v: readonly number[]) => ({ left: v[0], top: v[1], width: v[2], height: v[3] })
  return (
    <div className="pointer-events-none absolute inset-0">
      <style>{`
        @keyframes fre-swap-card { from { left:${RESULT_BOX[0]}px; top:${RESULT_BOX[1]}px; width:${RESULT_BOX[2]}px; height:${RESULT_BOX[3]}px } to { left:${SHARE_BOX[0]}px; top:${SHARE_BOX[1]}px; width:${SHARE_BOX[2]}px; height:${SHARE_BOX[3]}px } }
        @keyframes fre-swap-out { 0% { transform: scale(1); opacity: 1 } 35% { transform: scale(1.06); opacity: 1 } 100% { transform: scale(.4); opacity: 0 } }
        @property --fre-hole { syntax: "<length>"; inherits: false; initial-value: 0px; }
        @keyframes fre-swap-hole { from { --fre-hole: 0px } to { --fre-hole: 520px } }
      `}</style>
      <div
        className="absolute overflow-hidden rounded-[40px] bg-paper"
        style={{
          ...px(SHARE_BOX),
          animation: `fre-swap-card 260ms ${EASING.spring} both, fre-swap-hole 360ms cubic-bezier(.5,0,.75,0) 300ms both`,
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--fre-hole), #000 calc(var(--fre-hole) + 1px))",
          maskImage: "radial-gradient(circle at 50% 50%, transparent var(--fre-hole), #000 calc(var(--fre-hole) + 1px))",
        }}
      >
        <div className="absolute inset-0 grid place-items-center" style={{ animation: "fre-swap-out 280ms ease-in both" }}>
          <ResultCard timeline="FRE" className="bg-transparent" />
        </div>
      </div>
      <span className="absolute" style={{ left: b.cx - b.size / 2, top: b.cy - b.size / 2 }}>
        <Sticker name="burst" size={b.size} tilt={b.rot} />
      </span>
    </div>
  )
}
