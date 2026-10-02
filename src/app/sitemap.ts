import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const BASE_URL = "https://kunbase.space"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/trending`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return staticRoutes

  // Cookie-less anon client: only public rows are visible, and the route stays cacheable.
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } })

  const { data: skills } = await supabase
    .from("skills")
    .select("slug, owner_id, created_at")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(5000)

  const rawSkills = skills || []
  const ownerIds = [...new Set(rawSkills.map(s => s.owner_id))]
  const { data: profiles } = ownerIds.length > 0
    ? await supabase.from("profiles").select("id, username").in("id", ownerIds)
    : { data: [] }

  const usernames = new Map((profiles || []).map(p => [p.id, p.username]))

  const profileRoutes: MetadataRoute.Sitemap = [...usernames.values()].map(username => ({
    url: `${BASE_URL}/${username}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }))

  const skillRoutes: MetadataRoute.Sitemap = rawSkills
    .filter(s => usernames.has(s.owner_id))
    .map(s => ({
      url: `${BASE_URL}/${usernames.get(s.owner_id)}/${s.slug}`,
      lastModified: s.created_at,
      changeFrequency: "weekly",
      priority: 0.7,
    }))

  return [...staticRoutes, ...profileRoutes, ...skillRoutes]
}
