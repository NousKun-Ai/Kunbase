/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { SkillCard, type DatabaseSkill } from "@/features/skills/components/SkillCard"
import { HeroSearch } from "@/components/layout/HeroSearch"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: trendingRows }, { data: recentRows }] = await Promise.all([
    supabase
      .from("skills")
      .select("*, owner:profiles!skills_owner_id_fkey(name, username, avatar_url)")
      .eq("visibility", "public")
      .order("stars_count", { ascending: false })
      .limit(8),
    supabase
      .from("skills")
      .select("*, owner:profiles!skills_owner_id_fkey(name, username, avatar_url)")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const TRENDING_SKILLS = ((trendingRows ?? []) as any[]).map(skill => ({
    ...skill,
    profiles: skill.owner
  })) as DatabaseSkill[]
  
  const RECENT_SKILLS = ((recentRows ?? []) as any[]).map(skill => ({
    ...skill,
    profiles: skill.owner
  })) as DatabaseSkill[]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            The open registry for Prompts and AI Skills.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
            Discover, publish, copy, and fork the world&apos;s best Prompts and AI Skills. 
            Stop rewriting prompts and architectures from scratch.
          </p>
          
          <HeroSearch />
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 md:py-24 border-t">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Trending Skills</h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">View all</Button>
          </div>
          {TRENDING_SKILLS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...TRENDING_SKILLS].sort((a, b) => b.stars_count - a.stars_count).map((skill, i) => (
                <SkillCard key={skill.id} skill={skill} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl bg-muted/10">
              <p className="text-muted-foreground mb-4">No trending skills found.</p>
              <Link href="/upload" className={buttonVariants({ variant: "outline" })}>
                Be the first to publish
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recently Published Section */}
      <section className="py-16 md:py-24 border-t bg-muted/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recently Published</h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">View all</Button>
          </div>
          {RECENT_SKILLS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...RECENT_SKILLS].sort((a, b) => b.stars_count - a.stars_count).map((skill, i) => (
                <SkillCard key={`recent-${skill.id}`} skill={skill} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl bg-muted/10">
              <p className="text-muted-foreground mb-4">No recent skills found.</p>
              <Button variant="outline">Be the first to publish</Button>
            </div>
          )}
        </div>
      </section>

      {/* Community Stats CTA */}
      <section className="py-24 md:py-32 border-t text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Join the Registry</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Join thousands of developers sharing and discovering the best AI architectures and skills.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto">Create an Account</Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">Explore Skills</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
