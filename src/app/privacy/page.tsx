import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy - Kunbase",
  description: "How Kunbase collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 3, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">1. Who we are</h2>
          <p>
            Kunbase is an open registry for Prompts and AI Skills, operated by NousKūn Ai. This
            policy explains what information we collect and how we use it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">2. Information we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="text-foreground">Account information:</span> your email address and,
              if you sign in with a third-party provider, the name, username, and avatar that
              provider shares with us.
            </li>
            <li>
              <span className="text-foreground">Onboarding answers:</span> the details you give us
              when setting up your profile.
            </li>
            <li>
              <span className="text-foreground">Content:</span> the prompts and skills you publish,
              and your stars on other people&apos;s content.
            </li>
            <li>
              <span className="text-foreground">Technical data:</span> your IP address, used to
              rate-limit requests and protect the service, and basic server logs.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">3. How we use it</h2>
          <p>
            We use this information to operate Kunbase: to sign you in, show your public profile
            and published content, count views, copies, and stars, and prevent abuse. We do not
            sell your personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">4. What is public</h2>
          <p>
            Your username, display name, avatar, and any content you publish as public are visible
            to everyone. Content marked private is visible only to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">5. Service providers</h2>
          <p>
            We rely on Supabase for authentication and database storage, Vercel for hosting, and
            Upstash for rate limiting. These providers process data on our behalf.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">6. Cookies</h2>
          <p>
            We use cookies that are necessary to keep you signed in. We do not use advertising
            cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">7. Your choices</h2>
          <p>
            You can edit or delete the content you publish at any time. You may also ask us to
            delete your account and the personal information associated with it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">8. Changes</h2>
          <p>
            We may update this policy as the service evolves, and will change the date at the top
            of this page when we do.
          </p>
        </section>

        <p>
          See also our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
