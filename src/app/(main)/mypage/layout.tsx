'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, ShoppingBag, MessageSquare, Settings } from 'lucide-react'

const navigation = [
  {
    name: 'マイページ',
    href: '/mypage',
    icon: User,
  },
  {
    name: '出品管理',
    href: '/mypage/listings',
    icon: Package,
  },
  {
    name: '購入履歴',
    href: '/mypage/purchases',
    icon: ShoppingBag,
  },
  {
    name: 'メッセージ',
    href: '/mypage/messages',
    icon: MessageSquare,
  },
  {
    name: '設定',
    href: '/mypage/settings',
    icon: Settings,
  },
]

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
