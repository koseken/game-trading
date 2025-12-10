'use client'

import { useEffect, useState } from 'react'
import { StarRating } from './StarRating'
import type { Review, User } from '@/types/database'

type ReviewWithReviewer = Review & {
  reviewer: User
}

interface ReviewListProps {
  userId: string
}

export function ReviewList({ userId }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewWithReviewer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reviews`)

        if (!response.ok) {
          throw new Error('レビューの取得に失敗しました')
        }

        const data = await response.json()
        setReviews(data.reviews || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {error}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">まだ評価がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {review.reviewer.avatar_url ? (
                  <img
                    src={review.reviewer.avatar_url}
                    alt={review.reviewer.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    {review.reviewer.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {review.reviewer.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>

          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
