'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react'

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
      label: 'さがす',
      href: '/search',
      icon: Search,
    },
    {
      label: '出品',
      href: isAuthenticated ? '/sell' : '/login',
      icon: Plus,
      isCenter: true,
    },
    {
      label: 'メッセージ',
      href: isAuthenticated ? '/transactions' : '/login',
      icon: MessageSquare,
    },
    {
      label: 'マイページ',
      href: isAuthenticated ? '/mypage' : '/login',
      icon: User,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href === '/mypage' && pathname.startsWith('/mypage')) ||
            (item.href === '/transactions' && pathname.startsWith('/transactions')) ||
            (item.href === '/sell' && pathname === '/sell') ||
            (item.href === '/search' && pathname === '/search')

          if (item.isCenter) {
            return (
              <Link
                key={index}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full"
              >
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md -mt-3">
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
                ${isActive ? 'text-red-500' : 'text-gray-400'}
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
