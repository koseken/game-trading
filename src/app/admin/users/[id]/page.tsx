import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { User, Listing, Transaction } from '@/types/database'

interface UserDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get user details
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!user) {
    notFound()
  }

  const typedUser = user as unknown as User

  // Get user's listings
  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      status,
      created_at,
      category:game_categories(name)
    `)
    .eq('seller_id', id)
    .order('created_at', { ascending: false })

  type ListingWithCategory = Pick<Listing, 'id' | 'title' | 'price' | 'status' | 'created_at'> & {
    category: { name: string } | null
  }

  const typedListings = (listings || []) as unknown as ListingWithCategory[]

  // Get user's transactions as buyer
  const { data: buyerTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      status,
      created_at,
      listing:listings(title, price),
      seller:users!transactions_seller_id_fkey(username)
    `)
    .eq('buyer_id', id)
    .order('created_at', { ascending: false })

  type TransactionWithDetails = Pick<Transaction, 'id' | 'status' | 'created_at'> & {
    listing: { title: string; price: number } | null
    seller?: { username: string }
    buyer?: { username: string }
  }

  const typedBuyerTransactions = (buyerTransactions || []) as unknown as TransactionWithDetails[]

  // Get user's transactions as seller
  const { data: sellerTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      status,
      created_at,
      listing:listings(title, price),
      buyer:users!transactions_buyer_id_fkey(username)
    `)
    .eq('seller_id', id)
    .order('created_at', { ascending: false })

  const typedSellerTransactions = (sellerTransactions || []) as unknown as TransactionWithDetails[]

  // Get reviews received
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reviewer:users!reviews_reviewer_id_fkey(username)
    `)
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })

  type ReviewWithReviewer = {
    id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer: { username: string } | null
  }

  const typedReviews = (reviews || []) as unknown as ReviewWithReviewer[]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  }

  const statusLabels: Record<string, string> = {
    active: '出品中',
    reserved: '予約済',
    sold: '売却済',
    cancelled: 'キャンセル',
    pending: '保留中',
    in_progress: '進行中',
    completed: '完了',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/users"
          className="text-blue-600 hover:text-blue-900 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ユーザー一覧に戻る
        </Link>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            {typedUser.avatar_url ? (
              <img src={typedUser.avatar_url} alt={typedUser.username} className="w-24 h-24 rounded-full" />
            ) : (
              <span className="text-3xl font-medium text-gray-700">
                {typedUser.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{typedUser.username}</h2>
              {typedUser.is_admin && (
                <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded">
                  管理者
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{typedUser.email}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">評価</p>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">
                    {typedUser.rating_avg.toFixed(1)} ({typedUser.rating_count})
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">出品数</p>
                <p className="text-lg font-semibold mt-1">{typedListings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">購入数</p>
                <p className="text-lg font-semibold mt-1">{typedBuyerTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p className="text-sm font-medium mt-1">{formatDate(typedUser.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Listings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">出品一覧</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {typedListings.length > 0 ? (
            typedListings.map((listing) => (
              <div key={listing.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-600">
                      {listing.category?.name || 'カテゴリなし'} • ¥{listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[listing.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[listing.status] || listing.status}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(listing.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">出品がありません</div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* As Buyer */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">購入履歴</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {typedBuyerTransactions.length > 0 ? (
              typedBuyerTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <p className="text-sm font-medium text-gray-900">{transaction.listing?.title}</p>
                  <p className="text-sm text-gray-600">
                    出品者: {transaction.seller?.username} • ¥{transaction.listing?.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[transaction.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[transaction.status] || transaction.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(transaction.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">購入履歴がありません</div>
            )}
          </div>
        </div>

        {/* As Seller */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">販売履歴</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {typedSellerTransactions.length > 0 ? (
              typedSellerTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <p className="text-sm font-medium text-gray-900">{transaction.listing?.title}</p>
                  <p className="text-sm text-gray-600">
                    購入者: {transaction.buyer?.username} • ¥{transaction.listing?.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[transaction.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[transaction.status] || transaction.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(transaction.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">販売履歴がありません</div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">受け取ったレビュー</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {typedReviews.length > 0 ? (
            typedReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium text-gray-900">{review.reviewer?.username}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{formatDate(review.created_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">レビューがありません</div>
          )}
        </div>
      </div>
    </div>
  )
}
