'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/admin/DataTable'
import Pagination from '@/components/admin/Pagination'

interface User {
  id: string
  username: string
  email: string
  avatar_url: string | null
  rating_avg: number
  rating_count: number
  is_admin: boolean
  created_at: string
  listingCount: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const itemsPerPage = 20

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      })
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      setUsers(data.users)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleMakeAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`この${currentStatus ? 'ユーザーの管理者権限を削除' : 'ユーザーを管理者に昇格'}しますか?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          is_admin: !currentStatus,
        }),
      })

      if (response.ok) {
        fetchUsers()
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('更新に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      label: 'アバター',
      render: (user) => (
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-sm font-medium text-gray-700">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'username',
      label: 'ユーザー名',
      render: (user) => (
        <div>
          <p className="font-medium text-gray-900">{user.username}</p>
          {user.is_admin && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
              管理者
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'メールアドレス',
      render: (user) => <span className="text-sm text-gray-600">{user.email}</span>,
    },
    {
      key: 'rating',
      label: '評価',
      render: (user) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">
            {user.rating_avg.toFixed(1)} ({user.rating_count})
          </span>
        </div>
      ),
    },
    {
      key: 'listingCount',
      label: '出品数',
      render: (user) => <span className="text-sm">{user.listingCount}</span>,
    },
    {
      key: 'created_at',
      label: '登録日',
      render: (user) => <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '操作',
      render: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/admin/users/${user.id}`)
            }}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            詳細
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMakeAdmin(user.id, user.is_admin)
            }}
            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
          >
            {user.is_admin ? '管理者解除' : '管理者にする'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ユーザー管理</h2>
        <p className="text-gray-600 mt-1">登録ユーザーの管理</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ユーザー名またはメールアドレスで検索"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            検索
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setSearchInput('')
                setPage(1)
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              クリア
            </button>
          )}
        </form>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        keyExtractor={(user) => user.id}
        emptyMessage="ユーザーが見つかりません"
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
