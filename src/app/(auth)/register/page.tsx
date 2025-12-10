import { RegisterForm } from '@/components/features/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アカウント作成',
  description: 'ゲーム取引プラットフォームのアカウントを作成',
}

export default function RegisterPage() {
  return <RegisterForm />
}
