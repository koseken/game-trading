import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MessageCard } from './MessageCard'
import { Transaction, Listing, User, Message } from '@/types/database'

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all transactions where user is buyer or seller
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      listing:listings(*),
      buyer:users!transactions_buyer_id_fkey(
        id,
        username,
        avatar_url
      ),
      seller:users!transactions_seller_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  type TransactionWithDetails = Transaction & {
    listing: Listing
    buyer: User
    seller: User
  }

  const transactions = data as TransactionWithDetails[] | null

  if (error) {
    console.error('Failed to fetch transactions:', error)
  }

  // Fetch last message for each transaction
  const transactionIds = transactions?.map((t) => t.id) || []
  const { data: messagesData } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        username
      )
    `)
    .in('transaction_id', transactionIds)
    .order('created_at', { ascending: false })

  type MessageWithSender = Message & {
    sender: User
  }

  const messages = messagesData as MessageWithSender[] | null

  // Group messages by transaction and get the latest one
  const lastMessagesByTransaction = new Map()
  messages?.forEach((message) => {
    if (!lastMessagesByTransaction.has(message.transaction_id)) {
      lastMessagesByTransaction.set(message.transaction_id, message)
    }
  })

  // Count unread messages per transaction (simplified - assuming messages sent by others are unread)
  const unreadCountsByTransaction = new Map()
  messages?.forEach((message) => {
    if (message.sender_id !== user.id) {
      const count = unreadCountsByTransaction.get(message.transaction_id) || 0
      unreadCountsByTransaction.set(message.transaction_id, count + 1)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>
        <div className="text-sm text-gray-500">
          {transactions?.length || 0}件の会話
        </div>
      </div>

      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">メッセージはありません</p>
          <Link
            href="/listings"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            商品を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const lastMessage = lastMessagesByTransaction.get(transaction.id)
            const unreadCount = unreadCountsByTransaction.get(transaction.id) || 0
            const otherUser =
              transaction.buyer_id === user.id
                ? transaction.seller
                : transaction.buyer

            return (
              <MessageCard
                key={transaction.id}
                transaction={transaction}
                otherUser={otherUser}
                lastMessage={lastMessage}
                unreadCount={unreadCount}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
