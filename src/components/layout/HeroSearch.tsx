"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSearch() {
  return (
    <div className="w-full max-w-2xl relative group">
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div 
        className="relative flex items-center bg-background border border-border rounded-xl shadow-sm overflow-hidden p-1 focus-within:ring-2 focus-within:ring-primary/50 transition-shadow cursor-text"
        onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      >
        <Search className="h-5 w-5 ml-3 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search prompts, skills, or creators... (Cmd+K)" 
          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground cursor-pointer"
          readOnly
        />
        <Button className="rounded-lg px-6">Search</Button>
      </div>
    </div>
  )
}
