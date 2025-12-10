import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MessageWithSender } from '@/types/database'

interface UseChatOptions {
  transactionId: string
  enabled?: boolean
}

interface UseChatReturn {
  messages: MessageWithSender[]
  loading: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  sending: boolean
}

export function useChat({ transactionId, enabled = true }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  // Fetch initial messages
  useEffect(() => {
    if (!enabled) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!messages_sender_id_fkey(*)
          `)
          .eq('transaction_id', transactionId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setMessages(data as MessageWithSender[])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [transactionId, enabled, supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`messages:${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `transaction_id=eq.${transactionId}`,
        },
        async (payload) => {
          // Fetch the full message with sender details
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (newMessage) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev
              }
              return [...prev, newMessage as MessageWithSender]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [transactionId, enabled, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      try {
        setSending(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            transaction_id: transactionId,
            sender_id: user.id,
            content: content.trim(),
          })

        if (insertError) throw insertError
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to send message'))
        throw err
      } finally {
        setSending(false)
      }
    },
    [transactionId, supabase]
  )

  return {
    messages,
    loading,
    error,
    sendMessage,
    sending,
  }
}
