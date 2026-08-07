/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownViewer } from "@/components/skills/MarkdownViewer"
import { SkillActions } from "@/components/skills/SkillActions"
import { StarButton } from "@/components/skills/StarButton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Eye, Calendar, Tag, Sparkles, Code2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { DatabaseSkill } from "@/features/skills/components/SkillCard"

async function getSkill(username: string, slug: string) {
  const supabase = await createClient()
  const { data: row } = await supabase
    .from("skills")
    .select("*, owner:profiles!skills_owner_id_fkey(name, username, avatar_url)")
    .eq("slug", slug)
    .single()

  if (!row || (row as any).owner?.username !== username) return null
  
  const skill = {
    ...row,
    profiles: (row as any).owner
  } as DatabaseSkill

  return skill
}

export async function generateMetadata({ params }: { params: Promise<{ username: string, slug: string }> }): Promise<Metadata> {
  const { slug, username } = await params
  const skill = await getSkill(username, slug)
  if (!skill) return { title: "Not Found - Kunbase" }
  return {
    title: `${skill.title} - Kunbase`,
    description: skill.description
  }
}

export default async function SkillDetailPage({ params }: { params: Promise<{ username: string, slug: string }> }) {
  const { slug, username } = await params
  const displaySkill = await getSkill(username, slug)

  if (!displaySkill) {
    notFound()
  }

  // Ensure content exists (might need to fetch it separately if it's not in the view, but let's assume it is or use empty string)
  const content = (displaySkill as any).content ?? ""
  const profile = Array.isArray(displaySkill.profiles) ? displaySkill.profiles[0] : displaySkill.profiles

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-sm">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/10 font-normal">
                {displaySkill.type === "prompt" ? <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> : <Code2 className="w-3 h-3 mr-1 text-blue-400" />}
                {displaySkill.type}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">{displaySkill.category}</span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center text-muted-foreground"><Calendar className="mr-1 h-3 w-3"/> {new Date((displaySkill as any).created_at).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent pb-2">{displaySkill.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">{displaySkill.description}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6">
              <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <img src={profile?.avatar_url || ""} alt={profile?.name || ""} className="w-10 h-10 rounded-full border border-border" />
                <div>
                  <p className="font-medium text-sm leading-none">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">@{profile?.username}</p>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-10 bg-white/10"></div>
              
              <SkillActions skillId={displaySkill.id} content={content} filename={`${displaySkill.slug}.md`} type={displaySkill.type as "skill" | "prompt"} />
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Markdown Viewer */}
          <div className="glass-panel rounded-2xl p-6 md:p-10">
            <MarkdownViewer content={content} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel rounded-xl p-6 space-y-6 sticky top-24">
            <h3 className="font-semibold text-lg text-white/90 border-b border-white/10 pb-3">Stats</h3>
            <div className="space-y-4">
              <StarButton skillId={displaySkill.id} initialStars={displaySkill.stars_count} />
              
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-muted-foreground flex items-center text-sm"><Copy className="mr-2 h-4 w-4" /> Copies</span>
                <span className="font-medium">{displaySkill.copies_count?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center text-sm"><Eye className="mr-2 h-4 w-4" /> Views</span>
                <span className="font-medium">{displaySkill.views_count?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <h3 className="font-semibold text-sm flex items-center text-muted-foreground uppercase tracking-wider"><Tag className="mr-2 h-4 w-4"/> Tags</h3>
              <div className="flex flex-wrap gap-2">
                {displaySkill.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/30 hover:bg-secondary/50 font-normal transition-colors border border-white/5">
                    #{tag}
                  </Badge>
                ))}
                {(!displaySkill.tags || displaySkill.tags.length === 0) && (
                  <span className="text-sm text-muted-foreground italic">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
