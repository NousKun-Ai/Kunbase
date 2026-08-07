/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Code2, UploadCloud, Loader2, Lock, Globe, Eye, Code } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

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
  
  const [isDragging, setIsDragging] = React.useState(false)
  const [editorMode, setEditorMode] = React.useState<"edit" | "preview">("edit")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFile(file)
    e.target.value = ''
  }

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        setContent(text)
      }
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
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
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8 max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } }
      }}
    >
      
      {/* Type Selection */}
      <motion.div variants={itemVariants} className="space-y-3">
        <Label className="text-lg">What are you publishing?</Label>
        <Tabs defaultValue="prompt" onValueChange={(v) => setType(v as "prompt" | "skill")} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-background/50 border border-white/5 backdrop-blur-sm">
            <TabsTrigger value="prompt" className="text-base gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Sparkles className="w-4 h-4" /> Prompt
            </TabsTrigger>
            <TabsTrigger value="skill" className="text-base gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Code2 className="w-4 h-4" /> AI Skill
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          {type === "prompt" 
            ? "Prompts are raw text instructions optimized for LLMs (like Claude or ChatGPT)." 
            : "Skills are complex architectures, tools, or markdown files for AI agents (like Cursor rules or MCP servers)."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Staff Engineer Persona"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/40 focus:bg-background/80 transition-colors"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly explain what this does..."
              className="resize-none h-24 bg-background/40 focus:bg-background/80 transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select required value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger className="bg-background/40 focus:bg-background/80 transition-colors">
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
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "private")}>
              <SelectTrigger id="visibility" className="bg-background/40 focus:bg-background/80 transition-colors">
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
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. frontend, react, persona"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-background/40 focus:bg-background/80 transition-colors"
            />
          </motion.div>
        </div>

        {/* Right Column: Editor */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col space-y-2 h-[600px] lg:h-auto min-h-[500px]">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <div className="flex items-center gap-2">
              <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as any)} className="h-8">
                <TabsList className="h-8 bg-background/50 border border-white/5">
                  <TabsTrigger value="edit" className="text-xs px-3 h-6"><Code className="w-3 h-3 mr-1" /> Edit</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs px-3 h-6"><Eye className="w-3 h-3 mr-1" /> Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".md,.txt,.mdc"
                onChange={handleFileUpload}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <UploadCloud className="w-3 h-3 mr-1.5" />
                Upload File
              </Button>
            </div>
          </div>
          
          <div 
            className={`relative flex-1 border rounded-lg overflow-hidden transition-all duration-300 ${isDragging ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-white/10 bg-black/20'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute top-0 left-0 w-full h-9 bg-black/40 border-b border-white/5 flex items-center px-4 text-xs font-mono text-muted-foreground z-10 backdrop-blur-md">
              {type === "prompt" ? "system-prompt.md" : "architecture-rule.mdc"}
            </div>
            
            <AnimatePresence mode="wait">
              {editorMode === "edit" ? (
                <motion.textarea 
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none p-4 pt-12 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
                  placeholder={type === "prompt" 
                    ? "You are an expert AI assistant...\n\n(Drag and drop a file here)" 
                    : "# AI Skill\n\nDefine your complex rule or architecture here...\n\n(Drag and drop a file here)"}
                  required
                />
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 w-full h-full bg-transparent p-4 pt-12 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    {content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isDragging && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg m-2 pointer-events-none"
                >
                  <div className="flex flex-col items-center text-primary">
                    <UploadCloud className="w-12 h-12 mb-4 animate-bounce" />
                    <span className="text-lg font-medium">Drop file to upload</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive text-right"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="flex items-center justify-end pt-6 border-t border-white/5">
        <Button type="button" variant="ghost" className="mr-4 hover:bg-white/5" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting} 
          className="min-w-[150px] shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-shadow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Publish {type === "prompt" ? "Skill" : "Prompt"}
            </>
          )}
        </Button>
      </motion.div>

    </motion.form>
  )
}
