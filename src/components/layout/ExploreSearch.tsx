"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function ExploreSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push(`/explore`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="pt-4 max-w-xl relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search all skills..." 
          className="w-full h-14 pl-12 pr-4 rounded-xl bg-background/50 border border-white/10 backdrop-blur-md outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/70"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="hidden">Search</button>
      </div>
    </form>
  )
}
