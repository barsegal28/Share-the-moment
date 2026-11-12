import { KidFlow } from "@/flows/KidFlow"
import { ParentFlow } from "@/flows/ParentFlow"
import { Showcase } from "@/showcase/Showcase"
import type { ShareVariant } from "@/components/kid/SharePrompt"
import { useHashRoute } from "@/lib/route"

const VARIANTS: ShareVariant[] = ["first", "early", "habitual", "better", "struggle", "quiet", "noContact"]

export default function App() {
  const { path, params } = useHashRoute()
  if (path.startsWith("/kid")) {
    const v = params.get("variant") as ShareVariant | null
    return (
      <div className="h-dvh">
        <KidFlow
          key={params.toString()}
          initialVariant={v && VARIANTS.includes(v) ? v : "first"}
          replies={Number(params.get("replies") ?? 1)}
          autostart={params.get("autostart") === "1"}
        />
      </div>
    )
  }
  if (path.startsWith("/parent")) {
    return (
      <div className="h-dvh">
        <ParentFlow
          key={params.toString()}
          channel={params.get("channel") === "email" ? "email" : "sms"}
          firstTime={params.get("first") === "1"}
          autostart={params.get("autostart") === "1"}
        />
      </div>
    )
  }
  return <Showcase />
}
