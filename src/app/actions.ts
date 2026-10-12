"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { reportRateLimiter, publishRateLimiter } from "@/lib/rate-limit"
import { scanContentForThreats, MAX_CONTENT_CHARS } from "@/lib/security"
import { slugify } from "@/lib/utils"

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
      .select("id, title, slug, type, security_status, owner:profiles!skills_owner_id_fkey(username)")
      .eq("visibility", "public")
      .ilike("title", `%${query}%`)
      .limit(10),
    supabase
      .from("profiles")
      .select("id, username, name, avatar_url")
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(3)
  ])

  // Filter out quarantined skills from search suggestions
  const safeSkills = (skills || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((s: any) => s.security_status !== "quarantined")
    .slice(0, 5)
  
  return {
    skills: safeSkills,
    profiles: profiles || []
  }
}

export async function submitSkillReport({
  skillId,
  reason,
  details = "",
}: {
  skillId: string
  reason: "malware_virus" | "prompt_injection" | "phishing_spam" | "copyright" | "other"
  details?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to submit a security report." }
  }

  // Rate limit: 5 reports per 5 minutes
  try {
    const { success } = await reportRateLimiter.limit(`report_${user.id}`)
    if (!success) {
      return { error: "Rate limit reached: Please wait a few minutes before submitting another report." }
    }
  } catch (err) {
    console.warn("Report rate limit check error:", err)
  }

  const { error } = await supabase.from("skill_reports").insert({
    skill_id: skillId,
    reporter_id: user.id,
    reason,
    details: details.slice(0, 1000),
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already submitted a report for this skill." }
    }
    console.error("Report submission error:", error)
    return { error: "Unable to submit report right now. Please try again later." }
  }

  return { success: true }
}

export async function publishSkillAction(formData: {
  title: string
  description: string
  category: string
  tags: string[]
  type: "prompt" | "skill"
  content: string
  visibility: "public" | "private"
  confirmedSafe?: boolean
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to publish." }
  }

  // 1. Upstash Rate Limiter Check (5 publishes per 10 mins)
  try {
    const { success } = await publishRateLimiter.limit(`publish_${user.id}`)
    if (!success) {
      return {
        error: "Rate limit reached: You can publish up to 5 skills every 10 minutes. Please wait before publishing more.",
      }
    }
  } catch (err) {
    console.warn("Publish rate limit check error:", err)
  }

  // 2. Length validation
  if (formData.content.length > MAX_CONTENT_CHARS) {
    return {
      error: `Content exceeds the maximum limit of ${MAX_CONTENT_CHARS.toLocaleString()} characters.`,
    }
  }

  // 3. Server-side Threat Scanning (Defense in depth)
  const scan = scanContentForThreats(formData.content, formData.title, formData.description)
  if (scan.hasCritical && !formData.confirmedSafe) {
    const critical = scan.issues.find((i) => i.severity === "critical")
    return {
      needsConfirmation: true,
      error: `Security Verification Required: ${critical?.message || "Dangerous command or exploit pattern detected."}`,
      issues: scan.issues,
    }
  }


  // 4. Fetch profile for redirect slug
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Could not find your profile. Try signing in again." }
  }

  const slug = slugify(formData.title)
  const basePayload = {
    owner_id: user.id,
    title: formData.title,
    slug,
    description: formData.description,
    category: formData.category,
    tags: formData.tags,
    type: formData.type,
    content: formData.content,
    visibility: formData.visibility,
  }

  // Insert with verified security status, fallback if column missing
  const { error: primaryError } = await supabase.from("skills").insert({
    ...basePayload,
    security_status: "verified",
  })

  let insertError = primaryError
  if (primaryError && primaryError.message?.toLowerCase().includes("security_status")) {
    const { error: fallbackError } = await supabase.from("skills").insert(basePayload)
    insertError = fallbackError
  }

  if (insertError) {
    return {
      error:
        insertError.code === "23505"
          ? "You already have something published with that title. Try a different title."
          : "Something went wrong publishing this. Please try again.",
    }
  }

  return { success: true, username: profile.username, slug }
}

export async function moderateSkillAction({
  skillId,
  action,
}: {
  skillId: string
  action: "unflag" | "quarantine" | "restore"
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized." }
  }

  const newStatus = action === "quarantine" ? "quarantined" : "verified"

  const { error } = await supabase
    .from("skills")
    .update({ security_status: newStatus })
    .eq("id", skillId)

  if (error) {
    return { error: "Failed to update skill moderation status." }
  }

  // If unflagging or restoring, clean up unresolved reports
  if (action === "unflag" || action === "restore") {
    await supabase.from("skill_reports").delete().eq("skill_id", skillId)
  }

  return { success: true, status: newStatus }
}

export async function deleteSkillAction(skillId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to delete a prompt or skill." }
  }

  // 1. Fetch skill to verify ownership
  const { data: skill, error: fetchError } = await supabase
    .from("skills")
    .select("id, owner_id, slug, type, title")
    .eq("id", skillId)
    .single()

  if (fetchError || !skill) {
    return { error: "The requested prompt or skill could not be found." }
  }

  if (skill.owner_id !== user.id) {
    return { error: "Unauthorized: You can only delete content that you uploaded." }
  }

  // 2. Fetch owner profile for revalidation & redirect target
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  // 3. Delete the skill (RLS policy enforces owner delete; CASCADE drops reports)
  const { error: deleteError } = await supabase
    .from("skills")
    .delete()
    .eq("id", skillId)
    .eq("owner_id", user.id)

  if (deleteError) {
    console.error("Delete skill error:", deleteError)
    return { error: "Failed to delete from the database. Please try again." }
  }

  // 4. Invalidate relevant caches
  revalidatePath("/")
  revalidatePath("/explore")
  revalidatePath("/trending")
  if (profile?.username) {
    revalidatePath(`/${profile.username}`)
    revalidatePath(`/${profile.username}/${skill.slug}`)
  }

  return { success: true, username: profile?.username || "" }
}


