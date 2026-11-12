import type { Meta, StoryObj } from "@storybook/react-vite"
import { useRef, useState } from "react"
import { ArrowRight, RotateCcw, Send, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sticker } from "@/art/stickers"

const meta: Meta<typeof Button> = {
  title: "UI (shadcn)/Components",
  component: Button,
  args: { children: "Send to Mom & Dad", variant: "sticker", tone: "orange", size: "kid" },
  argTypes: {
    variant: { control: "select", options: ["default", "secondary", "outline", "ghost", "link", "destructive", "sticker"] },
    tone: { control: "select", options: ["orange", "teal", "periwinkle", "pink", "cream"] },
    size: { control: "select", options: ["sm", "default", "lg", "icon", "kid", "kid-lg", "kid-icon"] },
  },
}
export default meta
type S = StoryObj<typeof Button>

export const Playground: S = {}

export const KidSizes: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-10">
      <Button variant="sticker" tone="orange" size="kid-lg"><Send /> Send to Mom & Dad</Button>
      <Button variant="sticker" tone="teal" size="kid"><RotateCcw /> Play again</Button>
      <Button variant="sticker" tone="periwinkle" size="kid">Next song <ArrowRight /></Button>
      <Button variant="sticker" tone="cream" size="kid-icon" aria-label="Star"><Star /></Button>
    </div>
  ),
}

export const StickerTones: S = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      {(["orange", "teal", "periwinkle", "pink", "cream"] as const).map((t) => (
        <Button key={t} variant="sticker" tone={t} size="kid">{t}</Button>
      ))}
    </div>
  ),
}

export const ParentSizes: S = {
  name: "Default shadcn variants (parent UI)",
  parameters: { sheet: "paper" },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const CardStory: StoryObj = {
  name: "Card",
  render: () => (
    <div className="flex flex-wrap gap-12">
      <Card sticker className="w-80 [--kiss:var(--sticker-orange)]">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Sticker card</CardTitle>
          <CardDescription>Die-cut onto the sheet with the `sticker` prop.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center"><Sticker name="trophy" size={96} lift={false} /></CardContent>
        <CardFooter><Button variant="secondary" className="w-full">Action</Button></CardFooter>
      </Card>
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Plain card</CardTitle>
          <CardDescription>Default shadcn card on Sticker tokens.</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    </div>
  ),
}

export const BadgeStory: StoryObj = {
  name: "Badge",
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["default", "secondary", "accent", "destructive", "cream", "outline"] as const).map((v) => <Badge key={v} variant={v}>{v}</Badge>)}
    </div>
  ),
}

export const ProgressStory: StoryObj = {
  name: "Progress",
  render: () => (
    <div className="w-96 space-y-6">
      <Progress value={30} />
      <Progress value={70} className="h-3 bg-cream/20" indicatorClassName="bg-orange" />
    </div>
  ),
}

export const TabsStory: StoryObj = {
  name: "Tabs",
  render: () => (
    <Tabs defaultValue="sticker" className="w-96">
      <TabsList><TabsTrigger value="sticker">Sticker</TabsTrigger><TabsTrigger value="voice">Voice</TabsTrigger><TabsTrigger value="video">Video</TabsTrigger></TabsList>
      <TabsContent value="sticker" className="text-cream">Sticker tab</TabsContent>
      <TabsContent value="voice" className="text-cream">Voice tab</TabsContent>
      <TabsContent value="video" className="text-cream">Video tab</TabsContent>
    </Tabs>
  ),
}

function DialogDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <div ref={ref} className="relative h-[420px] w-[640px] overflow-hidden rounded-3xl bg-muted">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button variant="sticker" size="kid" className="m-10">Open dialog</Button></DialogTrigger>
        <DialogContent container={ref.current}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Contained dialog</DialogTitle>
            <DialogDescription>Renders inside a device frame via the `container` prop.</DialogDescription>
          </DialogHeader>
          <DialogFooter><Button variant="secondary" onClick={() => setOpen(false)}>OK</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export const DialogStory: StoryObj = { name: "Dialog", render: () => <DialogDemo /> }

export const AvatarStory: StoryObj = {
  name: "Avatar",
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-16 bg-pink"><AvatarFallback className="bg-transparent"><Sticker name="mom" size={56} lift={false} /></AvatarFallback></Avatar>
      <Avatar className="size-12"><AvatarFallback className="text-ink bg-cream font-bold">M</AvatarFallback></Avatar>
    </div>
  ),
}
