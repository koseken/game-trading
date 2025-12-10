'use client'

import { MobileNav } from './MobileNav'

interface MainLayoutClientProps {
  children: React.ReactNode
  isAuthenticated: boolean
}

export function MainLayoutClient({ children, isAuthenticated }: MainLayoutClientProps) {
  return (
    <>
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav isAuthenticated={isAuthenticated} />
    </>
  )
}
