import React from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: '管理画面 - ゲームトレーディング',
  description: '管理者用ダッシュボード',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('username, email, is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={userData} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
