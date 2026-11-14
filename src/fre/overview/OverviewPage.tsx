/** #/overview — the write-up page (Figma "Overview" 237:4827), under the site header. Edited in Editor › Overview. */
import type { ReactNode } from "react"
import { LINKS } from "@/config"
import { SiteHeader } from "../FlowPlayer"
import { OverviewDoc } from "./OverviewDoc"
import { FigmaIcon, GitHubIcon, StorybookIcon } from "./icons"

/** Figma "Main": 48 top / 128 bottom; a 204 spacer, the 720 doc column (24 side padding) and the 204 Resources column, 60 apart. */
export function OverviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-start justify-center gap-[60px] pt-12 pb-32">
      <div className="h-[148px] w-[204px] shrink-0" />
      <div className="w-[720px] shrink-0 px-6">{children}</div>
      <Resources />
    </div>
  )
}

function Resources() {
  const item = "flex items-center gap-2 text-[14px] leading-[28px] whitespace-nowrap text-[#71717a] hover:text-[#18181b]"
  return (
    <aside className="sticky top-12 flex w-[204px] shrink-0 flex-col gap-5">
      <p className="text-[14px] leading-[28px] font-semibold whitespace-nowrap text-[#71717a]">Resources</p>
      <div className="flex flex-col gap-3">
        <a className={item} href={LINKS.figma} target="_blank" rel="noreferrer"><FigmaIcon /> Share the moment figma</a>
        <a className={item} href={LINKS.storybook} target="_blank" rel="noreferrer"><StorybookIcon /> Project Storybook</a>
        <a className={item} href={LINKS.repo} target="_blank" rel="noreferrer"><GitHubIcon /> barsegal28/Share-the-moment</a>
      </div>
    </aside>
  )
}

export function OverviewPage() {
  return (
    <div className="ui-root flex h-dvh flex-col bg-white">
      <SiteHeader page="overview" step="k-glow" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <OverviewLayout>
          <OverviewDoc />
        </OverviewLayout>
      </main>
    </div>
  )
}
