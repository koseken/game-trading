'use client'

import Link from 'next/link'
import { MessageSquare, Star } from 'lucide-react'
import type { Transaction, Listing, User } from '@/types/database'

type TransactionWithDetails = Transaction & {
  listing: Listing
  seller: User
}

interface PurchaseCardProps {
  transaction: TransactionWithDetails
  hasReviewed: boolean
}

const statusLabels = {
  pending: '保留中',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function PurchaseCard({ transaction, hasReviewed }: PurchaseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {transaction.listing.images && transaction.listing.images.length > 0 ? (
              <img
                src={transaction.listing.images[0]}
                alt={transaction.listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                href={`/listings/${transaction.listing.id}`}
                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
              >
                {transaction.listing.title}
              </Link>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                  statusColors[transaction.status]
                }`}
              >
                {statusLabels[transaction.status]}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {transaction.seller.avatar_url ? (
                  <img
                    src={transaction.seller.avatar_url}
                    alt={transaction.seller.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs flex items-center justify-center h-full">
                    {transaction.seller.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {transaction.seller.username}
              </span>
            </div>

            <p className="text-lg font-bold text-gray-900 mb-3">
              ¥{transaction.listing.price.toLocaleString()}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span>
                購入日: {new Date(transaction.created_at).toLocaleDateString('ja-JP')}
              </span>
              {transaction.completed_at && (
                <span>
                  • 完了日: {new Date(transaction.completed_at).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/chat/${transaction.id}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                チャット
              </Link>

              {transaction.status === 'completed' && !hasReviewed && (
                <Link
                  href={`/reviews/new?transaction=${transaction.id}&reviewee=${transaction.seller.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  評価する
                </Link>
              )}

              {transaction.status === 'completed' && hasReviewed && (
                <span className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-500 rounded-lg">
                  <Star className="w-4 h-4" />
                  評価済み
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
