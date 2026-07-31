import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              NousKūn Ai
            </a>
            . The open registry for Prompts & AI Skills.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline underline-offset-4">Terms</Link>
          <Link href="/privacy" className="hover:underline underline-offset-4">Privacy</Link>
          <a href="#" className="hover:underline underline-offset-4">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
