'use client'

import { useEffect, useState } from 'react'
import { GameCategory } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface CategorySelectProps {
  value: string | null
  onChange: (value: string | null) => void
  error?: string
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('game_categories')
        .select('*')
        .order('name')

      if (data) {
        setCategories(data)
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
        カテゴリー
      </label>
      <select
        id="category"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${loading ? 'bg-gray-100' : 'bg-white'}`}
      >
        <option value="">カテゴリーを選択（任意）</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
