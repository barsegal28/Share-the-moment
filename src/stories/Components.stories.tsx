import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  Avatar,
  BUTTON_ICON_SIZE,
  Button,
  CheckmarkCircleIcon,
  DismissIcon,
  IconButton,
  KidBackground,
  ParentPlay,
  ParentSendBack,
  ParentShareMoment,
  PlayButton,
  Player,
  ProgressBar,
  ResultCard,
  RewardProgress,
  ShareIcon,
  ShareIllustration,
  StarsRow,
} from "@/components/app"

/**
 * The app components, one story per Figma component and variant (page "app asets").
 * Every value — size, padding, gap, radius, type, colour, effect — is taken from the Figma node named in each story.
 */
const meta: Meta = { title: "Components" }
export default meta
type S = StoryObj

export const Buttons: S = {
  name: "Button (Flex Web, local)",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <Button iconStart={<ArrowRightIcon size={BUTTON_ICON_SIZE.xxl} />} className="w-[240px]">Play next</Button>
        <Button iconEnd={<ShareIcon size={BUTTON_ICON_SIZE.xxl} />} className="w-[240px]">Share</Button>
        <Button variant="outline-light" iconStart={<ShareIcon size={BUTTON_ICON_SIZE.xxl} />} className="w-[240px]">Share</Button>
        <Button variant="outline-light" iconStart={<CheckmarkCircleIcon size={BUTTON_ICON_SIZE.xxl} />} className="w-[240px]">Shared</Button>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Button variant="ghost" size="xl" iconStart={<ArrowClockwiseIcon size={BUTTON_ICON_SIZE.xl} />} className="w-[240px]">Play again</Button>
        <Button variant="outline" size="xl">Send Noa a surprise</Button>
        <Button variant="outline" size="xl">Send to Noa</Button>
        <IconButton label="Close"><DismissIcon size={28} /></IconButton>
      </div>
    </div>
  ),
}

export const PlayButtons: S = {
  name: "Sticker / Shape › Play",
  parameters: { sheet: "paper" },
  render: () => {
    const [on, setOn] = useState(false)
    return (
      <div className="flex items-center gap-8">
        <PlayButton size="M" playing={on} onClick={() => setOn(!on)} />
        <PlayButton size="S" />
        <PlayButton size="M" tone="tealPaper" />
        <PlayButton size="S" tone="periwinkle" />
        <PlayButton size="S" tone="orange" />
      </div>
    )
  },
}

export const ProgressBars: S = {
  name: "Progress.bar",
  parameters: { sheet: "ink" },
  render: () => (
    <div className="flex flex-col gap-8 rounded-2xl bg-periwinkle-light p-8">
      <ProgressBar kind="media" value={146 / 296} start="0:34" end="1:30" />
      <ProgressBar kind="stage" value={146 / 296} />
      <ProgressBar kind="scrub" value={0.57} start="0:34" end="1:30" className="h-10" />
    </div>
  ),
}

export const RewardProgressDark: S = {
  name: "Reward progress/Dark",
  render: () => <RewardProgress tile />,
}

export const Players: S = {
  name: "Player",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Player surface="tablet" progress={137 / 317} />
      <Player surface="mobile-blue" progress={0.5} />
      <Player surface="mobile-green" progress={0.5} />
      <Player surface="mobile-blue-large" progress={0.37} />
    </div>
  ),
}

export const Avatars: S = {
  name: "Avatars + Sticker / Avatar",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="flex items-center gap-8">
      <Avatar type="peep" size="L" character="cone" />
      <Avatar type="tile" size="L" character="wisp" />
      <Avatar type="peep" size="S" character="cone" />
      <Avatar type="tile" size="S" character="wisp" />
      <Avatar type="tile" size="L" character="gummy" />
      <Avatar type="tile" size="L" character="leaf" />
    </div>
  ),
}

export const Stars: S = {
  name: "Stars",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="flex flex-col items-start gap-8">
      <StarsRow size="L" />
      <StarsRow size="S" />
    </div>
  ),
}

export const MainDefault: S = {
  name: "main · type=main, timeline=default",
  render: () => <ResultCard />,
}
export const MainShared: S = {
  name: "main · shared (screen 5)",
  render: () => <ResultCard shared />,
}
export const MainFRE: S = {
  name: "main · type=main, timeline=FRE",
  render: () => <ResultCard timeline="FRE" />,
}
export const ShareFRE: S = {
  name: "main · type=share, timeline=FRE",
  render: () => (
    <div className="p-10">
      <ResultCard type="share" timeline="FRE" />
    </div>
  ),
}
export const Illustration: S = {
  name: "share illustration",
  parameters: { sheet: "paper" },
  render: () => <ShareIllustration />,
}

export const Background: S = {
  name: "background",
  parameters: { sheet: "none" },
  render: () => <KidBackground />,
}

export const ParentShare: S = {
  name: "Parent.Mobile · share the moment",
  parameters: { sheet: "none" },
  render: () => <ParentShareMoment />,
}
export const ParentPlaying: S = {
  name: "Parent.Mobile · play",
  parameters: { sheet: "none" },
  render: () => <ParentPlay />,
}
export const ParentComposer: S = {
  name: "Parent.Mobile · send back",
  parameters: { sheet: "none" },
  render: () => {
    const [msg, setMsg] = useState("Proud of you!")
    return <ParentSendBack message={msg} onMessage={setMsg} />
  },
}
