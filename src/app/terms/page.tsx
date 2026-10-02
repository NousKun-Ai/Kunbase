import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service - Kunbase",
  description: "The terms that govern your use of Kunbase.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 3, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">1. About Kunbase</h2>
          <p>
            Kunbase is an open registry for Prompts and AI Skills, operated by NousKūn Ai. By
            creating an account or using the site, you agree to these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">2. Your account</h2>
          <p>
            You are responsible for the activity on your account and for keeping your sign-in
            method secure. You must provide accurate information and may not impersonate another
            person or organization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">3. Content you publish</h2>
          <p>
            You keep ownership of the prompts and skills you publish. By publishing content as
            public, you grant Kunbase the right to host and display it, and you allow other users
            to view, copy, and fork it. Only publish content you have the right to share.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>publish content that is illegal, harmful, or infringes the rights of others;</li>
            <li>publish secrets, credentials, or other people&apos;s personal information;</li>
            <li>attempt to disrupt, overload, or gain unauthorized access to the service;</li>
            <li>scrape or automate the service in a way that circumvents rate limits.</li>
          </ul>
          <p>We may remove content or suspend accounts that violate these terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">5. No warranty</h2>
          <p>
            Kunbase and the content on it are provided &quot;as is&quot;. Prompts and skills are
            written by users; we do not review them for accuracy or safety, and you use them at
            your own risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">6. Limitation of liability</h2>
          <p>
            To the extent permitted by law, NousKūn Ai is not liable for indirect, incidental, or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">7. Changes</h2>
          <p>
            We may update these terms as the service evolves. Continued use of Kunbase after a
            change means you accept the updated terms.
          </p>
        </section>

        <p>
          See also our{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
