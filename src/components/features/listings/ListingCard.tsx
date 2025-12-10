import Link from 'next/link'
import Image from 'next/image'
import { ListingWithSeller } from '@/types/database'

interface ListingCardProps {
  listing: ListingWithSeller
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images[0] || '/placeholder-image.png'
  const formattedPrice = listing.price.toLocaleString('ja-JP')

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-md text-lg">
                売り切れ
              </span>
            </div>
          )}
          {listing.status === 'reserved' && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              交渉中
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] mb-2">
            {listing.title}
          </h3>

          {/* Price */}
          <p className="text-xl font-bold text-gray-900 mb-2">
            ¥{formattedPrice}
          </p>

          {/* Seller info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span>{listing.seller.username}</span>
              {listing.seller.rating_count > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">
                    {listing.seller.rating_avg.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({listing.seller.rating_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          {listing.category && (
            <div className="mt-2">
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                {listing.category.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
