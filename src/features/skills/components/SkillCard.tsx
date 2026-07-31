import Link from "next/link"
import { Star, Copy, Eye } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { MockSkill } from "@/lib/mock-data"

interface SkillCardProps {
  skill: MockSkill
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link href={`/${skill.creator.username}/${skill.slug}`}>
      <Card className="group flex h-full flex-col overflow-hidden transition-all hover:bg-muted/30 hover:border-primary/50">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={skill.creator.avatar} alt={skill.creator.name} />
              <AvatarFallback>{skill.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none text-foreground">{skill.creator.name}</span>
              <span className="text-xs text-muted-foreground">@{skill.creator.username}</span>
            </div>
          </div>
          <Badge variant="secondary" className="font-normal">{skill.category}</Badge>
        </CardHeader>
        <CardContent className="flex-1 pt-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">{skill.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal opacity-70">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/10 py-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Star className="mr-1 h-3.5 w-3.5" />
              {skill.stats.stars.toLocaleString()}
            </span>
            <span className="flex items-center">
              <Copy className="mr-1 h-3.5 w-3.5" />
              {skill.stats.copies.toLocaleString()}
            </span>
          </div>
          <span className="flex items-center">
            <Eye className="mr-1 h-3.5 w-3.5" />
            {skill.stats.views.toLocaleString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
