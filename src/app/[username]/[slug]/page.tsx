import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownViewer } from "@/components/skills/MarkdownViewer"
import { SkillActions } from "@/components/skills/SkillActions"
import { StarButton } from "@/components/skills/StarButton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Copy, Eye, Calendar, User, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { toMockSkill, type SkillRow } from "@/lib/skills"

async function getSkill(username: string, slug: string) {
  const supabase = await createClient()
  const { data: row } = await supabase
    .from("skills")
    .select("*, owner:profiles!skills_owner_id_fkey(name, username, avatar_url)")
    .eq("slug", slug)
    .single()

  // RLS already hides private skills owned by someone else, but we still
  // need to confirm the skill belongs to the username in the URL.
  if (!row || (row as SkillRow).owner?.username !== username) return null
  return toMockSkill(row as SkillRow)
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

  const content = displaySkill.content ?? ""

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="text-primary font-medium">{displaySkill.category}</span>
              <span>•</span>
              <span className="flex items-center"><Calendar className="mr-1 h-3 w-3"/> {new Date(displaySkill.createdAt).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{displaySkill.title}</h1>
            <p className="text-xl text-muted-foreground">{displaySkill.description}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
              <div className="flex items-center space-x-3">
                <img src={displaySkill.creator.avatar} alt={displaySkill.creator.name} className="w-10 h-10 rounded-full border border-border" />
                <div>
                  <p className="font-medium">{displaySkill.creator.name}</p>
                  <p className="text-sm text-muted-foreground">@{displaySkill.creator.username}</p>
                </div>
              </div>
              
              <div className="hidden sm:block w-px h-10 bg-border"></div>
              
              <SkillActions content={content} filename={`${displaySkill.slug}.md`} type={displaySkill.type} />
            </div>
          </div>

          <Separator />

          {/* Markdown Viewer */}
          <div className="relative rounded-2xl border border-border/50 bg-card p-6 md:p-10 shadow-sm">
            <MarkdownViewer content={content} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h3 className="font-semibold text-lg">Stats</h3>
            <div className="space-y-4">
              <StarButton initialStars={displaySkill.stats.stars} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Copy className="mr-2 h-4 w-4" /> Copies</span>
                <span className="font-medium">{displaySkill.stats.copies.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center"><Eye className="mr-2 h-4 w-4" /> Views</span>
                <span className="font-medium">{displaySkill.stats.views.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center"><Tag className="mr-2 h-4 w-4"/> Tags</h3>
            <div className="flex flex-wrap gap-2">
              {displaySkill.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-muted/50 hover:bg-muted font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
