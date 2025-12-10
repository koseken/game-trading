import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReviewSchema } from '@/lib/validations/user'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Verify transaction exists and user is part of it
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, listing:listings(*)')
      .eq('id', validatedData.transaction_id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: '取引が見つかりません' },
        { status: 404 }
      )
    }

    // Check if user is part of this transaction
    const isBuyer = transaction.buyer_id === user.id
    const isSeller = transaction.seller_id === user.id

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'この取引の評価権限がありません' },
        { status: 403 }
      )
    }

    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return NextResponse.json(
        { error: '取引が完了していません' },
        { status: 400 }
      )
    }

    // Verify reviewee is the other party in the transaction
    const expectedRevieweeId = isBuyer ? transaction.seller_id : transaction.buyer_id
    if (validatedData.reviewee_id !== expectedRevieweeId) {
      return NextResponse.json(
        { error: '評価対象のユーザーが正しくありません' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('transaction_id', validatedData.transaction_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'この取引の評価は既に投稿済みです' },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        transaction_id: validatedData.transaction_id,
        reviewer_id: user.id,
        reviewee_id: validatedData.reviewee_id,
        rating: validatedData.rating,
        comment: validatedData.comment,
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Review creation error:', reviewError)
      return NextResponse.json(
        { error: '評価の投稿に失敗しました' },
        { status: 500 }
      )
    }

    // Update user's average rating and count
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', validatedData.reviewee_id)

    if (reviews) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = totalRating / reviews.length
      const ratingCount = reviews.length

      await supabase
        .from('users')
        .update({
          rating_avg: avgRating,
          rating_count: ratingCount,
        })
        .eq('id', validatedData.reviewee_id)
    }

    return NextResponse.json(
      { review, message: '評価を投稿しました' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review API error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '入力データが正しくありません' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
