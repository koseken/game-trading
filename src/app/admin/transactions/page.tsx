'use client'

import React, { useEffect, useState, useCallback } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'

interface Transaction {
  id: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  completed_at: string | null
  listing: {
    id: string
    title: string
    price: number
  } | null
  buyer: {
    id: string
    username: string
    email: string
  } | null
  seller: {
    id: string
    username: string
    email: string
  } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  pending: '保留中',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const itemsPerPage = 20

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      })
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()
      setTransactions(data.transactions)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      label: '取引ID',
      render: (transaction) => (
        <span className="text-xs font-mono text-gray-600">
          {transaction.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: 'listing',
      label: '商品',
      render: (transaction) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">
            {transaction.listing?.title || '不明な商品'}
          </p>
          <p className="text-sm text-gray-600">
            ¥{transaction.listing?.price?.toLocaleString() || 0}
          </p>
        </div>
      ),
    },
    {
      key: 'buyer',
      label: '購入者',
      render: (transaction) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.buyer?.username || '不明'}
          </p>
          <p className="text-xs text-gray-600">{transaction.buyer?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      label: '出品者',
      render: (transaction) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {transaction.seller?.username || '不明'}
          </p>
          <p className="text-xs text-gray-600">{transaction.seller?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (transaction) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[transaction.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[transaction.status] || transaction.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: '作成日',
      render: (transaction) => (
        <span className="text-sm text-gray-600">{formatDate(transaction.created_at)}</span>
      ),
    },
    {
      key: 'completed_at',
      label: '完了日',
      render: (transaction) => (
        <span className="text-sm text-gray-600">
          {transaction.completed_at ? formatDate(transaction.completed_at) : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">取引管理</h2>
        <p className="text-gray-600 mt-1">すべての取引の監視と管理</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">全取引</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">保留中</p>
          <p className="text-2xl font-bold text-yellow-600">
            {transactions.filter((t) => t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">進行中</p>
          <p className="text-2xl font-bold text-blue-600">
            {transactions.filter((t) => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">完了</p>
          <p className="text-2xl font-bold text-green-600">
            {transactions.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4 items-center">
          <label className="text-sm font-medium text-gray-700">ステータスで絞り込み:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="">すべてのステータス</option>
            <option value="pending">保留中</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
          {statusFilter && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('')
                setPage(1)
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        keyExtractor={(transaction) => transaction.id}
        emptyMessage="取引が見つかりません"
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  )
}
