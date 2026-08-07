import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SkillCard, DatabaseSkill } from "@/features/skills/components/SkillCard"
import { TrendingUp, Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Trending - Kunbase",
  description: "The most popular AI Prompts and Skills on Kunbase right now.",
}

export default async function TrendingPage() {
  const supabase = await createClient()

  // Fetch top 50 public skills by stars
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("visibility", "public")
    .order("stars_count", { ascending: false })
    .limit(50)

  const rawSkills = skills || []
  
  // Fetch profiles for these skills manually
  const ownerIds = [...new Set(rawSkills.map(s => s.owner_id))]
  const { data: profiles } = ownerIds.length > 0 
    ? await supabase.from("profiles").select("id, username, name, avatar_url").in("id", ownerIds)
    : { data: [] }

  const sortedTrending = rawSkills.map(skill => ({
    ...skill,
    profiles: profiles?.find(p => p.id === skill.owner_id) || { username: 'unknown', name: 'Unknown User', avatar_url: null }
  })) as unknown as DatabaseSkill[]

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Trending Right Now
          </h1>
        </div>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
          The most starred and copied AI architectures and system prompts this week.
        </p>
      </div>

      {sortedTrending.length > 0 ? (
        <div className="space-y-12">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 md:pt-4">
            {sortedTrending.slice(0, 3).map((skill, i) => (
              <div key={skill.id} className={`relative ${i === 1 ? 'md:-mt-8' : ''} ${i === 2 ? 'md:mt-8' : ''}`}>
                <div className="absolute -top-4 -left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold shadow-lg shadow-yellow-500/20 text-lg border-2 border-black">
                  {i + 1}
                </div>
                {i === 0 && (
                  <Trophy className="absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-20 animate-bounce" />
                )}
                <SkillCard skill={skill} index={i} isTrending={true} />
              </div>
            ))}
          </div>

          {/* The Rest */}
          {sortedTrending.length > 3 && (
            <div className="pt-8 border-t border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white/80">Rising Stars</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedTrending.slice(3).map((skill, i) => (
                  <SkillCard key={skill.id} skill={skill} index={i + 3} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
          <p className="text-muted-foreground text-lg">No trending skills found.</p>
        </div>
      )}
    </div>
  )
}

