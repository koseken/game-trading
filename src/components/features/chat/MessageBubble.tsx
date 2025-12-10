'use client'

import type { MessageWithSender } from '@/types/database'
import { formatDistanceToNow } from '@/lib/utils/date'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-2 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {message.sender.avatar_url ? (
          <img
            src={message.sender.avatar_url}
            alt={message.sender.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-gray-600">
            {message.sender.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[70%] flex flex-col ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name (only for received messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.username}
          </span>
        )}

        {/* Message content */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-3">
          {formatDistanceToNow(new Date(message.created_at))}
        </span>
      </div>
    </div>
  )
}
