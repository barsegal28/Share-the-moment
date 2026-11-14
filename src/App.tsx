import { useHashRoute } from "@/lib/route"
import { FlowPlayer } from "@/fre/FlowPlayer"
import { Editor } from "@/fre/Editor"
import { STEP_IDS, type StepId } from "@/fre/script"

const stepParam = (p: URLSearchParams, fallback: StepId): StepId => {
  const s = p.get("step") as StepId | null
  return s && STEP_IDS.includes(s) ? s : fallback
}

/** Two pages: the flow (#/flow, the default) and the editor (#/editor). */
export default function App() {
  const { path, params } = useHashRoute()
  if (path.startsWith("/editor")) return <Editor initial={stepParam(params, "k-success")} />
  return <FlowPlayer key={params.get("step") ?? ""} initial={stepParam(params, "k-glow")} />
}
