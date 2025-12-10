'use client'

import Link from 'next/link'
import type { TransactionWithDetails } from '@/types/database'
import { ArrowLeft, Package } from 'lucide-react'

interface TransactionHeaderProps {
  transaction: TransactionWithDetails
}

const statusLabels = {
  pending: '保留中',
  in_progress: '取引中',
  completed: '完了',
  cancelled: 'キャンセル',
} as const

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
} as const

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  const { listing, status } = transaction

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top bar with back button */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <Link
          href="/transactions"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">取引チャット</h1>
      </div>

      {/* Listing info */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          {/* Listing image */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Listing details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {listing.title}
            </h2>
            <p className="text-lg font-bold text-gray-900 mb-2">
              ¥{listing.price.toLocaleString()}
            </p>
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[status]
                }`}
              >
                {statusLabels[status]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
