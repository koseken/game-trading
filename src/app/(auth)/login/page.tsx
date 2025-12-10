import { Suspense } from 'react'
import { LoginForm } from '@/components/features/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'ゲーム取引プラットフォームにログイン',
}

function LoginPageContent() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
