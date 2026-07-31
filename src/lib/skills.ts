import type { MockSkill } from "@/lib/mock-data"

export interface SkillRow {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  type: "skill" | "prompt"
  content: string
  visibility: "public" | "private"
  stars_count: number
  views_count: number
  copies_count: number
  created_at: string
  owner: {
    name: string
    username: string
    avatar_url: string | null
  } | null
}

export function toMockSkill(row: SkillRow): MockSkill {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    tags: row.tags,
    type: row.type,
    content: row.content,
    createdAt: row.created_at,
    creator: {
      name: row.owner?.name ?? "Unknown",
      username: row.owner?.username ?? "unknown",
      avatar: row.owner?.avatar_url ?? "",
    },
    stats: {
      stars: row.stars_count,
      copies: row.copies_count,
      views: row.views_count,
    },
  }
}
