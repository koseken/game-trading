import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing is not available' },
        { status: 400 }
      )
    }

    // Check if user is trying to buy their own listing
    if (listing.seller_id === user.id) {
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

    if (existingTransaction) {
      return NextResponse.json(
        {
          error: 'Transaction already exists',
          transaction_id: existingTransaction.id
        },
        { status: 409 }
      )
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        listing_id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        status: 'in_progress',
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // Update listing status to reserved
    const { error: updateError } = await supabase
      .from('listings')
      .update({ status: 'reserved' })
      .eq('id', listing_id)

    if (updateError) {
      throw updateError
    }

    // Send initial system message
    await supabase
      .from('messages')
      .insert({
        transaction_id: transaction.id,
        sender_id: user.id,
        content: '取引を開始しました。よろしくお願いします。',
      })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
