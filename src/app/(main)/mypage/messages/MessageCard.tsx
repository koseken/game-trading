import Link from 'next/link'
import type { Transaction, Listing, User, Message } from '@/types/database'

type TransactionWithDetails = Transaction & {
  listing: Listing
  buyer: User
  seller: User
}

type MessageWithSender = Message & {
  sender: User
}

interface MessageCardProps {
  transaction: TransactionWithDetails
  otherUser: User
  lastMessage?: MessageWithSender
  unreadCount: number
}

const statusLabels = {
  pending: '保留中',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function MessageCard({
  transaction,
  otherUser,
  lastMessage,
  unreadCount,
}: MessageCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 1) return 'たった今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    if (diffInHours < 24) return `${diffInHours}時間前`
    if (diffInDays < 7) return `${diffInDays}日前`

    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
    })
  }

  return (
    <Link
      href={`/chat/${transaction.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
              {otherUser.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                {otherUser.username}
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                  statusColors[transaction.status]
                }`}
              >
                {statusLabels[transaction.status]}
              </span>
              {lastMessage && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(lastMessage.created_at)}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {transaction.listing.title}
          </p>

          {lastMessage ? (
            <p className="text-sm text-gray-500 line-clamp-1">
              {lastMessage.sender.username === otherUser.username ? '' : 'あなた: '}
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">メッセージがありません</p>
          )}
        </div>

        {/* Listing Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {transaction.listing.images && transaction.listing.images.length > 0 ? (
            <img
              src={transaction.listing.images[0]}
              alt={transaction.listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
