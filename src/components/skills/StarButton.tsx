"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleStar } from "@/app/actions"

interface StarButtonProps {
  skillId: string
  initialStars: number
}

export function StarButton({ skillId, initialStars }: StarButtonProps) {
  const [hasStarred, setHasStarred] = React.useState(false)
  const [stars, setStars] = React.useState(initialStars || 0)
  const [isPending, startTransition] = React.useTransition()

  const handleToggleStar = () => {
    const newlyStarred = !hasStarred
    
    // Optimistic update
    setStars(prev => newlyStarred ? prev + 1 : prev - 1)
    setHasStarred(newlyStarred)

    startTransition(async () => {
      try {
        await toggleStar(skillId, !newlyStarred) // passing previous state
      } catch (_err) {
        // Revert on error (e.g. RLS failure)
        setStars(prev => newlyStarred ? prev - 1 : prev + 1)
        setHasStarred(!newlyStarred)
      }
    })
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground flex items-center">
        <Star className="mr-2 h-4 w-4" /> Stars
      </span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{stars.toLocaleString()}</span>
        <Button 
          variant={hasStarred ? "default" : "outline"} 
          size="sm" 
          className="h-7 px-3 text-xs rounded-full transition-all"
          onClick={handleToggleStar}
          disabled={isPending}
        >
          {hasStarred ? "Starred" : "Star"}
        </Button>
      </div>
    </div>
  )
}
