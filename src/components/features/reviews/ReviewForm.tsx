'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from './StarRating'
import { createReviewSchema, type CreateReviewInput } from '@/lib/validations/user'

interface ReviewFormProps {
  transactionId: string
  revieweeId: string
  revieweeName: string
  onSuccess?: () => void
}

export function ReviewForm({
  transactionId,
  revieweeId,
  revieweeName,
  onSuccess,
}: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('評価を選択してください')
      return
    }

    try {
      const data: CreateReviewInput = {
        transaction_id: transactionId,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
      }

      const validated = createReviewSchema.parse(data)

      setIsSubmitting(true)

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '評価の投稿に失敗しました')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
        router.push('/mypage/purchases')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('評価の投稿に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {revieweeName}さんへの評価
        </h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          評価 <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          コメント（任意）
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="取引の感想や相手の良かった点などを入力してください"
        />
        <div className="mt-1 text-right text-xs text-gray-500">
          {comment.length} / 500
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '投稿中...' : '評価を投稿'}
        </button>
      </div>
    </form>
  )
}
