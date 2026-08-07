import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CommandMenu } from "@/components/layout/CommandMenu"
import { PageTransition } from "@/components/layout/PageTransition"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Kunbase | The Open Registry for Prompts & AI Skills",
  description: "Discover, publish, copy, and fork Prompts & AI Skills. Built by NousKūn Ai.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-transparent font-sans antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <PageTransition>{children}</PageTransition>
          <Footer />
        </div>
        <CommandMenu />
      </body>
    </html>
  )
}
