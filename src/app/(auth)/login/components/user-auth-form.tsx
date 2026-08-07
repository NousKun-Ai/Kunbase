"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Shield, Lock, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>
type Mode = "signin" | "signup"
type Loading = "github" | "google" | "sso" | "password" | null

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "signin"

  const [mode, setMode] = React.useState<Mode>(initialMode)
  const [isLoading, setIsLoading] = React.useState<Loading>(null)
  const [ssoDomain, setSsoDomain] = React.useState("")
  const [showSsoInput, setShowSsoInput] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error") === "auth_failed"
      ? "We couldn't sign you in. Please try again."
      : null
  )
  const [message, setMessage] = React.useState<string | null>(null)
  const supabase = createClient()

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function onOAuthSubmit(provider: "github" | "google") {
    setError(null)
    setIsLoading(provider)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(null)
    }
  }

  async function onSsoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ssoDomain) return
    setError(null)
    setIsLoading("sso")

    const { data, error } = await supabase.auth.signInWithSSO({
      domain: ssoDomain,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(null)
    } else if (data?.url) {
      window.location.href = data.url
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading("password")

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setIsLoading(null)
        return
      }

      // Supabase returns a user with no identities when the email is already
      // registered, without surfacing it as an error.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Try signing in instead.")
        setIsLoading(null)
        return
      }

      if (!data.session) {
        setMessage("Check your email to confirm your account before signing in.")
        setIsLoading(null)
        return
      }

      router.push("/")
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      )
      setIsLoading(null)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={cn(
            "rounded-md py-1.5 font-medium transition-all",
            mode === "signin"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={cn(
            "rounded-md py-1.5 font-medium transition-all",
            mode === "signup"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Create account
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={onPasswordSubmit} className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading !== null}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading !== null}
            minLength={6}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading !== null}>
          {isLoading === "password" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lock className="mr-2 h-4 w-4" />
          )}{" "}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading !== null}
        onClick={() => onOAuthSubmit("github")}
      >
        {isLoading === "github" ? (
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
        onClick={() => onOAuthSubmit("google")}
      >
        {isLoading === "google" ? (
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
            {isLoading === "sso" ? (
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
