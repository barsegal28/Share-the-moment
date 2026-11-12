# Sticker (die-cut vinyl stickers)

The visual language of this project — the sister language of Paper Cut (Snip, Overprint, Scrapbook).
It has clean shapes, not paper cuts. Colours belong to the language: pick it and use its palette as it is.

## Shapes
Smooth, clean vector curves with no torn or faceted edges. Details like eyes, smiles, sparkles and hearts can be thin round-capped lines.

## Die-cut
Every object is one sticker. It gets a **9px cream border** (`#EDE2C2`) that follows the object's silhouette with rounded corners. A thin **3.5px coloured kiss-cut edge** sits outside the border, in a palette colour that contrasts with the art.

In code: `<StickerArt>` for SVG art, the `sticker` utility for boxes (buttons, cards).

## Lift
A soft shadow under each sticker: 7px down, 5px blur, 38% black. On light grounds the shadow drops to 20%.

## Sheet
Stickers are scattered and tilted about ±15°. The ground is ink (`#112F29`, used by this project), plain warm off-white (`#F7F2E6`, used for the parent web pages) or notebook paper (`#FBF9F2` with periwinkle rules, a pink margin and punched holes).

## Grain
The riso grain goes on the sheet only. The stickers stay clean. It matches the Figma effect style **Paper Cut/Riso grain**: two monotone noise layers, white 75% · density 30% · size 1 and black 55% · density 22% · size 1.2.

## Palette
| Token | Hex | Role |
|---|---|---|
| `--sticker-cream` | `#EDE2C2` | border and highlights |
| `--sticker-orange` | `#FD6117` | primary |
| `--sticker-teal` | `#0B7563` | secondary |
| `--sticker-periwinkle` | `#8BA1EF` | accent |
| `--sticker-pink` | `#EC70BB` | accent 2 and blush |
| `--sticker-ink` | `#112F29` | ground, eyes and marks |
| `--sticker-gold` | `#91781E` | detail |

## Faces
Dot eyes with a small cream highlight, pink blush ovals and a line smile.

## Type
Bagel Fat One for headlines, DM Sans for text (both self-hosted via Fontsource).
