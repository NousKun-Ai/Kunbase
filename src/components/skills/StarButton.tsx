"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StarButtonProps {
  initialStars: number
}

export function StarButton({ initialStars }: StarButtonProps) {
  const [hasStarred, setHasStarred] = React.useState(false)
  const [stars, setStars] = React.useState(initialStars)

  const handleToggleStar = () => {
    if (hasStarred) {
      setStars(prev => prev - 1)
      setHasStarred(false)
    } else {
      setStars(prev => prev + 1)
      setHasStarred(true)
    }
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
          className="h-7 px-2 text-xs rounded-full"
          onClick={handleToggleStar}
        >
          {hasStarred ? "Starred" : "Star"}
        </Button>
      </div>
    </div>
  )
}
