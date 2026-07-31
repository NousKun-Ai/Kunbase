"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Code2, UploadCloud, Loader2, Lock, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"

export function PublishForm() {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [type, setType] = React.useState<"prompt" | "skill">("prompt")
  const [content, setContent] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [tags, setTags] = React.useState("")
  const [visibility, setVisibility] = React.useState<"public" | "private">("public")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        setContent(text)
      }
    }
    reader.readAsText(file)
    
    // Reset input so the same file can be uploaded again if needed
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be signed in to publish.")
      setIsSubmitting(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (!profile) {
      setError("Could not find your profile. Try signing in again.")
      setIsSubmitting(false)
      return
    }

    const slug = slugify(title)
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const { error: insertError } = await supabase.from("skills").insert({
      owner_id: user.id,
      title,
      slug,
      description,
      category,
      tags: parsedTags,
      type,
      content,
      visibility,
    })

    setIsSubmitting(false)

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "You already have something published with that title. Try a different title."
          : "Something went wrong publishing this. Please try again."
      )
      return
    }

    router.push(`/${profile.username}/${slug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      
      {/* Type Selection */}
      <div className="space-y-3">
        <Label className="text-lg">What are you publishing?</Label>
        <Tabs defaultValue="prompt" onValueChange={(v) => setType(v as "prompt" | "skill")} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="prompt" className="text-base gap-2">
              <Sparkles className="w-4 h-4" /> Prompt
            </TabsTrigger>
            <TabsTrigger value="skill" className="text-base gap-2">
              <Code2 className="w-4 h-4" /> AI Skill
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          {type === "prompt" 
            ? "Prompts are raw text instructions optimized for LLMs (like Claude or ChatGPT)." 
            : "Skills are complex architectures, tools, or markdown files for AI agents (like Cursor rules or MCP servers)."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Metadata */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Staff Engineer Persona"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly explain what this does..."
              className="resize-none h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select required value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system-prompts">System Prompts</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="data-analysis">Data Analysis</SelectItem>
                <SelectItem value="creative-writing">Creative Writing</SelectItem>
                <SelectItem value="ai-architecture">AI Architecture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "private")}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Public</span>
                </SelectItem>
                <SelectItem value="private">
                  <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Private</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {visibility === "public"
                ? "Visible to everyone in the registry."
                : "Only visible to you."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. frontend, react, persona"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="md:col-span-2 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <div>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".md,.txt,.mdc"
                onChange={handleFileUpload}
              />
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <UploadCloud className="w-3 h-3 mr-1.5" />
                Upload File
              </Button>
            </div>
          </div>
          <div className="relative flex-1 min-h-[400px] border rounded-lg bg-muted/30 focus-within:ring-2 focus-within:ring-primary/50 transition-all overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-10 bg-muted/50 border-b flex items-center px-4 text-xs font-mono text-muted-foreground">
              {type === "prompt" ? "system-prompt.md" : "architecture-rule.mdc"}
            </div>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] bg-transparent resize-none outline-none p-4 pt-14 font-mono text-sm leading-relaxed"
              placeholder={type === "prompt" 
                ? "You are an expert AI assistant..." 
                : "# AI Skill\n\nDefine your complex rule or architecture here..."}
              required
            ></textarea>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-right">{error}</p>
      )}

      <div className="flex items-center justify-end pt-6 border-t">
        <Button type="button" variant="ghost" className="mr-4" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[150px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Publish {type === "prompt" ? "Prompt" : "Skill"}
            </>
          )}
        </Button>
      </div>

    </form>
  )
}
