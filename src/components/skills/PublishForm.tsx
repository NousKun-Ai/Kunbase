/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Code2, UploadCloud, Loader2, Lock, Globe, Eye, Code, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { publishSkillAction } from "@/app/actions"
import {
  MAX_FILE_SIZE_BYTES,
  MAX_CONTENT_CHARS,
  ALLOWED_FILE_EXTENSIONS,
  containsBinaryBytes,
  scanContentForThreats,
  type SecurityScanReport,
  sanitizeMarkdownUrl,
} from "@/lib/security"

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
  const [showSecurityConfirmation, setShowSecurityConfirmation] = React.useState(false)
  const [confirmedSafe, setConfirmedSafe] = React.useState(false)

  // Real-time security analysis on prompt & skill content
  const securityReport = React.useMemo<SecurityScanReport>(() => {
    if (!content.trim()) {
      return {
        isSafe: true,
        hasCritical: false,
        hasWarnings: false,
        issues: [],
        checkedAt: "",
      }
    }
    return scanContentForThreats(content, title, description)
  }, [content, title, description])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    readFile(file)
    e.target.value = ''
  }

  const readFile = (file: File) => {
    setError(null)

    // 1. Validate file size (max 300 KB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large (${(file.size / 1024).toFixed(1)} KB). Maximum allowed size for prompts and skills is 300 KB.`)
      return
    }

    // 2. Validate file extension
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type "${extension}". Only plain text and markdown (.md, .txt, .mdc, .yaml, .json) are allowed.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") {
        // 3. Reject binary executables / non-printable data
        if (containsBinaryBytes(text)) {
          setError("Upload rejected: File contains binary executable data or corrupted characters. Only plain text and markdown are allowed.")
          return
        }

        // 4. Character limit check
        if (text.length > MAX_CONTENT_CHARS) {
          setError(`File exceeds the limit of ${MAX_CONTENT_CHARS.toLocaleString()} characters.`)
          return
        }

        setContent(text)

        // 5. Automated threat check
        const scan = scanContentForThreats(text, title, description)
        if (scan.hasCritical) {
          setError(`Security Notice: Detected shell syntax or security pattern (${scan.issues[0]?.message}). You will be prompted to verify defensive intent upon publishing.`)
        }
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

  const executePublish = async (isConfirmed = false) => {
    setError(null)
    setIsSubmitting(true)

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const res = await publishSkillAction({
      title,
      description,
      category,
      tags: parsedTags,
      type,
      content,
      visibility,
      confirmedSafe: isConfirmed,
    })

    setIsSubmitting(false)

    if (res.needsConfirmation) {
      setShowSecurityConfirmation(true)
      return
    }

    if (res.error) {
      setError(res.error)
      return
    }

    if (res.username && res.slug) {
      router.push(`/${res.username}/${res.slug}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Pre-submission client validation
    if (content.length > MAX_CONTENT_CHARS) {
      setError(`Content exceeds maximum allowed limit of ${MAX_CONTENT_CHARS.toLocaleString()} characters.`)
      return
    }

    const scan = scanContentForThreats(content, title, description)
    if (scan.hasCritical && !confirmedSafe) {
      setShowSecurityConfirmation(true)
      return
    }

    await executePublish(confirmedSafe)
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
          
          {/* Real-time Security Diagnostic Banner */}
          {securityReport.issues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border text-xs flex flex-col gap-2.5 ${
                confirmedSafe
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : securityReport.hasCritical
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  {confirmedSafe ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : securityReport.hasCritical ? (
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {confirmedSafe
                      ? "Security Verified: You verified this content is safe (defensive security / documentation)."
                      : securityReport.hasCritical
                      ? "Security Advisory: Sensitive command syntax detected (Verification required to publish)"
                      : "Security Notice: Potentially sensitive pattern detected"}
                  </span>
                </div>

                {!confirmedSafe && securityReport.hasCritical && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSecurityConfirmation(true)}
                    className="h-6 px-2 text-[11px] bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25 shrink-0"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1 text-amber-400" />
                    Verify to Publish
                  </Button>
                )}
              </div>

              {!confirmedSafe && (
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-amber-200/80">
                  {securityReport.issues.map((issue, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{issue.message}</span>
                      {issue.snippet && (
                        <code className="ml-1.5 px-1.5 py-0.5 bg-black/40 rounded text-[10px] font-mono text-white/90">
                          {issue.snippet}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          <div 
            className={`relative flex-1 border rounded-lg overflow-hidden transition-all duration-300 ${isDragging ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-white/10 bg-black/20'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute top-0 left-0 w-full h-9 bg-black/40 border-b border-white/5 flex items-center justify-between px-4 text-xs font-mono text-muted-foreground z-10 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span>{type === "prompt" ? "system-prompt.md" : "architecture-rule.mdc"}</span>
                <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                  ({content.length.toLocaleString()} / {MAX_CONTENT_CHARS.toLocaleString()} chars)
                </span>
              </div>

              {content.trim() ? (
                confirmedSafe ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-sans text-[11px] bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified Safe</span>
                  </div>
                ) : securityReport.hasCritical ? (
                  <div className="flex items-center gap-1.5 text-amber-400 font-sans text-[11px] bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Verification Required</span>
                  </div>
                ) : securityReport.hasWarnings ? (
                  <div className="flex items-center gap-1.5 text-amber-400 font-sans text-[11px] bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Review Needed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-sans text-[11px] bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Security Check: Clean</span>
                  </div>
                )
              ) : null}
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={sanitizeMarkdownUrl}>
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
              Publish {type === "prompt" ? "Prompt" : "Skill"}
            </>
          )}
        </Button>
      </motion.div>

      {/* Security Confirmation Modal for Defensive / Educational Prompts */}
      <Dialog open={showSecurityConfirmation} onOpenChange={setShowSecurityConfirmation}>
        <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-amber-400 mb-1">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <DialogTitle className="text-lg font-bold">Security Verification Notice</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Kunbase detected shell command syntax or exploit signatures in your prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <p className="font-semibold text-amber-300">Flagged Security Patterns:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-200/80">
                {securityReport.issues.slice(0, 4).map((issue, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{issue.message}</span>
                    {issue.snippet && (
                      <code className="ml-1 px-1 py-0.5 bg-black/40 rounded text-[10px] font-mono text-white/90">
                        {issue.snippet}
                      </code>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              If this prompt is an AI architecture, defensive security linter, code audit rule, or educational guide, you may verify and proceed with publishing.
            </p>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors">
              <input
                type="checkbox"
                checked={confirmedSafe}
                onChange={(e) => setConfirmedSafe(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-background text-primary focus:ring-primary"
              />
              <span className="text-xs leading-normal select-none">
                <strong className="text-white">I confirm this content is safe:</strong> It consists of defensive rules, educational documentation, or safe developer instructions, and does not execute malicious attacks.
              </span>
            </label>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityConfirmation(false)}
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!confirmedSafe || isSubmitting}
              onClick={() => {
                setShowSecurityConfirmation(false)
                executePublish(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Confirm & Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.form>
  )
}

