import { KidFlow } from "@/flows/KidFlow"
import { ParentFlow } from "@/flows/ParentFlow"
import { Showcase } from "@/showcase/Showcase"
import type { ShareVariant } from "@/components/kid/SharePrompt"
import { useHashRoute } from "@/lib/route"
import { FlowPlayer } from "@/fre/FlowPlayer"
import { Editor } from "@/fre/Editor"
import { STEP_IDS, type StepId } from "@/fre/script"

const stepParam = (p: URLSearchParams, fallback: StepId): StepId => {
  const s = p.get("step") as StepId | null
  return s && STEP_IDS.includes(s) ? s : fallback
}

const VARIANTS: ShareVariant[] = ["first", "early", "habitual", "better", "struggle", "quiet", "noContact"]

export default function App() {
  const { path, params } = useHashRoute()
  if (path.startsWith("/flow")) return <FlowPlayer key={params.get("step") ?? ""} initial={stepParam(params, "k-glow")} />
  if (path.startsWith("/editor")) return <Editor initial={stepParam(params, "k-success")} />
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
  // A standalone preview build can open straight into the flow (VITE_DEFAULT_ROUTE=flow).
  if (import.meta.env.VITE_DEFAULT_ROUTE === "flow") return <FlowPlayer initial={stepParam(params, "k-glow")} />
  return <Showcase />
}
