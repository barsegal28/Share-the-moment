import type { Preview } from "@storybook/react-vite"
import { Sheet, type SheetGround } from "../src/components/sticker/Sheet"
import "../src/index.css"

/**
 * Every story sits on a Sticker sheet. Set `parameters.sheet` to "ink" (default), "paper" or "notebook",
 * or "none" for full-screen stories that bring their own stage.
 */
const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i } },
    backgrounds: { disable: true },
    options: {
      storySort: { order: ["Introduction", "Foundations", "UI (shadcn)", "Sticker", "Motion", "Kid", "Parent", "Screens"] },
    },
  },
  decorators: [
    (Story, ctx) => {
      const sheet = (ctx.parameters.sheet ?? "ink") as SheetGround | "none"
      if (sheet === "none") return <Story />
      return (
        <Sheet ground={sheet} className="min-h-screen p-12">
          <Story />
        </Sheet>
      )
    },
  ],
  tags: ["autodocs"],
}
export default preview
