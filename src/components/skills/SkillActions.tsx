"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { incrementCopies } from "@/app/actions"

interface SkillActionsProps {
  skillId: string
  content: string
  filename: string
  type?: 'skill' | 'prompt'
}

export function SkillActions({ skillId, content, filename, type = 'skill' }: SkillActionsProps) {
  const [copied, setCopied] = React.useState(false)
  const router = useRouter()

  const trackCopy = async () => {
    try {
      await incrementCopies(skillId)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    trackCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    trackCopy()
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleCopy} className="flex-1 sm:flex-none">
        {copied ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {copied ? "Copied!" : type === 'prompt' ? "Copy Prompt" : "Copy Skill"}
      </Button>
      {type !== 'prompt' && (
        <Button onClick={handleDownload} variant="outline" className="flex-1 sm:flex-none">
          <Download className="mr-2 h-4 w-4" />
          Download .md
        </Button>
      )}
    </div>
  )
}
