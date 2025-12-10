import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from './ListingCard'

export default async function MyListingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all user's listings with categories
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      category:game_categories(*)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch listings:', error)
  }

  // Group listings by status
  const activeListings = listings?.filter((l) => l.status === 'active') || []
  const reservedListings = listings?.filter((l) => l.status === 'reserved') || []
  const soldListings = listings?.filter((l) => l.status === 'sold') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">出品管理</h1>
        <Link
          href="/listings/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          新規出品
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button className="border-b-2 border-blue-500 pb-3 text-sm font-medium text-blue-600">
            出品中 ({activeListings.length})
          </button>
          <button className="border-b-2 border-transparent pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            取引中 ({reservedListings.length})
          </button>
          <button className="border-b-2 border-transparent pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
            売却済 ({soldListings.length})
          </button>
        </nav>
      </div>

      {/* Active Listings */}
      {activeListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">出品中の商品はありません</p>
          <Link
            href="/listings/new"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            商品を出品する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Reserved Listings */}
      {reservedListings.length > 0 && (
        <>
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              取引中 ({reservedListings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sold Listings */}
      {soldListings.length > 0 && (
        <>
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              売却済 ({soldListings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {soldListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
