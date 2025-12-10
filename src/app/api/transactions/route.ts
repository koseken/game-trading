import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database, Listing, Transaction } from '@/types/database'

// POST /api/transactions - Create a new transaction (start chat)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { listing_id } = body

    if (!listing_id) {
      return NextResponse.json(
        { error: 'listing_id is required' },
        { status: 400 }
      )
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    const typedListing = listing as Listing | null

    if (listingError || !typedListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if listing is active
    if (typedListing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing is not available' },
        { status: 400 }
      )
    }

    // Check if user is trying to buy their own listing
    if (typedListing.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own listing' },
        { status: 400 }
      )
    }

    // Check if transaction already exists for this listing and buyer
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('buyer_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .single()

    const typedExistingTransaction = existingTransaction as { id: string } | null

    if (typedExistingTransaction) {
      return NextResponse.json(
        {
          error: 'Transaction already exists',
          transaction_id: typedExistingTransaction.id
        },
        { status: 409 }
      )
    }

    // Create transaction
    const insertData: Database['public']['Tables']['transactions']['Insert'] = {
      listing_id,
      buyer_id: user.id,
      seller_id: typedListing.seller_id,
      status: 'in_progress',
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      // @ts-expect-error - Supabase types are correct at runtime
      .insert(insertData)
      .select()
      .single()

    const typedTransaction = transaction as Transaction | null

    if (transactionError || !typedTransaction) {
      throw transactionError
    }

    // Update listing status to reserved
    const updateData: Database['public']['Tables']['listings']['Update'] = {
      status: 'reserved'
    }

    const { error: updateError } = await supabase
      .from('listings')
      // @ts-expect-error - Supabase types are correct at runtime
      .update(updateData)
      .eq('id', listing_id)

    if (updateError) {
      throw updateError
    }

    // Send initial system message
    const messageData: Database['public']['Tables']['messages']['Insert'] = {
      transaction_id: typedTransaction.id,
      sender_id: user.id,
      content: '取引を開始しました。よろしくお願いします。',
    }

    await supabase
      .from('messages')
      // @ts-expect-error - Supabase types are correct at runtime
      .insert(messageData)

    return NextResponse.json({ transaction: typedTransaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
