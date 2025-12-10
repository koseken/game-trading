'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/hooks/useChat'
import { useTransaction } from '@/hooks/useTransaction'
import { ChatRoom } from '@/components/features/chat/ChatRoom'
import { MessageInput } from '@/components/features/chat/MessageInput'
import { TransactionHeader } from '@/components/features/chat/TransactionHeader'
import { Loader2, Star } from 'lucide-react'

export default function TransactionPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.id as string
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      } else {
        router.push('/auth/login')
      }
    }
    getUser()
  }, [supabase, router])

  const {
    transaction,
    loading: transactionLoading,
    error: transactionError,
    completeTransaction,
    updating,
  } = useTransaction({
    transactionId,
    enabled: !!currentUserId,
  })

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    sending,
  } = useChat({
    transactionId,
    enabled: !!currentUserId,
  })

  const handleCompleteTransaction = async () => {
    if (!confirm('取引を完了してもよろしいですか？')) {
      return
    }

    try {
      await completeTransaction()
      setShowReviewForm(true)
    } catch (error) {
      alert('取引の完了に失敗しました')
    }
  }

  const handleSubmitReview = async () => {
    if (!transaction || !currentUserId) return

    try {
      setSubmittingReview(true)

      const revieweeId = currentUserId === transaction.seller_id
        ? transaction.buyer_id
        : transaction.seller_id

      const { error } = await supabase
        .from('reviews')
        .insert({
          transaction_id: transactionId,
          reviewer_id: currentUserId,
          reviewee_id: revieweeId,
          rating,
          comment: comment.trim() || null,
        })

      if (error) throw error

      alert('レビューを投稿しました')
      setShowReviewForm(false)
      router.push('/transactions')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('レビューの投稿に失敗しました')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!currentUserId || transactionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (transactionError || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            取引が見つかりません
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {transactionError?.message || '取引情報の取得に失敗しました'}
          </p>
          <button
            onClick={() => router.push('/transactions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            取引一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  const isSeller = currentUserId === transaction.seller_id
  const canComplete = isSeller && transaction.status === 'in_progress'
  const isCompleted = transaction.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <TransactionHeader transaction={transaction} />

      {/* Chat Room */}
      <ChatRoom
        messages={messages}
        currentUserId={currentUserId}
        loading={messagesLoading}
      />

      {/* Complete Transaction Button (Seller only, when in_progress) */}
      {canComplete && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <button
            onClick={handleCompleteTransaction}
            disabled={updating}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? '処理中...' : '取引完了'}
          </button>
        </div>
      )}

      {/* Review Form (after completion) */}
      {isCompleted && showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              レビューを投稿
            </h2>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                コメント（任意）
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="取引の感想を入力してください"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewForm(false)}
                disabled={submittingReview}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                スキップ
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {submittingReview ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      {!isCompleted && (
        <MessageInput
          onSend={sendMessage}
          disabled={isCompleted}
          sending={sending}
        />
      )}

      {/* Completed Message Input (disabled) */}
      {isCompleted && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            取引が完了しました
          </div>
        </div>
      )}
    </div>
  )
}
