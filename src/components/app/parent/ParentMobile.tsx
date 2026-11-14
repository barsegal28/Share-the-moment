/**
 * Figma "Parent.Mobile" (129:4277), 393 × 650 — the page Mom opens from the SMS link.
 *   share the moment (129:4276) — the paper sheet, "Listen to me play, MOM!", the song row and
 *                                 "Send Noa a surprise" (outline, XL) at top 559.
 *   play (129:4275)             — the same page under the bottom sheet that plays the recording.
 *   send back (129:4278)        — the composer: header, the sticker card with the editable message tag,
 *                                 the toolbar and "Send to Noa".
 */
import { useState, type ReactNode } from "react"
import { Sticker, type StickerName } from "@/art/stickers"
import { cn } from "@/lib/utils"
import { BackButton, Button, IconButton } from "../Button"
import { CameraIcon, CheckmarkCircleIcon, CollectionsIcon, DismissSmallIcon, MicIcon, StickerIcon } from "../icons"
import { PlayButton } from "../PlayButton"
import { ProgressBar } from "../ProgressBar"
import { KidHeadline, PARENT_STAGE, ParentPaperSheet, ParentSongRow, ScoreRow, SongInfo } from "./ParentParts"
import cover from "../art/song-cover.png"

const same = (_: string, n: ReactNode) => n
type Slot = (part: string, node: ReactNode) => ReactNode

// ─── share the moment ────────────────────────────────────────────────────────
export function ParentShareMoment({
  onPlay,
  onSendBack,
  playing,
  slot = same,
}: {
  onPlay?: () => void
  onSendBack?: () => void
  playing?: boolean
  slot?: Slot
}) {
  return (
    <ParentPaperSheet slot={slot}>
      <div className="absolute" style={{ left: 39, top: 279 }}>{slot("headline", <KidHeadline />)}</div>
      <div className="absolute -translate-x-1/2" style={{ left: "calc(50% + 9.5px)", top: 417 }}>
        {slot("song", <ParentSongRow onPlay={onPlay} playing={playing} />)}
      </div>
      <div className="absolute -translate-x-1/2" style={{ left: "calc(50% - 5px)", top: 559 }}>
        {slot(
          "sendBack",
          <Button variant="outline" size="xl" onClick={onSendBack}>
            Send Noa a surprise
          </Button>,
        )}
      </div>
    </ParentPaperSheet>
  )
}

// ─── play: the bottom sheet ──────────────────────────────────────────────────
export function ListenSheet({
  progress = 0.57,
  current = "0:34",
  total = "1:30",
  playing,
  onPlay,
  onClose,
  note = "It took 6 tries but I kept going until both hands were together!",
  slot = same,
  className,
}: {
  progress?: number
  current?: string
  total?: string
  playing?: boolean
  onPlay?: () => void
  onClose?: () => void
  note?: string
  slot?: Slot
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 flex h-[630px] w-[393px] -translate-x-1/2 flex-col items-start gap-10 overflow-hidden rounded-t-[20px] bg-cream px-6 pt-12 pb-10 shadow-[0_-2px_9.9px_2px_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-5">
        {slot(
          "cover",
          <div className="relative h-[210px] w-full overflow-hidden rounded-[20px] border border-gold bg-white">
            <img src={cover} alt="Let it go — sheet music and keyboard" className="absolute top-[-1px] left-1/2 h-[196px] w-[345px] -translate-x-1/2" />
          </div>,
        )}
        <div className="flex w-full flex-col items-start px-1">
          <div className="flex w-full flex-col items-start gap-3">
            <p className="text-title-md whitespace-nowrap text-teal">Let it go</p>
            <div className="flex w-full flex-col items-start gap-1">
              <SongInfo fromWidth={58} />
              <ScoreRow />
            </div>
          </div>
          {slot(
            "playback",
            <div className="flex w-full items-end gap-5">
              <ProgressBar kind="scrub" value={progress} start={current} end={total} className="h-10 min-w-px flex-1" />
              <PlayButton size="S" tone="orange" playing={playing} onClick={onPlay} />
            </div>,
          )}
        </div>
      </div>
      {slot(
        "note",
        <div className="flex w-[320px] flex-col items-start gap-2 px-1">
          <p className="text-mono-md whitespace-nowrap text-gold">I got 3 stars!</p>
          <p className="text-paragraph-body w-full text-gold/90">{note}</p>
        </div>,
      )}
      <IconButton size={40} label="Close" onClick={onClose} className="absolute top-2 right-2">
        <DismissSmallIcon size={20} />
      </IconButton>
    </div>
  )
}

export function ParentPlay(props: Parameters<typeof ListenSheet>[0]) {
  return (
    <div className="relative overflow-hidden" style={{ width: PARENT_STAGE.w, height: PARENT_STAGE.h }}>
      <ParentShareMoment />
      <ListenSheet {...props} />
    </div>
  )
}

// ─── send back: the composer ─────────────────────────────────────────────────
export type ComposerTool = "sticker" | "voice" | "video"

/**
 * The editable "Proud of you!" tag. Figma annotations: "text editor" and "wrap text: when the line gets to the
 * maximum width, break to a new line". Blue 1px frame, padding 2/6, 6px handles at the sides; it grows with the
 * text up to the card's content width (275) and then wraps.
 */
export function MessageTag({ value, onChange, maxLength = 40 }: { value: string; onChange?: (v: string) => void; maxLength?: number }) {
  return (
    <span className="relative inline-flex max-w-[275px] items-center justify-center gap-2 border border-blue px-1.5 py-0.5">
      <textarea
        aria-label="Message"
        rows={1}
        value={value}
        maxLength={maxLength}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value.replace(/\n/g, " "))}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        onFocus={(e) => e.target.select()}
        style={{ fieldSizing: "content" } as React.CSSProperties}
        className="text-title-md block max-w-[261px] min-w-[3ch] resize-none overflow-hidden bg-transparent text-center break-words text-teal uppercase caret-grey outline-none"
      />
      <span aria-hidden className="absolute top-3 left-[-3.5px] size-1.5 rounded-full border border-blue bg-white" />
      <span aria-hidden className="absolute top-3 right-[-4px] size-1.5 rounded-full border border-blue bg-white" />
    </span>
  )
}

export type SendState = "idle" | "sending" | "sent"

/**
 * "Send to Noa" (outline, XL). Figma annotation: "send confirmation — add a spinner animation and then pop the
 * check icon". sending: a 28px spinner in the label colour; sent: Checkmark Circle (28, filled) pops in, label "Sent".
 */
export function SendButton({ state = "idle", onClick, label = "Send to Noa" }: { state?: SendState; onClick?: () => void; label?: string }) {
  return (
    <Button
      variant="outline"
      size="xl"
      onClick={state === "idle" ? onClick : undefined}
      aria-live="polite"
      aria-busy={state === "sending" || undefined}
      iconStart={
        state === "sending" ? (
          <span aria-hidden className="block size-7 animate-spin rounded-full border-[3px] border-current border-t-transparent" />
        ) : state === "sent" ? (
          <CheckmarkCircleIcon size={28} className="animate-[pop-check_420ms_cubic-bezier(0.34,1.56,0.64,1)_both]" />
        ) : undefined
      }
    >
      {state === "sent" ? "Sent" : label}
    </Button>
  )
}

/** The 319 × 328 sticker card: paper, 2px periwinkle border, radius 40, padding 40/20/20. */
export function StickerCard({
  message,
  onMessage,
  sticker = "stripedPlanet",
  onSticker,
  tool = "sticker",
  slot = same,
}: {
  message: string
  onMessage?: (v: string) => void
  sticker?: StickerName
  onSticker?: () => void
  tool?: ComposerTool
  slot?: Slot
}) {
  return (
    <div className="relative flex h-[328px] w-[319px] shrink-0 flex-col items-center justify-between rounded-[40px] border-2 border-periwinkle bg-paper px-5 pt-10 pb-5">
      {slot("tag", <MessageTag value={message} onChange={onMessage} />)}
      {tool === "sticker" ? (
        slot(
          "sticker",
          <button type="button" onClick={onSticker} aria-label="Change sticker" className="grid size-[229.45px] shrink-0 place-items-center">
            <Sticker name={sticker} size={203.154} tilt={-8} />
          </button>,
        )
      ) : (
        <div className="text-mono-md grid size-[229.45px] place-items-center text-center text-gold">
          <div className="flex flex-col items-center gap-3">
            <span className="grid size-24 place-items-center rounded-full bg-orange text-white">{tool === "voice" ? <MicIcon size={44} /> : <CameraIcon size={44} />}</span>
            {tool === "voice" ? "Hold to record a message" : "Tap to record a short video"}
          </div>
        </div>
      )}
      {/* Figma annotation: keep the sparkle, don't turn it into an avatar. */}
      <div className="absolute size-[71px]" style={{ left: 26, top: 230 }}>{slot("sparkle", <Sticker name="sparkle" size={71} />)}</div>
      <span className="absolute right-3.5 bottom-[13.5px] text-[var(--fluent-icon-default)]"><CollectionsIcon size={24} /></span>
    </div>
  )
}

/** Sticker / Voice / Video tools: 16 apart; the selected one sits on a 44px gold-light tile (radius 12). */
export function ComposerToolbar({ tool, onTool }: { tool: ComposerTool; onTool?: (t: ComposerTool) => void }) {
  const items: [ComposerTool, ReactNode, string][] = [
    ["sticker", <StickerIcon key="s" size={32} />, "Sticker"],
    ["voice", <MicIcon key="v" size={36} />, "Voice message"],
    ["video", <CameraIcon key="c" size={32} />, "Video"],
  ]
  return (
    <div className="flex items-center gap-4 overflow-clip pr-1.5 text-[var(--fluent-icon-default)]">
      {items.map(([t, icon, label]) => (
        <button
          key={t}
          type="button"
          aria-label={label}
          aria-pressed={tool === t}
          onClick={() => onTool?.(t)}
          className={cn("relative grid shrink-0 place-items-center overflow-visible", tool === t ? "size-11 rounded-[12px] bg-gold-light" : "size-8")}
        >
          <span className={cn(t === "voice" && "absolute top-0 left-0")}>{icon}</span>
        </button>
      ))}
    </div>
  )
}

export function ParentSendBack({
  message = "Proud of you!",
  onMessage,
  sticker,
  onSticker,
  onSend,
  onBack,
  sendState = "idle",
  slot = same,
}: {
  /** The send confirmation (Figma 187:9339): idle → sending (spinner) → sent (check). */
  sendState?: SendState
  /** Back to the message page (the outline Back button above the header). */
  onBack?: () => void
  message?: string
  onMessage?: (v: string) => void
  sticker?: StickerName
  onSticker?: () => void
  onSend?: () => void
  slot?: Slot
}) {
  const [tool, setTool] = useState<ComposerTool>("sticker")
  return (
    <div className="flex flex-col items-center justify-between overflow-clip bg-cream px-5 pt-5 pb-10" style={{ width: PARENT_STAGE.w, height: PARENT_STAGE.h }}>
      {slot(
        "header",
        <div className="flex w-full flex-col items-start gap-[19px]">
          {slot("back", <BackButton onClick={onBack} />)}
          <div className="flex w-full flex-col items-start gap-1">
            <p className="text-mono-lg w-[306px] text-gold">Tell Noa you’re proud</p>
            <p className="text-paragraph-body w-full text-gold/80">It pops up for Noa with a sound.</p>
          </div>
        </div>,
      )}
      <div className="flex flex-col items-center gap-7">
        {slot("card", <StickerCard message={message} onMessage={onMessage} sticker={sticker} onSticker={onSticker} tool={tool} slot={slot} />)}
        {slot("toolbar", <ComposerToolbar tool={tool} onTool={setTool} />)}
      </div>
      {slot("send", <SendButton state={sendState} onClick={onSend} />)}
    </div>
  )
}
