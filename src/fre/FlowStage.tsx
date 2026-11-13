/** The device the current step runs on (iPad for the kid, iPhone for the parent), scaled to fit. */
import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useCaption } from "@/lib/audio"
import { useFlow } from "./runtime"
import { KidScreens, IPAD } from "./kid/KidScreens"
import { ParentScreens, PHONE } from "./parent/ParentScreens"

export function FlowStage({ className, captions = true }: { className?: string; captions?: boolean }) {
  const flow = useFlow()
  const device = flow.cfg.device
  const size = device === "ipad" ? IPAD : PHONE
  const bezel = device === "ipad" ? 26 : 14
  const outer = { w: size.w + bezel * 2, h: size.h + bezel * 2 }
  const box = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(0.5)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setK(Math.min(el.clientWidth / outer.w, el.clientHeight / outer.h)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [outer.w, outer.h])

  return (
    <div ref={box} className={cn("relative h-full w-full", className)}>
      <div
        key={device}
        className="absolute top-1/2 left-1/2 animate-[fre-device-in_520ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
        style={{ width: outer.w, height: outer.h, transform: `translate(-50%, -50%) scale(${k})` }}
      >
        <div
          className="h-full w-full bg-[#0a1714] shadow-[0_30px_80px_rgb(0_0_0/0.5),inset_0_0_0_2px_rgb(237_226_194/0.14)]"
          style={{ padding: bezel, borderRadius: device === "ipad" ? 52 : 64 }}
        >
          <div data-fre-stage data-w={size.w} className="relative overflow-hidden bg-black" style={{ width: size.w, height: size.h, borderRadius: device === "ipad" ? 28 : 52 }}>
            {device === "ipad" ? <KidScreens /> : <ParentScreens />}
          </div>
        </div>
      </div>
      {captions && <Caption device={device} />}
    </div>
  )
}

/** Voice-over captions: text is a backup, never the only cue. */
function Caption({ device }: { device: "ipad" | "phone" }) {
  const c = useCaption()
  if (!c) return null
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-6", device === "phone" && "bottom-1")}>
      <p className="max-w-[720px] rounded-2xl bg-black/70 px-5 py-2.5 text-center text-[17px] font-semibold text-cream shadow-lg backdrop-blur">
        <span className="mr-2 text-[13px] font-bold tracking-wider text-periwinkle uppercase">{c.voice === "guide" ? "Voice-over" : c.voice}</span>
        {c.text}
      </p>
    </div>
  )
}
