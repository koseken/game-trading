import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン / アカウント作成',
  description: 'ゲーム取引プラットフォーム - ログイン / アカウント作成',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
