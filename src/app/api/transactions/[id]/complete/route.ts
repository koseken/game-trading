import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// PUT /api/transactions/[id]/complete - Complete transaction (seller only)
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*, listing:listings!transactions_listing_id_fkey(id)')
      .eq('id', id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is the seller
    if (transaction.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the seller can complete the transaction' },
        { status: 403 }
      )
    }

    // Check if transaction is in progress
    if (transaction.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Transaction is not in progress' },
        { status: 400 }
      )
    }

    // Update transaction status to completed
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Update listing status to sold
    const { error: listingError } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', transaction.listing.id)

    if (listingError) {
      throw listingError
    }

    // Send system message
    await supabase
      .from('messages')
      .insert({
        transaction_id: id,
        sender_id: user.id,
        content: '取引が完了しました。ご利用ありがとうございました。',
      })

    return NextResponse.json({ transaction: updatedTransaction })
  } catch (error) {
    console.error('Error completing transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
