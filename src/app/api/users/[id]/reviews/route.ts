import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id: userId } = await context.params

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, avatar_url, rating_avg, rating_count')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // Fetch reviews for this user
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError)
      return NextResponse.json(
        { error: 'レビューの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user,
      reviews: reviews || [],
    })
  } catch (error) {
    console.error('User reviews API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
