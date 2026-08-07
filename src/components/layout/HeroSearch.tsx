"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSearch() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/explore')
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center bg-background border border-white/10 rounded-xl shadow-sm p-1 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
        <Search className="h-5 w-5 ml-3 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search prompts, skills, or creators..." 
          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" className="rounded-lg px-6">Search</Button>
      </div>
    </form>
  )
}
