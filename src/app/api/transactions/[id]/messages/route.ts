import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database, Transaction } from '@/types/database'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// GET /api/transactions/[id]/messages - Get all messages for a transaction
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

    // Verify user has access to this transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('buyer_id, seller_id')
      .eq('id', id)
      .single()

    const typedTransaction = transaction as Pick<Transaction, 'buyer_id' | 'seller_id'> | null

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

    // Get messages with sender details
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*)
      `)
      .eq('transaction_id', id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw messagesError
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/transactions/[id]/messages - Send a message
export async function POST(
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

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('buyer_id, seller_id, status')
      .eq('id', id)
      .single()

    const typedTransaction2 = transaction as Pick<Transaction, 'buyer_id' | 'seller_id' | 'status'> | null

    if (transactionError || !typedTransaction2) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user is buyer or seller
    if (typedTransaction2.buyer_id !== user.id && typedTransaction2.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if transaction is active (not cancelled)
    if (typedTransaction2.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot send messages to cancelled transaction' },
        { status: 400 }
      )
    }

    // Create message
    const insertData: Database['public']['Tables']['messages']['Insert'] = {
      transaction_id: id,
      sender_id: user.id,
      content: content.trim(),
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      // @ts-expect-error - Supabase types are correct at runtime
      .insert(insertData)
      .select(`
        *,
        sender:users!messages_sender_id_fkey(*)
      `)
      .single()

    if (messageError) {
      throw messageError
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
