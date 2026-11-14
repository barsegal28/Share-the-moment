/**
 * "Little Pianist" — Mom's player on the listen sheet: the kid's take as animated sheet music over a keyboard,
 * with its own piano sound. Built from the claude.ai artifact of the same name (little-pianist.js).
 * The canvas keeps the artifact's 1200 × 840 drawing; the sheet's cover frame shows its top (staff + keyboard).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { mountLittlePianist } from "./little-pianist.js"

export interface LittlePianistHandle {
  play(): void
  pause(): void
  /** Seconds into the take, and its length. */
  readonly time: number
  readonly end: number
  readonly playing: boolean
}

export const LittlePianist = forwardRef<LittlePianistHandle, { className?: string }>(function LittlePianist({ className }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const api = useRef<ReturnType<typeof mountLittlePianist> | null>(null)
  useEffect(() => {
    if (!root.current) return
    api.current = mountLittlePianist(root.current)
    return () => {
      api.current?.destroy()
      api.current = null
    }
  }, [])
  useImperativeHandle(ref, () => ({
    play: () => api.current?.play(),
    pause: () => api.current?.pause(),
    get time() { return api.current?.time ?? 0 },
    get end() { return api.current?.end ?? 0 },
    get playing() { return api.current?.playing ?? false },
  }), [])
  return (
    <div ref={root} className={className}>
      <canvas id="lp-cv" className="block aspect-[1200/840] w-full" aria-label="Animated sheet music and piano keyboard playing the song" />
      {/* The artifact's own controls; the sheet drives them. */}
      <div hidden>
        <button id="lp-start" type="button" />
        <button id="lp-pp" type="button" />
        <button id="lp-restart" type="button" />
        <button id="lp-take" type="button" />
      </div>
    </div>
  )
})
