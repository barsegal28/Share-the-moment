import { useHashRoute } from "@/lib/route"
import { FlowPlayer, type FlowMode } from "@/fre/FlowPlayer"
import { Editor } from "@/fre/Editor"
import { OverviewPage } from "@/fre/overview/OverviewPage"
import { STEP_IDS, type StepId } from "@/fre/script"

const stepParam = (p: URLSearchParams, fallback: StepId): StepId => {
  const s = p.get("step") as StepId | null
  return s && STEP_IDS.includes(s) ? s : fallback
}

/** Pages: Overview (#/overview, the default — the write-up), Kid flow (#/kid), Parent flow (#/parent), the whole flow (#/flow), Editor (#/editor). */
export default function App() {
  const { path, params } = useHashRoute()
  if (path.startsWith("/editor")) return <Editor initial={stepParam(params, "k-success")} page={params.get("page") === "overview" ? "overview" : "screens"} />
  if (!path.startsWith("/kid") && !path.startsWith("/parent") && !path.startsWith("/flow")) return <OverviewPage />
  const mode: FlowMode = path.startsWith("/kid") ? "kid" : path.startsWith("/parent") ? "parent" : "overview"
  const step = params.get("step") as StepId | null
  return <FlowPlayer key={`${mode}:${step ?? ""}`} mode={mode} initial={step && STEP_IDS.includes(step) ? step : undefined} />
}
