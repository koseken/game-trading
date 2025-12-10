import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MainLayoutClient } from '@/components/layout/MainLayoutClient'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MainLayoutClient isAuthenticated={!!user}>
        {children}
      </MainLayoutClient>
      <Footer />
    </div>
  )
}
