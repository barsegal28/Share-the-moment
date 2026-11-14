/**
 * Kid flow, iPad landscape (1194 × 834, the Figma frames 1–4 plus the send overlay and the reply).
 * One persistent scene, so the stickers that scatter out of the planet stay on the sheet and glide into place.
 */
import { useEffect, useState, type CSSProperties } from "react"
import { Sticker, type StickerName } from "@/art/stickers"
import { Obj, EASING } from "../Obj"
import { useFlow } from "../runtime"
import { KidBackground, Learner, ResultCard, RewardProgress } from "@/components/app"
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
  burst: { cx: 944, cy: 633, size: 270, rot: 100 },
}
const ORDER: StickerId[] = ["striped", "ringed", "drippy", "cloud", "burst", "heart", "spark1", "spark2", "spark3"]

const KID_STEPS: StepId[] = ["k-glow", "k-scatter", "k-success", "k-share", "k-send"]
export const isKidStep = (s: StepId) => KID_STEPS.includes(s)

export function KidScreens() {
  const flow = useFlow()
  const s = flow.step
  const layoutMs = flow.script["k-success"].params.layoutMs ?? 900

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

  const layout = s === "k-scatter" ? LAYOUT_SCATTER : LAYOUT_CARD
  const cardState: CardState | null = s === "k-success" ? "success" : null

  return (
    <KidBackground learner={false} progress={false} className="font-mono">

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

      {(cardState || s === "k-scatter") && <TopBar />}
      {cardState && <Card state={cardState} />}
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
type CardState = "success"
const CARD_POS = { left: 288, top: 107 }

function Card({ state }: { state: CardState }) {
  const flow = useFlow()
  // k-success: main · timeline=FRE (title + stars). The Shared state (Figma screen 5) is the end of the share scene.
  const step: StepId = "k-success"
  return (
    <Obj step="k-success" id="card" className="absolute" style={{ left: CARD_POS.left, top: CARD_POS.top, width: 620, height: 660 }}>
      <ResultCard
        timeline={state === "success" ? "FRE" : "default"}
        shared
        slot={(part, node) =>
          part === "title" ? (
            <Obj step={step} id="title">{node}</Obj>
          ) : (
            node
          )
        }
        renderStar={(star, i) => (
          <Obj key={i} step={step} id={`star${i + 1}`} onTap={() => {}}>
            {star}
          </Obj>
        )}
        onPlayNext={() => flow.restart()}
        onPlayAgain={() => flow.go("k-glow")}
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
const SHARE_HIT = { share: [478, 604.5, 240, 80], close: [824, 140, 64, 64], next: [478, 453.5, 240, 80], again: [478, 668, 240, 56] } as const
const box = ([left, top, width, height]: readonly number[]): CSSProperties => ({ position: "absolute", left, top, width, height })

function ShareMoment() {
  const flow = useFlow()
  const sending = flow.step === "k-send"
  const [done, setDone] = useState(false)
  useEffect(() => setDone(false), [flow.run, flow.step])
  const p = flow.script["k-send"].params
  return (
    <div className="relative h-full w-full bg-ink">
      <MotionScene
        scene="share"
        run={flow.run}
        fps={p.fps ?? 17}
        still={sending ? undefined : 0}
        onStart={() => sending && flow.signal("motionStart")}
        onDone={() => {
          if (!sending) return
          setDone(true)
          flow.signal("motionDone")
        }}
      />
      {!sending && (
        <>
          <Obj step="k-share" id="share" hint onTap={() => flow.go("k-send")} className="rounded-[28px]" style={box(SHARE_HIT.share)}>
            <span className="block h-full w-full" aria-label="Share" />
          </Obj>
          <Obj step="k-share" id="close" className="rounded-full" style={box(SHARE_HIT.close)} onTap={() => {}}>
            <span className="block h-full w-full" aria-label="Close" />
          </Obj>
        </>
      )}
      {sending && done && (
        <>
          <Obj step="k-send" id="next" className="rounded-[28px]" style={box(SHARE_HIT.next)} hint onTap={() => flow.next()}>
            <span className="block h-full w-full" aria-label="Play next" />
          </Obj>
          <Obj step="k-send" id="again" className="rounded-[20px]" style={box(SHARE_HIT.again)} onTap={() => flow.go("k-glow")}>
            <span className="block h-full w-full" aria-label="Play again" />
          </Obj>
        </>
      )}
    </div>
  )
}
