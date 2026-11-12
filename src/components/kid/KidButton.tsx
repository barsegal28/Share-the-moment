import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { sfx } from "@/lib/audio"

/** Every tap gets sound and motion feedback (design rule). A sticker Button at kid size. */
export function KidButton({
  size = "kid",
  tone = "orange",
  quiet = false,
  onPointerDown,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & { quiet?: boolean }) {
  return (
    <Button
      variant="sticker"
      size={size}
      tone={tone}
      onPointerDown={(e) => {
        if (!quiet) sfx.tap()
        onPointerDown?.(e)
      }}
      {...props}
    />
  )
}
