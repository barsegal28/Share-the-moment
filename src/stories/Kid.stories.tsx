import type { Meta, StoryObj } from "@storybook/react-vite"
import { StarScore } from "@/components/kid/StarScore"
import { SharePrompt } from "@/components/kid/SharePrompt"
import { FamilyAvatars } from "@/components/kid/FamilyAvatars"
import { SendOverlay } from "@/components/kid/SendOverlay"
import { ParentGate, ReadyShelf } from "@/components/kid/ParentGate"
import { ReplyNotification } from "@/components/kid/ReplyNotification"
import { ReplyReveal } from "@/components/kid/ReplyReveal"
import { VoiceCaption } from "@/components/kid/VoiceCaption"
import { KidButton } from "@/components/kid/KidButton"
import { SAMPLE_REPLIES } from "@/lib/types"
import { Send } from "lucide-react"
import type { ReactNode } from "react"

const meta: Meta = { title: "Kid" }
export default meta

/** A fixed iPad-sized stage for overlays (they fill their parent). */
const Stage = ({ children }: { children: ReactNode }) => (
  <div className="relative h-[820px] w-[1180px] origin-top-left scale-[0.75] overflow-hidden rounded-3xl bg-ink">{children}</div>
)

// ── StarScore ────────────────────────────────────────────────────────────────
export const StarsAll: StoryObj<typeof StarScore> = {
  name: "StarScore / 3 stars",
  render: (a) => <StarScore {...a} />,
  args: { size: "lg", animate: false, labels: true },
  argTypes: { size: { control: "inline-radio", options: ["lg", "md", "sm"] } },
}
export const StarsAnimated: StoryObj<typeof StarScore> = { name: "StarScore / Pop in", render: () => <StarScore animate /> }
export const StarsMissing: StoryObj<typeof StarScore> = {
  name: "StarScore / Missing a star",
  render: () => <StarScore earned={{ notes: true, beat: false, hands: true }} />,
}

// ── SharePrompt ──────────────────────────────────────────────────────────────
export const ShareFirst: StoryObj<typeof SharePrompt> = {
  name: "SharePrompt / Playground",
  render: (a) => <SharePrompt {...a} />,
  args: { variant: "first", sent: false, attempts: 6 },
  argTypes: { variant: { control: "select", options: ["first", "early", "habitual", "better", "struggle", "quiet", "noContact"] } },
}
export const ShareAll: StoryObj = {
  name: "SharePrompt / All states",
  render: () => (
    <div className="grid grid-cols-2 gap-x-20 gap-y-16">
      {(["first", "early", "better", "struggle", "habitual", "quiet", "noContact"] as const).map((v) => (
        <div key={v} className="flex flex-col items-center gap-6">
          <span className="font-mono text-sm text-cream/60">{v}</span>
          <SharePrompt variant={v} />
        </div>
      ))}
      <div className="flex flex-col items-center gap-6">
        <span className="font-mono text-sm text-cream/60">sent</span>
        <SharePrompt sent />
      </div>
    </div>
  ),
}

// ── FamilyAvatars ────────────────────────────────────────────────────────────
export const Avatars: StoryObj<typeof FamilyAvatars> = {
  name: "FamilyAvatars",
  render: (a) => <FamilyAvatars {...a} />,
  args: { contacts: ["mom", "dad", "grandma"], state: "idle", size: 112 },
  argTypes: { state: { control: "inline-radio", options: ["idle", "waving", "received"] } },
}

// ── KidButton & caption ──────────────────────────────────────────────────────
export const Button: StoryObj<typeof KidButton> = {
  name: "KidButton",
  render: (a) => <KidButton {...a}><Send /> Send to Mom & Dad</KidButton>,
  args: { tone: "orange", size: "kid-lg" },
}
export const Caption: StoryObj = {
  name: "VoiceCaption",
  render: () => (
    <div className="flex flex-col gap-6">
      <VoiceCaption static={{ text: "Want Mom and Dad to hear you play?", voice: "guide" }} />
      <VoiceCaption static={{ text: "I loved hearing you play!", voice: "mom" }} />
    </div>
  ),
}

// ── Overlays ─────────────────────────────────────────────────────────────────
export const SendSending: StoryObj = { name: "SendOverlay / Sending", parameters: { sheet: "none" }, render: () => <Stage><SendOverlay status="sending" /></Stage> }
export const SendSent: StoryObj = { name: "SendOverlay / Sent", parameters: { sheet: "none" }, render: () => <Stage><SendOverlay status="sent" /></Stage> }
export const SendOffline: StoryObj = { name: "SendOverlay / Offline (same for kid)", parameters: { sheet: "none" }, render: () => <Stage><SendOverlay status="offline" /></Stage> }
export const SendLive: StoryObj = {
  name: "SendOverlay / Live animation",
  parameters: { sheet: "none" },
  render: () => <Stage><SendOverlay voice={false} onDone={() => {}} /></Stage>,
}

export const Gate: StoryObj = { name: "ParentGate / Ask a grown-up", parameters: { sheet: "none" }, render: () => <Stage><ParentGate voice={false} /></Stage> }
export const GateOpen: StoryObj = { name: "ParentGate / Grown-up setup", parameters: { sheet: "none" }, render: () => <Stage><ParentGate unlocked voice={false} /></Stage> }
export const Shelf: StoryObj = { name: "ReadyShelf", render: () => <ReadyShelf count={2} /> }

export const NotifyInApp: StoryObj = { name: "ReplyNotification / In-app", render: () => <ReplyNotification reply={SAMPLE_REPLIES[0]} /> }
export const NotifyQueue: StoryObj = { name: "ReplyNotification / Several waiting", render: () => <ReplyNotification reply={SAMPLE_REPLIES[0]} count={3} /> }
export const NotifyPush: StoryObj = { name: "ReplyNotification / Push (app closed)", render: () => <ReplyNotification kind="push" reply={SAMPLE_REPLIES[0]} /> }

export const Reveal: StoryObj = {
  name: "ReplyReveal / From Mom",
  parameters: { sheet: "none" },
  render: () => <Stage><ReplyReveal reply={SAMPLE_REPLIES[0]} autoplay={false} /></Stage>,
}
export const RevealQueue: StoryObj = {
  name: "ReplyReveal / Queue (2 of 3)",
  parameters: { sheet: "none" },
  render: () => <Stage><ReplyReveal reply={SAMPLE_REPLIES[1]} index={1} total={3} autoplay={false} /></Stage>,
}
