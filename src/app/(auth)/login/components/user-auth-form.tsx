"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

const Github = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<"github" | "google" | "sso" | null>(null)
  const [ssoDomain, setSsoDomain] = React.useState("")
  const [showSsoInput, setShowSsoInput] = React.useState(false)
  const supabase = createClient()

  async function onOAuthSubmit(provider: 'github' | 'google') {
    setIsLoading(provider)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error(error)
      setIsLoading(null)
    }
  }

  async function onSsoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ssoDomain) return
    setIsLoading("sso")

    const { data, error } = await supabase.auth.signInWithSSO({
      domain: ssoDomain,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      }
    })

    if (error) {
      console.error(error)
      setIsLoading(null)
    } else if (data?.url) {
      // Redirect to the Identity Provider
      window.location.href = data.url
    }
  }

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading !== null} 
        onClick={() => onOAuthSubmit('github')}
      >
        {isLoading === 'github' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Github className="mr-2 h-4 w-4" />
        )}{" "}
        Continue with GitHub
      </Button>

      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoading !== null} 
        onClick={() => onOAuthSubmit('google')}
      >
        {isLoading === 'google' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}{" "}
        Continue with Google
      </Button>

      {showSsoInput ? (
        <form onSubmit={onSsoSubmit} className="flex flex-col gap-2 pt-2 border-t">
          <Input 
            type="text" 
            placeholder="Company domain (e.g. acme.com)" 
            value={ssoDomain}
            onChange={(e) => setSsoDomain(e.target.value)}
            disabled={isLoading !== null}
            required
          />
          <Button 
            variant="default" 
            type="submit" 
            disabled={isLoading !== null || !ssoDomain}
          >
            {isLoading === 'sso' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}{" "}
            Sign in with SSO
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs" 
            onClick={() => setShowSsoInput(false)}
            type="button"
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading !== null} 
          onClick={() => setShowSsoInput(true)}
        >
          <Shield className="mr-2 h-4 w-4" />
          Continue with SSO
        </Button>
      )}
    </div>
  )
}
