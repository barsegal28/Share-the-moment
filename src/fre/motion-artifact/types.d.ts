// Types for the motion artifact's plain-JS modules (the JS itself is copied unchanged).
type MotionScene = { id: string; frameCount: number; fps: number; draw(ctx: CanvasRenderingContext2D, k: number, frame: number, cut: number): void }
declare module "*/motion-artifact/src/glowup.js" {
  export const STAGE: { width: number; height: number }
}
declare module "*/motion-artifact/src/paint.js" {
  export function makePaperGrain(w: number, h: number, seed?: number): HTMLCanvasElement
}
declare module "*/motion-artifact/src/background.js" {
  export const BACKGROUND_ASSETS: string[]
  export function createBackground(w: number, h: number, images?: Record<string, HTMLImageElement>): (ctx: CanvasRenderingContext2D, cut: number, opts?: { topbar?: boolean }) => void
}
declare module "*/motion-artifact/src/lettering.js" {
  export const LETTERING_FONT: string
}
declare module "*/motion-artifact/src/scenes/success.js" {
  export function createSuccess(o: { paperGrain: HTMLCanvasElement }): MotionScene
}
declare module "*/motion-artifact/src/scenes/share.js" {
  export const SHARE_ASSETS: string[]
  export function createShare(o: { images: Record<string, HTMLImageElement>; paperGrain: HTMLCanvasElement }): MotionScene
}
