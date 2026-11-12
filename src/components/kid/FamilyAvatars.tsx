import { Check } from "lucide-react"
import { Sticker } from "@/art/stickers"
import { cn } from "@/lib/utils"

export type Contact = "mom" | "dad" | "grandma"
export type AvatarState = "idle" | "waving" | "received"

/**
 * The people the recording goes to — set up by a parent, never picked by the kid.
 * People are faces, not names: "Mom" is her face.
 */
export function FamilyAvatars({
  contacts = ["mom", "dad"],
  state = "idle",
  size = 112,
  className,
}: {
  contacts?: Contact[]
  state?: AvatarState
  size?: number
  className?: string
}) {
  const tilts = [-8, 7, -4]
  return (
    <div className={cn("flex items-center", className)} style={{ gap: size * 0.18 }}>
      {contacts.map((c, i) => (
        <div key={c} className="relative">
          <Sticker
            name={c}
            size={size}
            tilt={tilts[i % 3]}
            motion={state === "waving" ? "wiggle" : "none"}
            style={state === "waving" ? { animationDelay: `${i * 250}ms` } : undefined}
          />
          {state === "received" && (
            <span
              className="animate-pop-in sticker absolute -right-1 -bottom-1 grid place-items-center rounded-full bg-teal text-cream [--kiss:var(--sticker-orange)]"
              style={{ width: size * 0.36, height: size * 0.36, animationDelay: `${i * 220}ms` }}
              aria-label="Sent"
            >
              <Check strokeWidth={4} style={{ width: size * 0.22, height: size * 0.22 }} />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
