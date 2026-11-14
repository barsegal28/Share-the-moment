/**
 * Figma "background" (95:8545): the kid's iPad sheet, 1194 × 834.
 * Ink base with the Riso grain, the confetti bits (frame at 24,39, 50% opacity: white and #FF9600 dots, three
 * white dashes and one green dash), the learner (avatar tile + name) top left and Reward progress top right.
 */
import type { ReactNode } from "react"
import { RisoGrain } from "@/components/sticker/Sheet"
import { cn } from "@/lib/utils"
import { Avatar, type AvatarCharacter } from "./Avatar"
import { RewardProgress } from "./RewardProgress"

export const KID_STAGE = { w: 1194, h: 834 }

/** x, y, dot size (0 = dash), rotation, kind: w white dot · o orange dot · wl white dash · gl green dash */
const BITS: [number, number, number, number, "w" | "o" | "wl" | "gl"][] = [
  [1010.5, 49.2, 5.7, 0, "o"],
  [790.7, 126.8, 0, 0, "wl"],
  [975.4, 133.8, 5.9, 0, "w"],
  [577.9, 224, 0, 0, "gl"],
  [380.2, 256.8, 5.8, 0, "w"],
  [261.9, 0, 5.8, 0, "w"],
  [846.3, 312, 5.8, 0, "w"],
  [0, 252, 5.8, 0, "w"],
  [102.6, 55, 5.8, 0, "w"],
  [600, 361.2, 5.7, 0, "o"],
  [481.8, 104.3, 5.7, 0, "o"],
  [1066.2, 416.3, 5.7, 0, "o"],
  [219.9, 356.3, 5.7, 0, "o"],
  [565, 445.8, 5.9, 0, "w"],
  [39.1, 489.8, 5.8, 0, "w"],
  [720.4, 503, 5.9, 0, "w"],
  [693.8, 539.8, 5.8, 0, "w"],
  [259, 594.2, 5.7, 0, "o"],
  [913.7, 644.2, 5.7, 0, "o"],
  [414.4, 651.3, 5.7, 0, "o"],
  [39.2, 671.8, 0, 0, "wl"],
  [223.9, 678.8, 5.9, 0, "w"],
  [405.2, 276.1, 5.8, 15.2, "w"],
  [286.9, 19.3, 5.8, 15.2, "w"],
  [871.3, 331.3, 5.8, 15.2, "w"],
  [25, 271.3, 5.8, 15.2, "w"],
  [127.6, 74.3, 5.8, 15.2, "w"],
  [643.8, 319.2, 5.7, 15.2, "o"],
  [525.6, 62.4, 5.7, 15.2, "o"],
  [1110, 374.4, 5.7, 15.2, "o"],
  [263.7, 314.4, 5.7, 15.2, "o"],
  [631.2, 410.3, 5.9, 15.2, "w"],
  [512.9, 153.5, 5.9, 15.2, "w"],
  [1097.3, 465.5, 5.9, 15.2, "w"],
  [251, 405.5, 5.9, 15.2, "w"],
  [450.8, 452, 0, 15.2, "wl"],
  [524.8, 363.8, 5.8, 0, "w"],
  [406.6, 107, 5.8, 0, "w"],
  [991, 419, 5.8, 0, "w"],
  [144.7, 359, 5.8, 0, "w"],
]
const DASH = "M0.6 6.9L18.5 3.2L17.8 0L0 3.9Z"

export function ConfettiBits({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute", className)} style={{ left: 24, top: 39, opacity: 0.5 }} width={1117} height={685} overflow="visible">
      {BITS.map(([x, y, s, r, k], i) => {
        const fill = k === "o" ? "#FF9600" : k === "gl" ? "#00A92A" : "#FFFFFF"
        const t = `translate(${x} ${y})${r ? ` rotate(${r})` : ""}`
        return s ? <circle key={i} cx={s / 2} cy={s / 2} r={s / 2} fill={fill} transform={t} /> : <path key={i} d={DASH} fill={fill} transform={t} />
      })}
    </svg>
  )
}

export function Learner({ name = "Noa", character = "cone" }: { name?: string; character?: AvatarCharacter }) {
  return (
    <div className="absolute top-7 left-8 flex items-center gap-3.5">
      <Avatar character={character} />
      <p className="text-mono-lg text-white">{name}</p>
    </div>
  )
}

export function KidBackground({
  learner = true,
  progress = true,
  rewardCount,
  rewardProgress,
  className,
  children,
}: {
  learner?: boolean
  progress?: boolean
  rewardCount?: number
  rewardProgress?: number
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-ink", className)} style={{ width: KID_STAGE.w, height: KID_STAGE.h }}>
      <RisoGrain className="-z-10" />
      <ConfettiBits />
      {learner && <Learner />}
      {progress && <RewardProgress count={rewardCount} progress={rewardProgress} className="absolute top-4 right-4" />}
      {children}
    </div>
  )
}
