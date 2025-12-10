import { ListingWithSeller } from '@/types/database'
import { ListingCard } from './ListingCard'

interface ListingGridProps {
  listings: ListingWithSeller[]
  emptyMessage?: string
}

export function ListingGrid({ listings, emptyMessage = '出品商品がありません' }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
