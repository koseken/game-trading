import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateListingSchema } from '@/lib/validations/listing'
import type { Database } from '@/types/database'

// GET /api/listings/[id] - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!seller_id(*),
        category:game_categories(*)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// PUT /api/listings/[id] - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // Get existing listing to check ownership
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .single()

    const typedListing = existingListing as { seller_id: string } | null

    if (fetchError || !typedListing) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // Check if user is the seller
    if (typedListing.seller_id !== user.id) {
      return NextResponse.json(
        { error: '編集する権限がありません' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateListingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力内容に誤りがあります', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update listing
    const updateData: Database['public']['Tables']['listings']['Update'] = {
      ...data,
      updated_at: new Date().toISOString()
    }

    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      // @ts-expect-error - Supabase types are correct at runtime
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: '更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // Get existing listing to check ownership
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id, images')
      .eq('id', id)
      .single()

    const typedExistingListing = existingListing as { seller_id: string; images: string[] } | null

    if (fetchError || !typedExistingListing) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // Check if user is the seller
    if (typedExistingListing.seller_id !== user.id) {
      return NextResponse.json(
        { error: '削除する権限がありません' },
        { status: 403 }
      )
    }

    // Delete listing
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: '削除に失敗しました' },
        { status: 500 }
      )
    }

    // Optionally delete images from storage
    // This is a best-effort cleanup - errors are logged but not returned
    if (typedExistingListing.images && typedExistingListing.images.length > 0) {
      try {
        const imagePaths = typedExistingListing.images.map((url: string) => {
          const urlParts = url.split('/storage/v1/object/public/images/')
          return urlParts[1] || url
        })

        await supabase.storage
          .from('images')
          .remove(imagePaths)
      } catch (storageError) {
        console.error('Storage cleanup error:', storageError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
