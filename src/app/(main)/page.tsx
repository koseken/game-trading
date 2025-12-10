import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid } from '@/components/features/listings/ListingGrid'
import { GameCategory, ListingWithSeller } from '@/types/database'
import Link from 'next/link'

interface SearchParams {
  category?: string
  q?: string
}

async function getCategories(): Promise<GameCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('game_categories')
    .select('*')
    .order('name')

  return (data as GameCategory[]) || []
}

async function getListings(searchParams: SearchParams): Promise<ListingWithSeller[]> {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select(`
      *,
      seller:users!listings_seller_id_fkey(id, username, avatar_url, rating_avg, rating_count),
      category:game_categories(id, name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(24)

  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data } = await query

  return (data as ListingWithSeller[]) || []
}

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function ListingsSection({ searchParams }: { searchParams: SearchParams }) {
  const listings = await getListings(searchParams)

  return (
    <ListingGrid
      listings={listings}
      emptyMessage={searchParams.q ? `「${searchParams.q}」に一致する商品が見つかりませんでした` : '出品商品がありません'}
    />
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">
            ゲームアイテムを安全に取引
          </h1>
          <p className="text-base md:text-xl opacity-90 mb-4 md:mb-6">
            欲しいアイテムを見つけよう。不要なアイテムを出品しよう。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              出品する
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-red-600 text-white font-semibold rounded-lg border-2 border-white hover:bg-red-700 transition-colors text-sm md:text-base"
            >
              商品を探す
            </Link>
          </div>
        </section>

        {/* Category Filter */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">カテゴリー</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !params.category
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              すべて
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  params.category === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Search Results Info */}
        {params.q && (
          <div className="mb-4">
            <p className="text-gray-600">
              「<span className="font-medium text-gray-900">{params.q}</span>」の検索結果
            </p>
          </div>
        )}

        {/* Listings Grid */}
        <section id="listings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {params.category
                ? categories.find(c => c.id === params.category)?.name || '商品一覧'
                : '新着商品'}
            </h2>
          </div>

          <Suspense fallback={<ListingSkeleton />}>
            <ListingsSection searchParams={params} />
          </Suspense>
        </section>

        {/* CTA Section */}
        <section className="mt-12 text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            あなたも出品してみませんか？
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            不要なゲームアイテムを簡単に出品。安全な取引システムで安心してお取引できます。
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center px-8 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            今すぐ出品する
          </Link>
        </section>
      </main>
    </div>
  )
}
