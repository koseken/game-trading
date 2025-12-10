'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createListingSchema, CreateListingInput } from '@/lib/validations/listing'
import { CategorySelect } from './CategorySelect'
import { ImageUpload } from './ImageUpload'
import { Listing } from '@/types/database'

interface ListingFormProps {
  mode: 'create' | 'edit'
  initialData?: Listing
}

export function ListingForm({ mode, initialData }: ListingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      price: initialData.price,
      category_id: initialData.category_id,
      images: initialData.images
    } : {
      title: '',
      description: '',
      price: 0,
      category_id: null,
      images: []
    }
  })

  const images = watch('images')
  const title = watch('title')
  const description = watch('description')
  const price = watch('price')
  const categoryId = watch('category_id')

  const onSubmit = async (data: CreateListingInput) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const url = mode === 'create'
        ? '/api/listings'
        : `/api/listings/${initialData?.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '保存に失敗しました')
      }

      const result = await response.json()

      // Redirect to listing detail page
      router.push(`/listings/${result.id}`)
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {showPreview ? (
        // Preview mode
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">プレビュー</h2>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-blue-600 hover:text-blue-700"
            >
              編集に戻る
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={url} alt={`商品画像 ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            </div>

            {/* Price */}
            <div>
              <p className="text-3xl font-bold text-red-600">
                ¥{price.toLocaleString('ja-JP')}
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">商品説明</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              編集に戻る
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : mode === 'create' ? '出品する' : '更新する'}
            </button>
          </div>
        </div>
      ) : (
        // Form mode
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? '商品を出品' : '商品を編集'}
          </h2>

          {/* Image Upload */}
          <ImageUpload
            images={images}
            onChange={(newImages) => setValue('images', newImages, { shouldValidate: true })}
            error={errors.images?.message}
          />

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              商品名
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              placeholder="例：ポケモン カードゲーム 未開封パック"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-sm text-gray-500">
              {title.length}/100文字
            </p>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <CategorySelect
            value={categoryId}
            onChange={(value) => setValue('category_id', value)}
            error={errors.category_id?.message}
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              商品説明
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={8}
              placeholder="商品の状態、付属品、発送方法などを詳しく記載してください"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-sm text-gray-500">
              {description.length}/2000文字
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              販売価格
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="1000"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              100円〜1,000,000円の範囲で設定してください
            </p>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              プレビュー
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : mode === 'create' ? '出品する' : '更新する'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
