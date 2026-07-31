import { Metadata } from "next"
import { TRENDING_SKILLS, RECENT_SKILLS } from "@/lib/mock-data"
import { SkillCard } from "@/features/skills/components/SkillCard"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Explore - Kunbase",
  description: "Explore all AI Prompts and Skills on the registry.",
}

export default function ExplorePage() {
  const allSkills = [...TRENDING_SKILLS, ...RECENT_SKILLS]

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      <div className="mb-10 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Explore the Registry</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover the latest and most powerful AI architectures, prompts, and skills published by the community.
        </p>
        
        <div className="pt-4 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search all skills..." 
            className="pl-10 h-11 bg-muted/30"
          />
        </div>
      </div>

      {allSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allSkills.map((skill, i) => (
            <SkillCard key={`${skill.id}-${i}`} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No skills found.</p>
        </div>
      )}
    </div>
  )
}
