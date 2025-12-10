import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/features/listings/ListingForm'
import type { Listing } from '@/types/database'

interface EditListingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/signin?redirectTo=/listings/' + id + '/edit')
  }

  // Fetch listing
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !listing) {
    notFound()
  }

  const typedListing = listing as unknown as Listing

  // Check if user is the owner
  if (typedListing.seller_id !== user.id) {
    redirect('/listings/' + id)
  }

  // Can only edit active listings
  if (typedListing.status !== 'active') {
    redirect('/listings/' + id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商品を編集</h1>
          <p className="mt-2 text-gray-600">
            商品情報を更新してください
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ListingForm mode="edit" initialData={typedListing} />
        </div>
      </div>
    </div>
  )
}
