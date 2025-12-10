import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <Link
            href="/terms"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            お問い合わせ
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} GameTrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
