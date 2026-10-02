"use server"

import { createClient } from "@/lib/supabase/server"

export async function incrementCopies(skillId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_copies', { skill_id: skillId })
}

export async function toggleStar(skillId: string, currentlyStarred: boolean) {
  const supabase = await createClient()
  await supabase.rpc('toggle_star', { skill_id: skillId, currently_starred: currentlyStarred })
}

export async function searchRegistry(query: string) {
  if (!query) return { skills: [], profiles: [] }
  
  const supabase = await createClient()
  
  const [{ data: skills }, { data: profiles }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, title, slug, type, owner:profiles!skills_owner_id_fkey(username)")
      .eq("visibility", "public")
      .ilike("title", `%${query}%`)
      .limit(5),
    supabase
      .from("profiles")
      .select("id, username, name, avatar_url")
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(3)
  ])
  
  return {
    skills: skills || [],
    profiles: profiles || []
  }
}
