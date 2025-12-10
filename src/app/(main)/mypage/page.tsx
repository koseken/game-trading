import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/features/reviews/StarRating'
import { Package, ShoppingBag, Star, MessageSquare } from 'lucide-react'

export default async function MypagePage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

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
      icon: Package,
      href: '/mypage/listings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: '取引完了数',
      value: completedTransactionsCount || 0,
      icon: ShoppingBag,
      href: '/mypage/purchases',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: '評価数',
      value: reviewsCount || 0,
      icon: Star,
      href: '#reviews',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {user.username}
          </h1>
          <div className="flex items-center gap-2">
            <StarRating
              rating={user.rating_avg}
              readonly
              size="sm"
              showNumber
            />
            <span className="text-sm text-gray-600">
              ({user.rating_count}件の評価)
            </span>
          </div>
        </div>
        <Link
          href="/mypage/settings"
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          プロフィール編集
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          クイックリンク
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/mypage/listings"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">出品管理</h3>
                <p className="text-sm text-gray-500">
                  出品中の商品を管理
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/mypage/purchases"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">購入履歴</h3>
                <p className="text-sm text-gray-500">
                  購入した商品を確認
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/mypage/messages"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">メッセージ</h3>
                <p className="text-sm text-gray-500">
                  取引相手とのやり取り
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/mypage/settings"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">設定</h3>
                <p className="text-sm text-gray-500">
                  アカウント設定を変更
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
