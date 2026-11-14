import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/** The Figma text styles are single utilities (index.css). Tell tailwind-merge they are type styles, not colours. */
const TYPE_STYLES = [
  "display-hero", "display", "title-lg", "title-md", "title-sm",
  "mono-xl", "mono-lg", "mono-md", "mono-sm", "paragraph-title", "paragraph-body",
  "functional-title-sm", "functional-subtitle",
]
const twMerge = extendTailwindMerge({ extend: { classGroups: { "font-size": [{ text: TYPE_STYLES }] } } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
