"use server"

import { createClient } from "@/lib/supabase/server"

// IMPORTANT: RLS on update currently only allows owners to update their own skills.
// For anyone to be able to star/copy, we either need a separate "stars" and "copies" table,
// or we need to bypass RLS with a service role key. 
// Since this is an MVP without a service role configured yet, we will just use 
// client state for now if they aren't the owner, but we'll leave this action here for when RLS is updated.

export async function incrementCopies(skillId: string) {
  const supabase = await createClient()
  
  const { data: skill } = await supabase.from("skills").select("copies_count").eq("id", skillId).single()
  
  if (skill) {
    await supabase.from("skills").update({ copies_count: skill.copies_count + 1 }).eq("id", skillId)
  }
}

export async function toggleStar(skillId: string, currentlyStarred: boolean) {
  const supabase = await createClient()
  
  const { data: skill } = await supabase.from("skills").select("stars_count").eq("id", skillId).single()
  
  if (skill) {
    const newCount = currentlyStarred 
      ? Math.max(0, skill.stars_count - 1) 
      : skill.stars_count + 1
      
    await supabase.from("skills").update({ stars_count: newCount }).eq("id", skillId)
  }
}
