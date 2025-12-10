import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { createClient } from '@/lib/supabase/server'

interface MainLayoutProps {
  children: ReactNode
}

export async function MainLayout({ children }: MainLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      <Footer />

      <MobileNav isAuthenticated={!!user} />
    </div>
  )
}
