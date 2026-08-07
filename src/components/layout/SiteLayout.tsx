'use client'

import { usePathname } from 'next/navigation'

export function SiteLayout({ 
  header, 
  children, 
  footer 
}: { 
  header: React.ReactNode, 
  children: React.ReactNode, 
  footer: React.ReactNode 
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/onboarding') || pathname?.startsWith('/auth')

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isAuthPage && header}
      {children}
      {!isAuthPage && footer}
    </div>
  )
}
