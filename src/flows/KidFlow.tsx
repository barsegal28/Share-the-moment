import { useEffect, useRef, useState } from "react"
import { FitStage } from "@/components/sticker/FitStage"
import { StartCurtain } from "@/components/sticker/StartCurtain"
import { SuccessScreen } from "@/components/kid/SuccessScreen"
import { SendOverlay } from "@/components/kid/SendOverlay"
import { ParentGate } from "@/components/kid/ParentGate"
import { ReplyNotification } from "@/components/kid/ReplyNotification"
import { ReplyReveal } from "@/components/kid/ReplyReveal"
import { STAR_INFO, type StarKey } from "@/components/kid/StarScore"
import type { ShareVariant } from "@/components/kid/SharePrompt"
import type { Contact } from "@/components/kid/FamilyAvatars"
import { playRecording, sfx, speak, stopAll } from "@/lib/audio"
import { SAMPLE_REPLIES } from "@/lib/types"

/**
 * Kid flow (iPad landscape):
 * success → stars + voice-over → share suggestion → send animation → … → reply notification → reply reveal
 *
 * URL params (#/kid?…): variant=first|early|habitual|better|struggle|quiet|noContact · replies=1|3 · autostart=1
 */
const SHARE_LINE: Record<ShareVariant, string | null> = {
  first: "Want Mom and Dad to hear you play? Tap the orange button!",
  early: "Send it to Mom and Dad?",
  better: "You played it even better! Send the new one?",
  struggle: "You did it after 6 tries! Want to show Mom and Dad?",
  habitual: null,
  quiet: null,
  noContact: "Want a grown-up to hear you play?",
}

type Phase = "curtain" | "celebrate" | "sending" | "sent" | "gate" | "reveal"

export function KidFlow({ initialVariant = "first", replies = 1, autostart = false }: { initialVariant?: ShareVariant; replies?: number; autostart?: boolean }) {
  const [variant, setVariant] = useState<ShareVariant>(initialVariant)
  const [phase, setPhase] = useState<Phase>(autostart ? "celebrate" : "curtain")
  const [run, setRun] = useState(0) // bump to replay the sequence
  const [showShare, setShowShare] = useState(false)
  const [shelf, setShelf] = useState(false)
  const [notify, setNotify] = useState(false)
  const [replyIdx, setReplyIdx] = useState(0)
  const [contacts, setContacts] = useState<Contact[]>(["mom", "dad"])
  const [seen, setSeen] = useState(false)
  const token = useRef(0)
  const earned: Record<StarKey, boolean> = { notes: true, beat: true, hands: true }

  useEffect(() => setVariant(initialVariant), [initialVariant])

  // The success sequence: "You did it!" with the stars, then the recording very quietly, then the share suggestion.
  useEffect(() => {
    if (phase !== "celebrate") return
    const my = ++token.current
    const alive = () => token.current === my
    setShowShare(false)
    ;(async () => {
      sfx.success()
      await wait(250)
      if (!alive()) return
      await speak("You did it!")
      if (!alive()) return
      await speak((Object.keys(earned) as StarKey[]).map((k) => STAR_INFO[k].voice).join(" "))
      if (!alive()) return
      if (variant !== "habitual" && variant !== "quiet") playRecording({ volume: 0.16, loop: true })
      setShowShare(true)
      const line = SHARE_LINE[shelf ? "noContact" : variant]
      if (line) await speak(line)
      else sfx.pop()
    })()
    return () => { token.current++ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, run])

  // A reply arrives a little while after sending (simulated parent).
  useEffect(() => {
    if (phase !== "sent" || seen) return
    const t = window.setTimeout(() => {
      setNotify(true)
      sfx.chime()
      void speak(replies > 1 ? `You have ${replies} surprises!` : "Mom sent you a surprise!", "guide")
    }, 3800)
    return () => clearTimeout(t)
  }, [phase, replies, seen])

  const restart = () => {
    stopAll()
    setNotify(false)
    setReplyIdx(0)
    setSeen(false)
    setPhase("celebrate")
    setRun((r) => r + 1)
  }

  const share = () => {
    stopAll()
    token.current++
    if (variant === "noContact" || shelf) setPhase("gate")
    else setPhase("sending")
  }

  const queue = SAMPLE_REPLIES.slice(0, Math.max(1, Math.min(3, replies)))

  return (
    <FitStage width={1180} height={820} background="#0b1f1b">
      <SuccessScreen
        variant={shelf ? "noContact" : variant}
        contacts={contacts}
        animate={phase === "celebrate"}
        showShare={showShare || phase !== "celebrate"}
        sent={phase === "sent" || phase === "reveal"}
        shelf={shelf}
        earned={earned}
        onShare={share}
        onPlayAgain={restart}
        onNextSong={restart}
        onClose={restart}
        key={run}
      >
        {phase === "sending" && <SendOverlay contacts={contacts} firstTime={variant === "first"} onDone={() => setPhase("sent")} />}

        {phase === "gate" && (
          <ParentGate
            onLater={() => { setShelf(true); setPhase("celebrate"); setRun((r) => r + 1) }}
            onAddFamily={() => { setShelf(false); setContacts(["mom", "dad"]); setVariant("first"); setPhase("sending") }}
          />
        )}

        {notify && phase === "sent" && (
          <div className="absolute inset-x-0 top-6 z-30 flex justify-center">
            <ReplyNotification reply={queue[0]} count={queue.length} onOpen={() => { stopAll(); setNotify(false); setReplyIdx(0); setPhase("reveal") }} />
          </div>
        )}

        {phase === "reveal" && (
          <ReplyReveal
            reply={queue[replyIdx]}
            index={replyIdx}
            total={queue.length}
            onNext={() => setReplyIdx((i) => i + 1)}
            onDone={() => { setSeen(true); setPhase("sent"); setNotify(false) }}
          />
        )}
      </SuccessScreen>

      {phase === "curtain" && (
        <StartCurtain
          title="Noa just earned 3 stars!"
          subtitle="Kid flow · iPad landscape. Tap to play it with sound."
          onStart={() => setPhase("celebrate")}
        />
      )}
    </FitStage>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
