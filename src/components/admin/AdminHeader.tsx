'use client'

import React from 'react'
import Link from 'next/link'

interface AdminHeaderProps {
  user?: {
    username: string
    email: string
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {

  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">管理画面</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-sm text-gray-700 hover:text-gray-900 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            サイトに戻る
          </Link>
          {user && (
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.username}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
