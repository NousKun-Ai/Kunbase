import { Metadata } from "next"
import { PublishForm } from "@/components/skills/PublishForm"

export const metadata: Metadata = {
  title: "Publish - Kunbase",
  description: "Publish your AI Prompts and Skills to the open registry.",
}

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Publish to Registry</h1>
        <p className="text-muted-foreground text-lg">
          Share your best AI architectures, system prompts, and tools with the world.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-10 shadow-sm">
        <PublishForm />
      </div>
    </div>
  )
}
