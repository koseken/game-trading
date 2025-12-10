'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ListingGrid } from '@/components/features/listings/ListingGrid'
import { ListingWithSeller, GameCategory } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState<ListingWithSeller[]>([])
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from('game_categories')
        .select('*')
        .order('name')

      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)

      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('status', 'active')

      try {
        const response = await fetch(`/api/listings?${params.toString()}`)
        const data = await response.json()

        if (data.listings) {
          setListings(data.listings)
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [searchQuery, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCategory) params.append('category', selectedCategory)

    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId)

    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (categoryId) params.append('category', categoryId)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品を検索..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
              >
                検索
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {searchQuery && (
          <p className="text-gray-600 mb-4">
            「<span className="font-medium text-gray-900">{searchQuery}</span>」の検索結果
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ListingGrid
            listings={listings}
            emptyMessage={
              searchQuery || selectedCategory
                ? '検索条件に一致する商品が見つかりませんでした'
                : '出品商品がありません'
            }
          />
        )}
      </div>
    </div>
  )
}
