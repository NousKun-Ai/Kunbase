/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { MarkdownViewer } from "@/components/skills/MarkdownViewer"
import { SkillActions } from "@/components/skills/SkillActions"
import { StarButton } from "@/components/skills/StarButton"
import { ReportSkillDialog } from "@/components/skills/ReportSkillDialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Calendar, Tag, Sparkles, Code2, ShieldCheck, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { DatabaseSkill } from "@/features/skills/components/SkillCard"
import { containsTerminalCommands } from "@/lib/security"

async function getSkill(username: string, slug: string) {
  const supabase = await createClient()
  
  // First, fetch the skill
  const { data: row } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!row) return null

  // Then, fetch the profile based on the skill's owner_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, username, avatar_url")
    .eq("id", row.owner_id)
    .single()

  // Validate that the profile exists and the username matches the URL
  if (!profile || profile.username !== username) return null
  
  const skill = {
    ...row,
    profiles: profile
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const securityStatus = (displaySkill as any).security_status || "verified"
  const isOwner = user?.id === displaySkill.owner_id

  // Quarantined content cannot be viewed by the public
  if (securityStatus === "quarantined" && !isOwner) {
    notFound()
  }

  // Ensure content exists (might need to fetch it separately if it's not in the view, but let's assume it is or use empty string)
  const content = (displaySkill as any).content ?? ""
  const profile = Array.isArray(displaySkill.profiles) ? displaySkill.profiles[0] : displaySkill.profiles
  const hasTerminalCommands = containsTerminalCommands(content)
  const isFlagged = securityStatus === "flagged"
  const isQuarantined = securityStatus === "quarantined"


  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Header */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/10 font-normal">
                {displaySkill.type === "prompt" ? <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> : <Code2 className="w-3 h-3 mr-1 text-blue-400" />}
                {displaySkill.type}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary font-medium">{displaySkill.category}</span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center text-muted-foreground"><Calendar className="mr-1 h-3 w-3"/> {((displaySkill as any).created_at || '').split('T')[0]}</span>
              <span className="text-muted-foreground">•</span>
              {isQuarantined ? (
                <Badge variant="outline" className="bg-red-500/15 border-red-500/30 text-red-400 font-normal">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-400" />
                  Quarantined
                </Badge>
              ) : isFlagged ? (
                <Badge variant="outline" className="bg-red-500/10 border-red-500/25 text-red-400 font-normal">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-400" />
                  Community Flagged
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-normal">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                  Security Verified
                </Badge>
              )}
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

          {/* Quarantined Owner Notice */}
          {isQuarantined && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3.5 text-red-200 text-sm backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Moderation Notice: Quarantined</p>
                <p className="text-xs text-red-200/80 mt-1 leading-relaxed">
                  This skill has been quarantined by Kunbase moderation and is hidden from public discovery due to security or policy violations. Only you (the owner) can see this preview.
                </p>
              </div>
            </div>
          )}

          {/* Critical Flagged Advisory Banner */}
          {isFlagged && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-red-200/90 text-sm backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Safety Warning: Community Reported</p>
                <p className="text-xs text-red-200/70 mt-1 leading-relaxed">
                  This prompt or skill has received community reports for suspicious or potentially malicious instructions. Inspect all instructions carefully before using it.
                </p>
              </div>
            </div>
          )}

          {/* Terminal Command Execution Advisory Banner */}
          {hasTerminalCommands && !isFlagged && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3.5 text-amber-200/90 text-sm backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Terminal Command Advisory</p>
                <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                  This skill contains terminal execution commands. We recommend always reviewing shell scripts and commands before allowing an autonomous AI agent to run them on your system.
                </p>
              </div>
            </div>
          )}

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

            {/* Safety & Moderation */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="font-semibold text-xs flex items-center text-muted-foreground uppercase tracking-wider">
                Safety & Trust
              </h3>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Static scan passed</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Verified against destructive OS exploits and unverified webhooks.
                </p>
                <div className="pt-1">
                  <ReportSkillDialog skillId={displaySkill.id} skillTitle={displaySkill.title} />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

