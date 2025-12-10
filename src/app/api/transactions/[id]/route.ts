import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Transaction, Listing, User } from '@/types/database'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// GET /api/transactions/[id] - Get transaction details
export async function GET(
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

    // Get transaction with full details
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(`
        *,
        listing:listings!transactions_listing_id_fkey(*),
        buyer:users!transactions_buyer_id_fkey(*),
        seller:users!transactions_seller_id_fkey(*)
      `)
      .eq('id', id)
      .single()

    const typedTransaction = transaction as (Transaction & { listing: Listing; buyer: User; seller: User }) | null

    if (transactionError || !typedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is buyer or seller
    if (typedTransaction.buyer_id !== user.id && typedTransaction.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({ transaction: typedTransaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
