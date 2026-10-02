import type { Metadata } from "next"
import { Suspense } from "react"
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
  metadataBase: new URL("https://kunbase.space"),
  title: "Kunbase | The Open Registry for Prompts & AI Skills",
  description: "Discover, publish, copy, and fork Prompts & AI Skills. Built by NousKūn Ai.",
}

import { SiteLayout } from "@/components/layout/SiteLayout"

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
        <SiteLayout 
          header={
            <Suspense fallback={<div className="h-14 border-b border-border/40 bg-background/95"></div>}>
              <Header />
            </Suspense>
          } 
          footer={<Footer />}
        >
          <PageTransition>{children}</PageTransition>
        </SiteLayout>
        <CommandMenu />
      </body>
    </html>
  )
}
