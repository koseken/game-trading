import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database, Transaction } from '@/types/database'

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

    const typedTransaction = transaction as (Transaction & { listing: { id: string } }) | null

    if (transactionError || !typedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is the seller
    if (typedTransaction.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the seller can complete the transaction' },
        { status: 403 }
      )
    }

    // Check if transaction is in progress
    if (typedTransaction.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Transaction is not in progress' },
        { status: 400 }
      )
    }

    // Update transaction status to completed
    const updateData: Database['public']['Tables']['transactions']['Update'] = {
      status: 'completed',
      completed_at: new Date().toISOString(),
    }

    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      // @ts-expect-error - Supabase types are correct at runtime
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Update listing status to sold
    const listingUpdateData: Database['public']['Tables']['listings']['Update'] = {
      status: 'sold'
    }

    const { error: listingError } = await supabase
      .from('listings')
      // @ts-expect-error - Supabase types are correct at runtime
      .update(listingUpdateData)
      .eq('id', typedTransaction.listing.id)

    if (listingError) {
      throw listingError
    }

    // Send system message
    const messageData: Database['public']['Tables']['messages']['Insert'] = {
      transaction_id: id,
      sender_id: user.id,
      content: '取引が完了しました。ご利用ありがとうございました。',
    }

    await supabase
      .from('messages')
      // @ts-expect-error - Supabase types are correct at runtime
      .insert(messageData)

    return NextResponse.json({ transaction: updatedTransaction })
  } catch (error) {
    console.error('Error completing transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
