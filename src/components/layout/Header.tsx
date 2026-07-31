import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { HeaderSearchButton } from "./HeaderSearchButton"
import { UserNav } from "./UserNav"
import { createClient } from "@/lib/supabase/server"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { username: string; name: string; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, name, avatar_url")
      .eq("id", user.id)
      .single()
    profile = data
  }

  const isLoggedIn = !!user

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8 mx-auto justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 mr-6 text-foreground hover:text-foreground/80 transition-colors">
            <Logo className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">Kunbase</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60">Explore</Link>
            <Link href="/trending" className="transition-colors hover:text-foreground/80 text-foreground/60">Trending</Link>
          </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <HeaderSearchButton />
          </div>
          <nav className="flex items-center space-x-3">
            {!isLoggedIn ? (
              <Link href="/login" className={buttonVariants({ variant: "ghost", className: "h-8 px-3" })}>
                Sign In
              </Link>
            ) : null}
            <Link href="/upload" className={buttonVariants({ className: "h-8 px-3" })}>
              Publish
            </Link>
            {isLoggedIn && (
              <UserNav
                email={user!.email ?? ""}
                username={profile?.username ?? ""}
                name={profile?.name || user!.email || ""}
                avatarUrl={profile?.avatar_url ?? undefined}
              />
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
