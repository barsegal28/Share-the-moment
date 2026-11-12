import type { Meta, StoryObj } from "@storybook/react-vite"
import { SuccessScreen } from "@/components/kid/SuccessScreen"
import { FitStage } from "@/components/sticker/FitStage"
import { KidFlow } from "@/flows/KidFlow"
import { ParentFlow } from "@/flows/ParentFlow"
import type { ShareVariant } from "@/components/kid/SharePrompt"

const meta: Meta = { title: "Screens", parameters: { sheet: "none" } }
export default meta

const Fit = ({ variant, caption, sent = false, shelf = false }: { variant: ShareVariant; caption?: string; sent?: boolean; shelf?: boolean }) => (
  <div className="h-screen bg-[#0b1f1b]">
    <FitStage width={1180} height={820}>
      <SuccessScreen variant={variant} caption={caption} sent={sent} shelf={shelf} />
    </FitStage>
  </div>
)

export const SuccessFirst: StoryObj = { name: "Success / First share", render: () => <Fit variant="first" caption="Want Mom and Dad to hear you play? Tap the orange button!" /> }
export const SuccessEarly: StoryObj = { name: "Success / Shares 2–5", render: () => <Fit variant="early" caption="Send it to Mom and Dad?" /> }
export const SuccessHabitual: StoryObj = { name: "Success / Habitual", render: () => <Fit variant="habitual" /> }
export const SuccessBetter: StoryObj = { name: "Success / Played it better", render: () => <Fit variant="better" caption="You played it even better! Send the new one?" /> }
export const SuccessStruggle: StoryObj = { name: "Success / Struggle win", render: () => <Fit variant="struggle" caption="You did it after 6 tries! Want to show Mom and Dad?" /> }
export const SuccessQuiet: StoryObj = { name: "Success / Ignored prompts", render: () => <Fit variant="quiet" /> }
export const SuccessNoContact: StoryObj = { name: "Success / No contact yet", render: () => <Fit variant="noContact" caption="Want a grown-up to hear you play?" /> }
export const SuccessShelf: StoryObj = { name: "Success / Waiting on the shelf", render: () => <Fit variant="noContact" shelf /> }
export const SuccessSent: StoryObj = { name: "Success / Sent", render: () => <Fit variant="first" sent /> }

export const KidFlowLive: StoryObj<typeof KidFlow> = {
  name: "Kid flow (interactive)",
  render: (a) => <div className="h-screen"><KidFlow {...a} /></div>,
  args: { initialVariant: "first", replies: 1 },
  argTypes: { initialVariant: { control: "select", options: ["first", "early", "habitual", "better", "struggle", "quiet", "noContact"] }, replies: { control: "inline-radio", options: [1, 3] } },
}
export const ParentFlowLive: StoryObj<typeof ParentFlow> = {
  name: "Parent flow (interactive)",
  render: (a) => <div className="h-screen"><ParentFlow {...a} /></div>,
  args: { channel: "sms", firstTime: true },
  argTypes: { channel: { control: "inline-radio", options: ["sms", "email"] } },
}
