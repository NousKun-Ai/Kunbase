/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Link as LinkIcon, Globe, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkillCard, type DatabaseSkill } from "@/features/skills/components/SkillCard"
import { createClient } from "@/lib/supabase/server"

async function getProfile(username: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()
  return profile
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const creator = await getProfile(username)

  if (!creator) return { title: "Not Found - Kunbase" }

  return {
    title: `${creator.name} (@${creator.username}) - Kunbase`,
    description: creator.bio ?? undefined,
  }
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const creator = await getProfile(username)

  if (!creator) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === creator.id

  const { data: skillRows } = await supabase
    .from("skills")
    .select("*, owner:profiles!skills_owner_id_fkey(name, username, avatar_url)")
    .eq("owner_id", creator.id)
    .order("created_at", { ascending: false })

  const uniqueSkills = ((skillRows ?? []) as any[]).map(skill => ({
    ...skill,
    profiles: skill.owner // Supabase join aliased it to owner
  })) as DatabaseSkill[]

  const totalStars = uniqueSkills.reduce((acc, curr) => acc + (curr.stars_count || 0), 0)
  

  const publishedSkills = uniqueSkills.filter(s => s.type !== 'prompt')
  const publishedPrompts = uniqueSkills.filter(s => s.type === 'prompt')

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
          <AvatarImage src={creator.avatar_url} alt={creator.name} />
          <AvatarFallback className="text-4xl">{creator.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{creator.name}</h1>
              <p className="text-muted-foreground text-lg">@{creator.username}</p>
            </div>
            {isOwner ? (
              <div className="flex gap-2">
                <Button variant="outline">Edit Profile</Button>
                <Link href="/upload" className={buttonVariants()}>Publish</Link>
              </div>
            ) : (
              <Button>Follow</Button>
            )}
          </div>
          
          <p className="text-lg max-w-2xl">{creator.bio}</p>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="hover:underline cursor-pointer"><strong className="text-foreground">{(creator.followers || 0).toLocaleString()}</strong> <span className="text-muted-foreground font-normal">followers</span></span>
            <span className="hover:underline cursor-pointer"><strong className="text-foreground">{(creator.following || 0).toLocaleString()}</strong> <span className="text-muted-foreground font-normal">following</span></span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
            {creator.links?.github && (
              <a href={creator.links.github} className="flex items-center hover:text-foreground transition-colors">
                <LinkIcon className="mr-2 h-4 w-4" /> GitHub
              </a>
            )}
            {creator.links?.twitter && (
              <a href={creator.links.twitter} className="flex items-center hover:text-foreground transition-colors">
                <LinkIcon className="mr-2 h-4 w-4" /> Twitter
              </a>
            )}
            {creator.links?.website && (
              <a href={creator.links.website} className="flex items-center hover:text-foreground transition-colors">
                <Globe className="mr-2 h-4 w-4" /> Website
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t w-full max-w-md">
            <div className="flex flex-col">
              <span className="font-bold text-xl">{totalStars.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center">
                <Star className="h-3 w-3 mr-1" /> Total Stars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6"
          >
            Overview ({uniqueSkills.length})
          </TabsTrigger>
          <TabsTrigger 
            value="skills" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6"
          >
            Skills ({publishedSkills.length})
          </TabsTrigger>
          <TabsTrigger 
            value="prompts" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-6"
          >
            Prompts ({publishedPrompts.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueSkills.sort((a, b) => b.stars_count - a.stars_count).map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="skills" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedSkills.sort((a, b) => b.stars_count - a.stars_count).map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
            {publishedSkills.length === 0 && (
              <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
                <p className="text-muted-foreground">This creator hasn&apos;t published any skills yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="prompts" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPrompts.sort((a, b) => b.stars_count - a.stars_count).map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
            {publishedPrompts.length === 0 && (
              <div className="col-span-full py-12 text-center border rounded-xl border-dashed">
                <p className="text-muted-foreground">This creator hasn&apos;t published any prompts yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
