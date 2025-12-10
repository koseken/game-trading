'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react'

interface MobileNavProps {
  isAuthenticated: boolean
}

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'ホーム',
      href: '/',
      icon: Home,
    },
    {
      label: '検索',
      href: '/search',
      icon: Search,
    },
    {
      label: '出品',
      href: isAuthenticated ? '/listings/new' : '/auth/signin',
      icon: PlusCircle,
    },
    {
      label: 'メッセージ',
      href: isAuthenticated ? '/mypage/messages' : '/auth/signin',
      icon: MessageSquare,
    },
    {
      label: 'マイページ',
      href: isAuthenticated ? '/mypage' : '/auth/signin',
      icon: User,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isCreateButton = item.href.includes('/listings/new')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors
                ${isActive ? 'text-red-500' : 'text-gray-600'}
              `}
            >
              {isCreateButton ? (
                <div className="flex flex-col items-center justify-center -mt-6">
                  <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {item.label}
                  </span>
                </div>
              ) : (
                <>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
