'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Home, Package, ShoppingBag, MessageSquare, Settings } from 'lucide-react'
import { User as UserType } from '@/types/database'

interface SidebarProps {
  user: UserType
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'マイページトップ',
      href: '/mypage',
      icon: Home,
    },
    {
      label: '出品中',
      href: '/mypage/listings',
      icon: Package,
    },
    {
      label: '購入履歴',
      href: '/mypage/purchases',
      icon: ShoppingBag,
    },
    {
      label: 'メッセージ',
      href: '/mypage/messages',
      icon: MessageSquare,
    },
    {
      label: '設定',
      href: '/mypage/settings',
      icon: Settings,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="sticky top-20 p-6">
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.username}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>評価:</span>
                <span className="font-medium text-yellow-500">
                  {user.rating_avg.toFixed(1)}
                </span>
                <span>({user.rating_count})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
