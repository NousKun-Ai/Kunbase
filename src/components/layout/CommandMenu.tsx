"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Moon, Sun, Laptop, User, FileText, Code2, Loader2 } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { searchRegistry } from "@/app/actions"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<{ skills: any[], profiles: any[] }>({ skills: [], profiles: [] })
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    
    const handleOpenMenu = () => setOpen(true)
    window.addEventListener("open-command-palette", handleOpenMenu)

    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-command-palette", handleOpenMenu)
    }
  }, [])

  // Debounced search
  React.useEffect(() => {
    if (!query) {
      setResults({ skills: [], profiles: [] })
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await searchRegistry(query)
        setResults(res)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search prompts, skills, creators, or settings..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>
        
        {!query && (
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => router.push("/explore"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Explore Skills</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/trending"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Trending</span>
            </CommandItem>
          </CommandGroup>
        )}

        {results.profiles.length > 0 && (
          <CommandGroup heading="Creators">
            {results.profiles.map(profile => (
              <CommandItem 
                key={profile.id} 
                onSelect={() => runCommand(() => router.push(`/${profile.username}`))}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{profile.name} (@{profile.username})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.skills.length > 0 && (
          <CommandGroup heading="Skills & Prompts">
            {results.skills.map(skill => (
              <CommandItem 
                key={skill.id} 
                onSelect={() => runCommand(() => router.push(`/${skill.owner.username}/${skill.slug}`))}
              >
                {skill.type === 'prompt' ? <FileText className="mr-2 h-4 w-4" /> : <Code2 className="mr-2 h-4 w-4" />}
                <span>{skill.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">by @{skill.owner.username}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => {})}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {})}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {})}>
            <Laptop className="mr-2 h-4 w-4" />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
