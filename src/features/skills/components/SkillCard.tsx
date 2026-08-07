"use client"

import Link from "next/link"
import { Star, Copy, Eye, Sparkles, Code2 } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Matches the Supabase DB join structure
export interface DatabaseSkill {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  type: string
  stars_count: number
  views_count: number
  copies_count: number
  profiles: {
    username: string
    name: string
    avatar_url: string | null
  }
}

interface SkillCardProps {
  skill: DatabaseSkill
  index?: number
  isTrending?: boolean
}

export function SkillCard({ skill, index = 0, isTrending = false }: SkillCardProps) {
  const profile = Array.isArray(skill.profiles) ? skill.profiles[0] : skill.profiles

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/${profile?.username || "unknown"}/${skill.slug}`} className="block h-full outline-none">
        <Card className={`group flex h-full flex-col overflow-hidden relative ${isTrending ? 'glass-panel' : 'bg-card/40 border-white/5 backdrop-blur-md'} transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)] hover:border-primary/30`}>
          
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
            <div className="flex items-center space-x-3">
              <Avatar className="h-9 w-9 ring-1 ring-white/10 group-hover:ring-primary/30 transition-all">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || ""} />
                <AvatarFallback className="bg-background/50 backdrop-blur-sm">{(profile?.name || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none text-foreground">{profile?.name}</span>
                <span className="text-xs text-muted-foreground mt-1">@{profile?.username}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-white/10 font-normal">
                {skill.type === "prompt" ? <Sparkles className="w-3 h-3 mr-1 text-yellow-400" /> : <Code2 className="w-3 h-3 mr-1 text-blue-400" />}
                {skill.type}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 pt-4 relative z-10">
            <h3 className="font-bold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-300">
              {skill.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {skill.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {skill.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/30 text-xs font-normal hover:bg-secondary/50 transition-colors">
                  {tag}
                </Badge>
              ))}
              {skill.tags?.length > 3 && (
                <Badge variant="secondary" className="bg-transparent border border-white/5 text-xs font-normal text-muted-foreground">
                  +{skill.tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex items-center justify-between border-t border-white/5 bg-black/20 py-3 text-xs text-muted-foreground relative z-10">
            <div className="flex items-center space-x-4">
              <span className="flex items-center group/stat hover:text-yellow-400 transition-colors cursor-default">
                <Star className="mr-1.5 h-3.5 w-3.5 group-hover/stat:fill-yellow-400 transition-colors" />
                {skill.stars_count?.toLocaleString() || 0}
              </span>
              <span className="flex items-center group/stat hover:text-blue-400 transition-colors cursor-default">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {skill.copies_count?.toLocaleString() || 0}
              </span>
            </div>
            <span className="flex items-center opacity-70">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {skill.views_count?.toLocaleString() || 0}
            </span>
          </CardFooter>
          
        </Card>
      </Link>
    </motion.div>
  )
}

