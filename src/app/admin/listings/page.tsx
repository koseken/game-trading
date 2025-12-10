'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  status: 'active' | 'reserved' | 'sold' | 'cancelled'
  images: string[]
  created_at: string
  seller: {
    id: string
    username: string
    email: string
  } | null
  category: {
    name: string
  } | null
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  active: '出品中',
  reserved: '予約済',
  sold: '売却済',
  cancelled: 'キャンセル',
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const itemsPerPage = 20

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      })
      if (search) {
        params.append('search', search)
      }
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/listings?${params}`)
      const data = await response.json()
      setListings(data.listings)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか?この操作は取り消せません。`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/listings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      })

      if (response.ok) {
        fetchListings()
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete listing:', error)
      alert('削除に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const columns: Column<Listing>[] = [
    {
      key: 'image',
      label: '画像',
      render: (listing) => (
        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'タイトル',
      render: (listing) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 truncate">{listing.title}</p>
          <p className="text-sm text-gray-600">{listing.category?.name || 'カテゴリなし'}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      label: '出品者',
      render: (listing) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {listing.seller?.username || '不明'}
          </p>
          <p className="text-xs text-gray-600">{listing.seller?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: '価格',
      render: (listing) => (
        <span className="font-medium text-gray-900">¥{listing.price.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (listing) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[listing.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[listing.status] || listing.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: '作成日',
      render: (listing) => (
        <span className="text-sm text-gray-600">{formatDate(listing.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      render: (listing) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/listings/${listing.id}`)
            }}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            表示
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(listing.id, listing.title)
            }}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            削除
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">出品管理</h2>
        <p className="text-gray-600 mt-1">すべての出品の管理</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="タイトルで検索"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">すべてのステータス</option>
              <option value="active">出品中</option>
              <option value="reserved">予約済</option>
              <option value="sold">売却済</option>
              <option value="cancelled">キャンセル</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              検索
            </button>
            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setStatusFilter('')
                  setPage(1)
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listings Table */}
      <DataTable
        columns={columns}
        data={listings}
        loading={loading}
        keyExtractor={(listing) => listing.id}
        emptyMessage="出品が見つかりません"
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
