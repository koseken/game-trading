import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingWithSeller } from '@/types/database'
import { ImageGallery } from '@/components/features/listings/ImageGallery'
import { RelatedListings } from '@/components/features/listings/RelatedListings'
import { PurchaseButton } from '@/components/features/listings/PurchaseButton'
import { DeleteButton } from '@/components/features/listings/DeleteButton'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch listing with seller info
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users!seller_id(*),
      category:game_categories(*)
    `)
    .eq('id', id)
    .single()

  if (error || !listing) {
    notFound()
  }

  const typedListing = listing as unknown as ListingWithSeller

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch related listings (same category, exclude current)
  const { data: relatedListings } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users!seller_id(*),
      category:game_categories(*)
    `)
    .eq('status', 'active')
    .eq('category_id', typedListing.category_id)
    .neq('id', id)
    .limit(4)

  const typedRelatedListings = (relatedListings || []) as unknown as ListingWithSeller[]

  const isOwner = user?.id === typedListing.seller_id
  const isSold = typedListing.status === 'sold'
  const isReserved = typedListing.status === 'reserved'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <ImageGallery images={typedListing.images} title={typedListing.title} />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Status Badge */}
            {(isSold || isReserved) && (
              <div>
                {isSold && (
                  <span className="inline-block px-4 py-2 bg-gray-800 text-white font-bold rounded-md">
                    売り切れ
                  </span>
                )}
                {isReserved && (
                  <span className="inline-block px-4 py-2 bg-yellow-500 text-white font-bold rounded-md">
                    交渉中
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{typedListing.title}</h1>
            </div>

            {/* Price */}
            <div>
              <p className="text-4xl font-bold text-red-600">
                ¥{typedListing.price.toLocaleString('ja-JP')}
              </p>
            </div>

            {/* Category */}
            {typedListing.category && (
              <div>
                <Link
                  href={`/?category=${typedListing.category.id}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {typedListing.category.name}
                </Link>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">出品者</h3>
              <div className="flex items-center gap-3">
                {typedListing.seller.avatar_url ? (
                  <Image
                    src={typedListing.seller.avatar_url}
                    alt={typedListing.seller.username}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{typedListing.seller.username}</p>
                  {typedListing.seller.rating_count > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{typedListing.seller.rating_avg.toFixed(1)}</span>
                      <span className="text-gray-500">({typedListing.seller.rating_count}件)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOwner ? (
                <>
                  <Link
                    href={`/listings/${id}/edit`}
                    className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    編集する
                  </Link>
                  {typedListing.status === 'active' && (
                    <DeleteButton listingId={id} />
                  )}
                </>
              ) : (
                <PurchaseButton
                  listingId={id}
                  sellerId={typedListing.seller_id}
                  status={typedListing.status}
                  isAuthenticated={!!user}
                />
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">商品説明</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {typedListing.description}
          </p>
        </div>

        {/* Related Listings */}
        {typedRelatedListings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">関連商品</h2>
            <RelatedListings listings={typedRelatedListings} />
          </div>
        )}
      </div>
    </div>
  )
}
