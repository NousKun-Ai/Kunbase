import { Metadata } from "next"
import { TRENDING_SKILLS } from "@/lib/mock-data"
import { SkillCard } from "@/features/skills/components/SkillCard"
import { TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Trending - Kunbase",
  description: "The most popular AI Prompts and Skills on Kunbase right now.",
}

export default function TrendingPage() {
  // Sort by stars descending
  const sortedTrending = [...TRENDING_SKILLS].sort((a, b) => b.stats.stars - a.stats.stars)

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
      <div className="mb-10 space-y-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Trending Right Now</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          The most starred and copied AI architectures and system prompts this week.
        </p>
      </div>

      {sortedTrending.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedTrending.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No trending skills found.</p>
        </div>
      )}
    </div>
  )
}
