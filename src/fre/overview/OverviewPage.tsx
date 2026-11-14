/** #/overview — the write-up page, under the site header. Its text is edited in the Editor tab (Overview). */
import { SiteHeader } from "../FlowPlayer"
import { OverviewDoc } from "./OverviewDoc"

export function OverviewPage() {
  return (
    <div className="ui-root flex h-dvh flex-col bg-white">
      <SiteHeader page="overview" step="k-glow" />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <OverviewDoc />
      </main>
    </div>
  )
}
