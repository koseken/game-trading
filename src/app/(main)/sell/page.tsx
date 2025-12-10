import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/features/listings/ListingForm'

export default async function SellPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/signin?redirectTo=/sell')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商品を出品</h1>
          <p className="mt-2 text-gray-600">
            ゲーム関連商品を出品して、買い手とつながりましょう
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ListingForm mode="create" />
        </div>
      </div>
    </div>
  )
}
