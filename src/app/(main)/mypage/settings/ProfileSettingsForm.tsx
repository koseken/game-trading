'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Upload } from 'lucide-react'
import type { User } from '@/types/database'

interface ProfileSettingsFormProps {
  user: User
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState(user.username)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('JPEG、PNG、WebP、GIF形式の画像のみアップロード可能です')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload to Supabase Storage via API
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'アップロードに失敗しました')
      }

      setAvatarUrl(result.url)
      setSuccess('アバター画像をアップロードしました')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (username.trim().length < 3) {
      setError('ユーザー名は3文字以上で入力してください')
      return
    }

    if (username.trim().length > 20) {
      setError('ユーザー名は20文字以内で入力してください')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          avatar_url: avatarUrl || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '更新に失敗しました')
      }

      setSuccess('プロフィールを更新しました')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          アバター画像
        </label>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {isUploading ? 'アップロード中...' : '画像を選択'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPEG、PNG、WebP、GIF (最大5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          ユーザー名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_-]+"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="username123"
        />
        <p className="text-xs text-gray-500 mt-1">
          英数字、ハイフン、アンダースコアのみ使用可能 (3-20文字)
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setUsername(user.username)
            setAvatarUrl(user.avatar_url || '')
            setError(null)
            setSuccess(null)
          }}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          リセット
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '更新中...' : '変更を保存'}
        </button>
      </div>
    </form>
  )
}
