'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PurchaseButtonProps {
  listingId: string
  sellerId: string
  status: string
  isAuthenticated: boolean
}

export function PurchaseButton({ listingId, sellerId, status, isAuthenticated }: PurchaseButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePurchaseRequest = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    setIsSubmitting(true)

    try {
      // Create a transaction request
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          seller_id: sellerId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '購入リクエストに失敗しました')
      }

      const transaction = await response.json()

      // Redirect to transaction page
      router.push(`/transactions/${transaction.id}`)
    } catch (error) {
      console.error('Purchase request error:', error)
      alert(error instanceof Error ? error.message : '購入リクエストに失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'sold') {
    return (
      <button
        disabled
        className="block w-full py-3 px-4 bg-gray-400 text-white text-center rounded-lg font-semibold cursor-not-allowed"
      >
        売り切れ
      </button>
    )
  }

  if (status === 'reserved') {
    return (
      <button
        disabled
        className="block w-full py-3 px-4 bg-yellow-500 text-white text-center rounded-lg font-semibold cursor-not-allowed"
      >
        交渉中
      </button>
    )
  }

  return (
    <button
      onClick={handlePurchaseRequest}
      disabled={isSubmitting}
      className="block w-full py-3 px-4 bg-red-600 text-white text-center rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isSubmitting ? '送信中...' : '購入希望を送る'}
    </button>
  )
}
