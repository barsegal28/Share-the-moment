import { useLayoutEffect, useRef, useState } from "react"
import { Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A live, interactive embed of the app inside a device frame.
 * The iframe renders at the device's real size and is scaled down to fit the column.
 */
export function DeviceFrame({
  src,
  width,
  height,
  device,
  title,
  className,
}: {
  src: string
  width: number
  height: number
  device: "ipad" | "phone"
  title: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  const bezel = device === "ipad" ? 22 : 14
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="w-full rounded-[44px] bg-[#0a1714] shadow-[0_24px_60px_rgb(0_0_0/0.45),inset_0_0_0_2px_rgb(237_226_194/0.12)]"
        style={{ padding: bezel, borderRadius: device === "ipad" ? 44 : 54 }}
      >
        <div ref={ref} className="relative w-full overflow-hidden bg-black" style={{ height: height * scale, borderRadius: device === "ipad" ? 24 : 42 }}>
          <iframe
            src={src}
            title={title}
            width={width}
            height={height}
            className="absolute top-0 left-0 origin-top-left border-0"
            style={{ transform: `scale(${scale})` }}
            allow="autoplay"
          />
        </div>
      </div>
      <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream/70 hover:text-cream">
        <Maximize2 className="size-3.5" /> Open full screen
      </a>
    </div>
  )
}
