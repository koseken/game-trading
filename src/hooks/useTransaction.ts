import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TransactionWithDetails } from '@/types/database'

interface UseTransactionOptions {
  transactionId: string
  enabled?: boolean
}

interface UseTransactionReturn {
  transaction: TransactionWithDetails | null
  loading: boolean
  error: Error | null
  completeTransaction: () => Promise<void>
  cancelTransaction: () => Promise<void>
  updating: boolean
}

export function useTransaction({
  transactionId,
  enabled = true
}: UseTransactionOptions): UseTransactionReturn {
  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  // Fetch transaction details
  const fetchTransaction = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          listing:listings!transactions_listing_id_fkey(*),
          buyer:users!transactions_buyer_id_fkey(*),
          seller:users!transactions_seller_id_fkey(*)
        `)
        .eq('id', transactionId)
        .single()

      if (fetchError) throw fetchError

      setTransaction(data as TransactionWithDetails)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transaction'))
    } finally {
      setLoading(false)
    }
  }, [transactionId, enabled, supabase])

  useEffect(() => {
    fetchTransaction()
  }, [fetchTransaction])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        () => {
          // Re-fetch transaction when updated
          fetchTransaction()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [transactionId, enabled, fetchTransaction, supabase])

  const completeTransaction = useCallback(async () => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/transactions/${transactionId}/complete`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete transaction')
      }

      // Transaction will be updated via real-time subscription
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete transaction'))
      throw err
    } finally {
      setUpdating(false)
    }
  }, [transactionId])

  const cancelTransaction = useCallback(async () => {
    try {
      setUpdating(true)
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
        })
        .eq('id', transactionId)

      if (updateError) throw updateError

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel transaction'))
      throw err
    } finally {
      setUpdating(false)
    }
  }, [transactionId, supabase])

  return {
    transaction,
    loading,
    error,
    completeTransaction,
    cancelTransaction,
    updating,
  }
}
