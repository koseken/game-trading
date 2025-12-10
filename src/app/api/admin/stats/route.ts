import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total listings
    const { count: totalListings } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })

    // Get total transactions
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Get today's transactions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: todayTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get recent activity (last 10 transactions)
    const { data: recentActivity } = await supabase
      .from('transactions')
      .select(`
        id,
        status,
        created_at,
        listing:listings(title),
        buyer:users!transactions_buyer_id_fkey(username),
        seller:users!transactions_seller_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        totalTransactions: totalTransactions || 0,
        todayTransactions: todayTransactions || 0,
      },
      recentActivity: recentActivity || [],
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
