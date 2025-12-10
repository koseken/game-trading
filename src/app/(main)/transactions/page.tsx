'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TransactionWithDetails } from '@/types/database'
import { Loader2, MessageSquare, Package } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils/date'

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

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying')
  const supabase = createClient()

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

  const fetchTransactions = useCallback(async () => {
    if (!currentUserId) return

    try {
      setLoading(true)

      const query = supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey(*),
          buyer:users!transactions_buyer_id_fkey(*),
          seller:users!transactions_seller_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      // Filter based on active tab
      if (activeTab === 'buying') {
        query.eq('buyer_id', currentUserId)
      } else {
        query.eq('seller_id', currentUserId)
      }

      const { data, error } = await query

      if (error) throw error

      setTransactions(data as unknown as TransactionWithDetails[])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, activeTab, supabase])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  if (!currentUserId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">取引一覧</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('buying')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'buying'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              購入中
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'selling'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              出品中
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4">
          {transactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                取引がありません
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {activeTab === 'buying'
                  ? '商品を購入して取引を始めましょう'
                  : '商品が購入されると取引が開始されます'}
              </p>
              {activeTab === 'buying' && (
                <Link
                  href="/"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  商品を探す
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const otherUser = activeTab === 'buying'
                  ? transaction.seller
                  : transaction.buyer

                return (
                  <Link
                    key={transaction.id}
                    href={`/transactions/${transaction.id}`}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Listing Image */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 overflow-hidden">
                          {transaction.listing.images && transaction.listing.images.length > 0 ? (
                            <img
                              src={transaction.listing.images[0]}
                              alt={transaction.listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {transaction.listing.title}
                            </h3>
                            <span
                              className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[transaction.status]
                              }`}
                            >
                              {statusLabels[transaction.status]}
                            </span>
                          </div>

                          <p className="text-lg font-bold text-gray-900 mb-2">
                            ¥{transaction.listing.price.toLocaleString()}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              {otherUser.avatar_url ? (
                                <img
                                  src={otherUser.avatar_url}
                                  alt={otherUser.username}
                                  className="w-5 h-5 rounded-full"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {otherUser.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span>{otherUser.username}</span>
                            </div>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(transaction.created_at))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
