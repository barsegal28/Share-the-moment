# Figma ↔ repo design-system audit

Source of truth: Figma file **Share the moment**, page **app asets**, plus the two local components its screens use from **Explorations** (`background`, `Avatar`).
Audited Nov 13, 2026, after the layer clean-up. Only what the components and screens on that page actually use counts as part of the system. Everything else in the file (other Paper Cut languages, legacy paint styles, unused text styles) is left out of the code.

Legend: ✅ in the system and in code · ⚠️ outlier, used in Figma but not part of the Sticker system (decision needed) · 🗑 was in the repo, removed because no Figma component uses it.

---

## 1. Colour

### Primitives — collection `Paper Cut / Primitives`, group `sticker/*`

| Figma variable | Hex | CSS | Used by components |
|---|---|---|---|
| `sticker/cream` | `#EDE2C2` | `--sticker-cream` | ✅ |
| `sticker/orange` | `#FD6117` | `--sticker-orange` | ✅ |
| `sticker/teal` | `#0B7563` | `--sticker-teal` | ✅ |
| `sticker/periwinkle` | `#8BA1EF` | `--sticker-periwinkle` | ✅ |
| `sticker/pink` | `#EC70BB` | `--sticker-pink` | ✅ |
| `sticker/ink` | `#112F29` | `--sticker-ink` | ✅ |
| `sticker/gold` | `#91781E` | `--sticker-gold` | ✅ |
| `sticker/paper` | `#F7F2E6` | `--sticker-paper` | ✅ |
| `sticker/notebook` | `#FBF9F2` | `--sticker-notebook` | ✅ |
| `sticker/system-white` | `#FFFDF7` | `--sticker-system-white` | ✅ |
| `sticker/periwinkle-light` | `#C0CDFB` | `--sticker-periwinkle-light` | ✅ added Nov 13 (Player surfaces) |
| `sticker/blue` | `#006EE7` | `--sticker-blue` | ✅ added Nov 13 (send back › Message tag) |
| `sticker/grey` | `#818181` | `--sticker-grey` | ✅ added Nov 13 (Message tag › String) |
| `sticker/gold-light` | `#C8B880` | `--sticker-gold-light` | ✅ added Nov 13 (Toolbar › Selected background) |

The other primitives in that collection (`snip/*`, `overprint/*`, `scrapbook/*`) belong to the other Paper Cut languages. No component uses them. 🗑 not in code.

### Semantic — collection `Paper Cut`, mode **Sticker**

| Figma variable | Resolves to | CSS |
|---|---|---|
| `ground` | sticker/ink | `--pc-ground` |
| `ground/light` | sticker/paper | `--pc-ground-light` |
| `ground/notebook` | sticker/notebook | `--pc-ground-notebook` |
| `piece/primary` | sticker/orange | `--pc-piece-primary` |
| `piece/secondary` | sticker/teal | `--pc-piece-secondary` |
| `piece/accent` | sticker/periwinkle | `--pc-piece-accent` |
| `piece/accent-2` | sticker/pink | `--pc-piece-accent-2` |
| `piece/dark` | sticker/gold | `--pc-piece-dark` |
| `mark/ink` | sticker/ink | `--pc-mark-ink` |
| `mark/knockout` | sticker/cream | `--pc-mark-knockout` |
| `detail/rule` | sticker/periwinkle | `--pc-detail-rule` |
| `detail/margin` | sticker/pink | `--pc-detail-margin` |
| `text/primary` | sticker/ink | `--pc-text-primary` |
| `sticker/border` | sticker/cream | `--pc-sticker-border` |
| `system/surface` | sticker/system-white | `--pc-system-surface` |
| `system/ink` | mark/ink | `--pc-system-ink` |

Note ⚠️: components bind **both** layers. The sticker art uses the semantic ones (`piece/*`, `mark/*`), but the UI components (Player, Parent.Mobile, Progress.bar, Reward progress, main) bind primitives directly (`sticker/ink`, `sticker/orange`, `sticker/paper`…). That works, but means a mode switch wouldn't reach the UI. Recommend rebinding UI fills to the semantic layer.

### Library overrides — collection `Library overrides` (added Nov 13)

Decision: buttons come from **Flex Web**, icons from **Fluent**. Every colour this file overrides on them is a local token, bound in Figma.

| Figma variable | Value | CSS | Bound on |
|---|---|---|---|
| `flex-web/button/primary/background` | → sticker/ink | `--flex-web-button-primary-background` | Share buttons |
| `flex-web/button/primary/label` | `#FAFAFA` | `--flex-web-button-primary-label` | Share buttons (was a stray `primary-foreground` variable) |
| `flex-web/button/outline/background` | → sticker/paper | `--flex-web-button-outline-background` | Send Noa a surprise, Send to Noa |
| `flex-web/button/outline/border` | → sticker/orange | `--flex-web-button-outline-border` | same |
| `flex-web/button/outline/label` | → sticker/orange | `--flex-web-button-outline-label` | same |
| `flex-web/button/outline-light/background` | `#FFFFFF` 80% | `--flex-web-button-outline-light-background` | Play next, Close (success screen) |
| `fluent/icon/default` | → sticker/ink | `--fluent-icon-default` | Collections, Sticker, Mic, Camera icons |
| `fluent/icon/rating` | → sticker/orange | `--fluent-icon-rating` | Score stars |

Colours the buttons keep from Flex Web itself (not overrides, so no local token): the outline stroke `Color/Stroke/Neutral/Subtle` on Play next / Close, and `Color/Foreground/Neutral/Primary` labels and icons.

### Colour outliers ⚠️ (as found on Nov 13 — the first five rows are now resolved by the tokens above)

| Where (layer path on *app asets*) | Value | Nearest system token |
|---|---|---|
| Player (tablet, mobile blue, mobile blue large) — surface fill | raw `#C0CDFB` | none; it's a lighter periwinkle. Add `sticker/periwinkle-light`, or use `piece/accent` |
| Parent.Mobile › send back › Message tag — stroke, dots | raw `#006EE7` | none (a system blue). `piece/accent` or `piece/secondary` |
| Parent.Mobile › send back › Message tag › String | raw `#818181` | none (neutral grey) |
| Parent.Mobile › send back › Toolbar › Sticker tool › Selected background | raw `#C8B880` | none; a light gold. `piece/dark` at reduced opacity |
| Parent.Mobile › send back › Mic icon › Badge clearance (mask) | raw `#000000` stroke | mask only, not visible |
| main › Share button (library Button, Primary) — label | library `primary-foreground #FAFAFA` | `mark/knockout` (cream) |
| main › Play next / Close button (library Button, Outline) — fill / stroke / label | raw `#FFFFFF` 80%, library `Color/Stroke/Neutral/Subtle` (black 13%), library `Color/Foreground/Neutral/Primary` (black 86%) | `system/surface`, `mark/ink` |
| Icons (Share, Arrow Right, Dismiss) — default colour | library `Colors/Neutral/Grey/14 #242424`, `Color/Foreground/Brand/OnLoud #FFFFFF` | `mark/ink` / `mark/knockout` |
| Parent.Mobile › share the moment — component fill | raw `#FFFFFF` | `ground/light` or none (frame background) |
| Unbound copies of system colours | raw `#112F29` (Ringed planet line), `#EDE2C2` (Play › Inner circle), `#F7F2E6` (main card), `#FFFDF7` (Reward progress › Ribbon), plus opacity variants: gold 80% / 90% (effort notes), paper 60% (Sticker card), system-white 40% and notebook 40% (progress tracks) | same hex exists as a variable — should be bound |

Paint styles in the file (`Night/*`, `Creature/*`, `Planet/*`, `Line/*`, `Texture/*`, 27 styles): no component on *app asets* uses them. 🗑 not in code.

---

## 2. Typography

Every text layer on *app asets* uses a local text style (since Nov 13). Button labels inside the Flex Web Button keep Flex Web's own styles. The old local styles `Paper Cut/Body`, `Paper Cut/Label` and the Snip / Overprint / Scrapbook display styles are used by nothing.

| Figma text style | Code | Family | Size / line-height / tracking | Case | Used for |
|---|---|---|---|---|---|
| Sticker/Display/Hero | `text-display-hero` | Bagel Fat One | 102.74 / 98% / 0 | — | "YOU DID IT!" headline sticker (size comes from the scaled art) |
| Sticker/Display/Large | `text-display` | Bagel Fat One | 60 / 98% / 0 | — | "You are a star!" |
| Sticker/Title/Large | `text-title-lg` | Bagel Fat One | 36 / 98% / +4% | — | song title, tablet player |
| Sticker/Title/Medium | `text-title-md` | Bagel Fat One | 32 / 98% / +4% | — | song title, parent bottom sheet |
| Sticker/Title/Medium Caps | `text-title-md uppercase` | Bagel Fat One | 32 / 98% / +4% | UPPER | "Proud of you!" tag |
| Sticker/Title/Small | `text-title-sm` | Bagel Fat One | 24 / 98% / +4% | — | song title in cards and mobile players, level badge |
| Sticker/Mono/XL | `text-mono-xl` | DM Mono Medium | 24 / 98% / 0 | — | song meta, tablet |
| Sticker/Mono/Large | `text-mono-lg` | DM Mono Medium | 20 / 98% / 0 | — | timestamps, headers, progress label |
| Sticker/Mono/Medium | `text-mono-md` | DM Mono Medium | 16 / 98% / 0 | — | song info, score label, times |
| Sticker/Mono/Small | `text-mono-sm` | DM Mono Medium | 14 / 98% / 0 | — | times in mobile players and the bottom sheet |
| Sticker/Paragraph/Title | `text-paragraph-title` | Bagel Fat One | 36 / 40px / 0 | UPPER | "I got 3 stars on this song, mom!" |
| Sticker/Paragraph/Body | `text-paragraph-body` | DM Mono Medium | 16 / 20px / 0 | — | effort notes |
| Flex Web · Functional/Title Small | `text-functional-title-sm` | DM Mono Medium | 24 / 28px / −0.15px | — | XXL button labels (library) |
| Flex Web · Functional/Subtitle | `text-functional-subtitle` | DM Mono Medium | 20 / 28px / −0.15px | — | XL button labels (library) |

Note: the timestamps inside Progress.bar are Mono/Medium in the component and set to Mono/Small on the instances in the mobile players (an instance override, as before).

🗑 Removed from code: DM Sans (all weights), `text-pc-body`, `text-pc-label`.

Rule (Nov 13): the scale is for single lines (98% line-height); text that wraps uses the two paragraph styles. Song titles are always in normal case, never all caps.

### Typography outliers ⚠️ (as found; resolved Nov 13 except the library button labels and the headline art)

| Where | What | Suggestion |
|---|---|---|
| Reward progress/Dark › Ribbon Star › Level ("2") | ~~Hanken Grotesk ExtraBold 24, −2%~~ | ✅ switched to Bagel Fat One 24 / 98% / +4% (`text-title-sm`) on Nov 13 |
| screen 1 › Headline sticker ("YOU DID IT!") | Bagel 102.74 / 98% | non-integer size from scaling the sticker. Treat as art, or round to 104 |
| Parent.Mobile › "I got 3 stars on this song, mom!" | Bagel 36 / 40px / 0, UPPER | ✅ now text style Sticker/Paragraph/Title |
| Parent.Mobile › send back › "Proud of you!" | Bagel 32 / 30px / 0, UPPER | ✅ single line: snapped to `text-title-md` (still uppercase) |
| Parent.Mobile › "Noa got 3 stars!", effort notes | DM Mono 16 / 19px | ✅ effort notes → Sticker/Paragraph/Body; "Noa got 3 stars!" (one line) → `text-mono-md` |
| Parent.Mobile › send back › title | DM Mono 20 / 30px | ✅ single line: snapped to `text-mono-lg` |
| Button labels (library) | 28px line-height, −0.15px tracking | the only DM Mono text not on 98% / 0 |
| Song titles | uppercase in Player and tablet, mixed case in Parent.Mobile cards | ✅ normal case everywhere |
| Collection `Typography — DM Mono override` | empty variables overriding the external library's `Functional` scale | keep only if the library stays |

---

## 3. Effects

| Token (code) | Figma value | Where |
|---|---|---|
| `--shadow-sticker` (sticker lift) | drop shadow 0 / 7 / blur 10 / 30% black, on the kiss-cut edge | every sticker; instances scale it with the sticker |
| Riso grain (`<RisoGrain>`) | effect style **Paper Cut/Riso grain** (white 75% · 30% · 1px + black 55% · 22% · 1.2px) | `background`, Parent.Mobile backgrounds, main card |
| Die-cut | border 9px cream outside the art, kiss-cut 12.5px outside (3.5px visible), round joins | every sticker |

🔧 Corrected: the repo's lift was 7px / **5px blur / 38%**; Figma is 7px / **10px blur / 30%**. The repo's "20% on light sheets" rule isn't in Figma.

🗑 Removed from code: Ground grain, Overprint/Ink grain, Scrapbook/Lifted dark card (in the file, used by no component).

### Effect outliers ⚠️

| Where | Effect | Note |
|---|---|---|
| main (card), Parent.Mobile › share the moment › Paper | **Paper Cut/Scrapbook/Lifted paper** | Scrapbook-language style on Sticker components |
| main › FRE › Player, Parent.Mobile › play › Scrubber | **Paper Cut/Snip/Lifted grain** | Snip-language style |
| Sticker / Shape › Play (S and M) | raw shadow at 20% + noise (1.25/2.5 and 2.08/4.17) | every other sticker uses the 30% lift |
| screen 1 › Headline sticker | raw shadow 5.62 / 8.03 / **28%** | scaled lift but 28% instead of 30% |
| Parent.Mobile › play › Bottom sheet | raw shadow 0 / −2 / blur 9.9 / spread 2 / 25% | one-off; no token |
| screens 1–4 (frame) | raw noise, not the Riso grain style | should use the style |

---

## 4. Radius and spacing

Radii used by local components: **12, 20, 40, 60, pill (999)**, plus a sheet with 20/20/0/0. Code: `--radius-sm 12px`, `--radius-md 20px`, `--radius-lg 40px`, `--radius-xl 60px`, `rounded-full`.
Library buttons use 22, 24, 28 and 9999 ⚠️ (not on the local scale).

Spacing (auto-layout gaps and padding) sits on a 4px grid: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 60 (Tailwind's default scale covers all of them). Off-grid outliers ⚠️:

- gaps 99 (main › FRE › Content), 143 (Timestamps, set to space-between so it doesn't matter), −10 and −4.33 (Stars rows overlap the stars on purpose)
- padding 2 and 6 (Message tag), 30, 65, 79, 100, 150 (Progress.bar tracks pad 150 and 100 to fake the fill width)

---

## 5. Components from other libraries

Decision (Nov 13): keep the **Flex Web** Button and the **Fluent** icons as library components; their colour overrides live in `Library overrides` (§1).

| Component | Library | Used in |
|---|---|---|
| **Button** (Layout / Style / Radius / Size / State; 5 variants) | external "Generic" library (its variables are `Generic / Color`, text styles `Functional/*`) | main (Share, Play next, Close), Parent.Mobile (Send Noa a surprise, Send to Noa, Close) |
| **Focus ring** | same library, inside the Button | — |
| Icons **Star, Share, Arrow Right, Dismiss, Collections, Sticker, Mic, Camera** (`Size=…, Theme=Regular/Filled`) | Fluent System Icons naming | stars in Parent.Mobile score row, button icons, send-back toolbar |

The library Button's colours, radius and type are all off-system (see above), and the Share button's label still uses a shadcn-style `primary-foreground` variable inside the library component. Recommendation: a local **Button** component on Sticker tokens (orange / ink fill, cream label, pill or 28px radius) and keep the Fluent icons as an icon set (fine to keep, but list them as a dependency).
