import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForm } from "./components/user-auth-form"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Login - Kunbase",
  description: "Login to your Kunbase account.",
}

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="relative z-20 flex items-center text-lg font-bold">
          <Logo className="mr-3 h-6 w-6" />
          Kunbase
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Kunbase completely changed how we discover and integrate AI Skills. It&apos;s the open registry we always needed.&quot;
            </p>
            <footer className="text-sm">Sofia Davis, AI Engineer</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8 h-full flex items-center justify-center bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Continue with GitHub to sign in to your account
            </p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
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
