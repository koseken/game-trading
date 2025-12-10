import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/features/reviews/StarRating'
import { Package, ShoppingBag, Star, MessageSquare, Settings, ChevronRight } from 'lucide-react'
import { User } from '@/types/database'

export default async function MypagePage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch user profile
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const user = data as User | null

  if (!user) {
    redirect('/login')
  }

  // Fetch user statistics
  const [
    { count: listingsCount },
    { count: completedTransactionsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewee_id', user.id),
  ])

  const stats = [
    {
      name: '出品数',
      value: listingsCount || 0,
      href: '/mypage/listings',
    },
    {
      name: '取引完了',
      value: completedTransactionsCount || 0,
      href: '/mypage/purchases',
    },
    {
      name: '評価',
      value: reviewsCount || 0,
      href: '#reviews',
    },
  ]

  const menuItems = [
    {
      label: '出品した商品',
      description: '出品中の商品を管理',
      href: '/mypage/listings',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '購入した商品',
      description: '購入履歴を確認',
      href: '/mypage/purchases',
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'メッセージ',
      description: '取引中のやり取り',
      href: '/transactions',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '設定',
      description: 'プロフィール・アカウント',
      href: '/mypage/settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {user.username}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <StarRating
                  rating={user.rating_avg}
                  readonly
                  size="sm"
                />
                <span className="text-sm text-gray-500">
                  {user.rating_avg?.toFixed(1) || '0.0'} ({user.rating_count}件)
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Link
            href="/mypage/settings"
            className="block w-full mt-4 py-2.5 text-center bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            プロフィールを編集
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((stat) => (
              <Link
                key={stat.name}
                href={stat.href}
                className="flex flex-col items-center py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {stat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`p-2 ${item.bgColor} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>
            )
          })}
        </div>

        {/* Logout */}
        <form action="/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="w-full py-3 text-center text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  )
}
