import { useState, type ReactNode } from "react"
import { Lock } from "lucide-react"
import { FitStage } from "@/components/sticker/FitStage"
import { Sheet } from "@/components/sticker/Sheet"
import { StartCurtain } from "@/components/sticker/StartCurtain"
import { MessagePreview } from "@/components/parent/MessagePreview"
import { ListenWidget } from "@/components/parent/ListenWidget"
import { ReplyComposer, ReplySent, type ReplyDraft } from "@/components/parent/ReplyComposer"
import { stopAll } from "@/lib/audio"

/**
 * Parent flow (phone, web): email or SMS → listen widget → send a reply → confirmation.
 * URL params (#/parent?…): channel=sms|email · first=1 · autostart=1
 */
type Step = "message" | "listen" | "reply" | "sent"

export function ParentFlow({ channel = "sms", firstTime = false, autostart = false }: { channel?: "sms" | "email"; firstTime?: boolean; autostart?: boolean }) {
  const [started, setStarted] = useState(autostart)
  const [step, setStep] = useState<Step>("message")
  const [draft, setDraft] = useState<ReplyDraft | null>(null)

  return (
    <FitStage width={390} height={844} background="#0b1f1b">
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
        {step === "message" ? (
          <MessagePreview channel={channel} firstTime={firstTime} onOpen={() => setStep("listen")} />
        ) : (
          <Browser>
            {step === "listen" && <ListenWidget onReply={() => setStep("reply")} replied={!!draft} />}
            {step === "reply" && <ReplyComposer onSend={(d) => { stopAll(); setDraft(d); setStep("sent") }} />}
            {step === "sent" && <ReplySent sticker={draft?.sticker ?? "heart"} onAnother={() => setStep("listen")} />}
          </Browser>
        )}
        {!started && <StartCurtain light title="Mom gets a message" subtitle="Parent flow · phone web. Tap to start." onStart={() => setStarted(true)} />}
      </div>
    </FitStage>
  )
}

function Browser({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-end justify-center bg-[#f2f2f2] px-4 pt-11 pb-2">
        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#e3e3e3] py-2 text-[13px] text-black/70">
          <Lock className="size-3" /> pianopals.app
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Sheet ground="paper" className="min-h-full">
          {children}
        </Sheet>
      </div>
    </div>
  )
}
