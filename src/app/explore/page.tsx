import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SkillCard, DatabaseSkill } from "@/features/skills/components/SkillCard"
import { ExploreSearch } from "@/components/layout/ExploreSearch"

export const metadata: Metadata = {
  title: "Explore - Kunbase",
  description: "Explore all AI Prompts and Skills on the registry.",
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()

  // Fetch all public skills
  let query = supabase
    .from("skills")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(50)

  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: skills } = await query

  const rawSkills = skills || []
  
  // Fetch profiles for these skills manually to avoid foreign key join errors
  const ownerIds = [...new Set(rawSkills.map(s => s.owner_id))]
  const { data: profiles } = ownerIds.length > 0 
    ? await supabase.from("profiles").select("id, username, name, avatar_url").in("id", ownerIds)
    : { data: [] }

  const allSkills = rawSkills.map(skill => ({
    ...skill,
    profiles: profiles?.find(p => p.id === skill.owner_id) || { username: 'unknown', name: 'Unknown User', avatar_url: null }
  })) as unknown as DatabaseSkill[]

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
      <div className="mb-12 space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Explore the Registry
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed">
          Discover the latest and most powerful AI architectures, prompts, and skills published by the community.
        </p>
        
        <ExploreSearch />
      </div>

      {allSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allSkills.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
          <p className="text-muted-foreground text-lg">
            {q ? `No skills found matching "${q}".` : "No skills found. Be the first to publish one!"}
          </p>
        </div>
      )}
    </div>
  )
}


