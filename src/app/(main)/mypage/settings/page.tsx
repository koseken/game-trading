import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileSettingsForm } from './ProfileSettingsForm'
import { PasswordChangeForm } from './PasswordChangeForm'
import { User } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const user = data as User | null

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">設定</h1>
        <p className="text-gray-600">
          プロフィール情報やアカウント設定を管理します
        </p>
      </div>

      {/* Profile Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          プロフィール設定
        </h2>
        <ProfileSettingsForm user={user} />
      </div>

      {/* Password Change */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          パスワード変更
        </h2>
        <PasswordChangeForm />
      </div>

      {/* Email (read-only) */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          メールアドレス
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">登録メールアドレス</p>
          <p className="font-medium text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-500 mt-2">
            メールアドレスの変更はサポートにお問い合わせください
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          アカウント情報
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">ユーザーID</span>
            <span className="font-mono text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">登録日</span>
            <span className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">最終更新</span>
            <span className="text-gray-900">
              {new Date(user.updated_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
