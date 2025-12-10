import { ListingWithSeller } from '@/types/database'
import { ListingCard } from './ListingCard'

interface RelatedListingsProps {
  listings: ListingWithSeller[]
}

export function RelatedListings({ listings }: RelatedListingsProps) {
  if (listings.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
