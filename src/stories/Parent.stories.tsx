import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { MessagePreview } from "@/components/parent/MessagePreview"
import { ListenWidget } from "@/components/parent/ListenWidget"
import { ReplyComposer, ReplySent, StickerPicker, VoiceRecorder } from "@/components/parent/ReplyComposer"
import { useState } from "react"
import type { StickerName } from "@/art/stickers"

const meta: Meta = { title: "Parent", parameters: { sheet: "paper" } }
export default meta

const Phone = ({ children, white = false }: { children: ReactNode; white?: boolean }) => (
  <div className={"h-[844px] w-[390px] overflow-y-auto rounded-[42px] shadow-2xl ring-8 ring-ink " + (white ? "bg-white" : "bg-paper")} data-sheet="paper">
    {children}
  </div>
)

export const Sms: StoryObj = { name: "MessagePreview / SMS", render: () => <Phone white><MessagePreview channel="sms" /></Phone> }
export const SmsFirst: StoryObj = { name: "MessagePreview / SMS, first message", render: () => <Phone white><MessagePreview channel="sms" firstTime /></Phone> }
export const Email: StoryObj = { name: "MessagePreview / Email", render: () => <Phone white><MessagePreview channel="email" more={2} /></Phone> }
export const EmailFirst: StoryObj = { name: "MessagePreview / Email, first message", render: () => <Phone white><MessagePreview channel="email" firstTime /></Phone> }

export const Listen: StoryObj<typeof ListenWidget> = { name: "ListenWidget", render: (a) => <Phone><ListenWidget {...a} /></Phone>, args: { kid: "Noa", attempts: 6, replied: false } }
export const ListenReplied: StoryObj = { name: "ListenWidget / Already replied", render: () => <Phone><ListenWidget replied /></Phone> }
export const ListenDesktop: StoryObj = {
  name: "ListenWidget / Larger screen",
  render: () => <div className="mx-auto max-w-xl rounded-3xl bg-paper shadow-xl"><ListenWidget /></div>,
}

export const Composer: StoryObj = { name: "ReplyComposer", render: () => <Phone><ReplyComposer /></Phone> }
export const ComposerNoCamera: StoryObj = { name: "ReplyComposer / Camera denied", render: () => <Phone><ReplyComposer cameraDenied /></Phone> }

function PickerDemo() {
  const [v, setV] = useState<StickerName>("trophy")
  return <div className="w-[340px]"><StickerPicker value={v} onChange={setV} /></div>
}
export const Picker: StoryObj = { name: "StickerPicker", render: () => <PickerDemo /> }
export const Recorder: StoryObj = { name: "VoiceRecorder", render: () => <div className="w-[340px]"><VoiceRecorder /></div> }
export const Sent: StoryObj = { name: "ReplySent", render: () => <Phone><ReplySent sticker="rocket" /></Phone> }
