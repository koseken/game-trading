import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PurchaseCard } from './PurchaseCard'
import { Transaction, Listing, User } from '@/types/database'

export default async function PurchasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all purchases (transactions where user is buyer)
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      listing:listings(*),
      seller:users!transactions_seller_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  type TransactionWithDetails = Transaction & {
    listing: Listing
    seller: User
  }

  const transactions = data as TransactionWithDetails[] | null

  if (error) {
    console.error('Failed to fetch purchases:', error)
  }

  // Check if user has already reviewed each transaction
  const transactionIds = transactions?.map((t) => t.id) || []
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('transaction_id')
    .eq('reviewer_id', user.id)
    .in('transaction_id', transactionIds)

  const reviews = reviewsData as { transaction_id: string }[] | null
  const reviewedTransactionIds = new Set(reviews?.map((r) => r.transaction_id) || [])

  // Group transactions by status
  const pendingTransactions =
    transactions?.filter((t) => t.status === 'pending') || []
  const inProgressTransactions =
    transactions?.filter((t) => t.status === 'in_progress') || []
  const completedTransactions =
    transactions?.filter((t) => t.status === 'completed') || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">購入履歴</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-1">保留中</p>
          <p className="text-2xl font-bold text-yellow-900">
            {pendingTransactions.length}
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-1">進行中</p>
          <p className="text-2xl font-bold text-blue-900">
            {inProgressTransactions.length}
          </p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 mb-1">完了</p>
          <p className="text-2xl font-bold text-green-900">
            {completedTransactions.length}
          </p>
        </div>
      </div>

      {/* Transactions */}
      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">購入履歴はありません</p>
          <Link
            href="/listings"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            商品を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgressTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                進行中の取引
              </h2>
              <div className="space-y-4">
                {inProgressTransactions.map((transaction) => (
                  <PurchaseCard
                    key={transaction.id}
                    transaction={transaction}
                    hasReviewed={reviewedTransactionIds.has(transaction.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pending */}
          {pendingTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                保留中の取引
              </h2>
              <div className="space-y-4">
                {pendingTransactions.map((transaction) => (
                  <PurchaseCard
                    key={transaction.id}
                    transaction={transaction}
                    hasReviewed={reviewedTransactionIds.has(transaction.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                完了した取引
              </h2>
              <div className="space-y-4">
                {completedTransactions.map((transaction) => (
                  <PurchaseCard
                    key={transaction.id}
                    transaction={transaction}
                    hasReviewed={reviewedTransactionIds.has(transaction.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
