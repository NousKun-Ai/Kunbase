import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { UserAuthForm } from "./components/user-auth-form"
import { Logo } from "@/components/ui/logo"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Login - Kunbase",
  description: "Login to your Kunbase account.",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const isOnboarded = user.user_metadata?.onboarded === true
    redirect(isOnboarded ? "/" : "/onboarding")
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative z-20 flex items-center text-lg font-bold">
          <Logo className="mr-3 h-6 w-6" />
          Kunbase
        </div>
        <div className="relative z-20">
          <blockquote className="space-y-3">
            <p className="text-lg leading-relaxed">
              &quot;Kunbase completely changed how we discover and integrate AI Skills. It&apos;s the open registry we always needed.&quot;
            </p>
            <footer className="text-sm text-zinc-400">Sofia Davis, AI Engineer</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex h-full items-center justify-center bg-background p-6 sm:p-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center gap-6">
          <div className="flex flex-col items-center gap-2 text-center lg:hidden">
            <Logo className="h-8 w-8" />
          </div>

          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Get Started
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in or create a new account to continue
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <Suspense fallback={null}>
              <UserAuthForm />
            </Suspense>
          </div>

          <p className="px-4 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
