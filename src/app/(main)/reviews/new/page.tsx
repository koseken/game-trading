import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'
import type { Transaction, Listing, User } from '@/types/database'

interface PageProps {
  searchParams: Promise<{
    transaction?: string
    reviewee?: string
  }>
}

export default async function NewReviewPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const transactionId = params.transaction
  const revieweeId = params.reviewee

  if (!transactionId || !revieweeId) {
    redirect('/mypage/purchases')
  }

  // Fetch transaction details
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select(`
      *,
      listing:listings(*),
      buyer:users!transactions_buyer_id_fkey(id, username),
      seller:users!transactions_seller_id_fkey(id, username)
    `)
    .eq('id', transactionId)
    .single()

  if (error || !transaction) {
    redirect('/mypage/purchases')
  }

  type TransactionWithRelations = Transaction & {
    listing: Listing
    buyer: Pick<User, 'id' | 'username'>
    seller: Pick<User, 'id' | 'username'>
  }

  const typedTransaction = transaction as unknown as TransactionWithRelations

  // Verify user is part of this transaction
  const isBuyer = typedTransaction.buyer_id === user.id
  const isSeller = typedTransaction.seller_id === user.id

  if (!isBuyer && !isSeller) {
    redirect('/mypage/purchases')
  }

  // Verify transaction is completed
  if (typedTransaction.status !== 'completed') {
    redirect('/mypage/purchases')
  }

  // Check if user already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('transaction_id', transactionId)
    .eq('reviewer_id', user.id)
    .single()

  if (existingReview) {
    redirect('/mypage/purchases')
  }

  // Get reviewee details
  const reviewee = isBuyer ? typedTransaction.seller : typedTransaction.buyer

  if (reviewee.id !== revieweeId) {
    redirect('/mypage/purchases')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              取引の評価
            </h1>
            <p className="text-gray-600">
              取引が完了しました。相手の評価を投稿してください。
            </p>
          </div>

          {/* Transaction Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">取引商品</h3>
            <div className="flex gap-3">
              {typedTransaction.listing.images && typedTransaction.listing.images.length > 0 && (
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={typedTransaction.listing.images[0]}
                    alt={typedTransaction.listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {typedTransaction.listing.title}
                </p>
                <p className="text-sm text-gray-600">
                  ¥{typedTransaction.listing.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <ReviewForm
            transactionId={transactionId}
            revieweeId={revieweeId}
            revieweeName={reviewee.username}
          />
        </div>
      </div>
    </div>
  )
}
