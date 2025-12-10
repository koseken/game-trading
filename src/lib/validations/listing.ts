import { z } from 'zod'

export const createListingSchema = z.object({
  title: z.string()
    .min(1, '商品名を入力してください')
    .max(100, '商品名は100文字以内で入力してください'),
  description: z.string()
    .min(10, '商品説明は10文字以上で入力してください')
    .max(2000, '商品説明は2000文字以内で入力してください'),
  price: z.number()
    .min(100, '価格は100円以上で設定してください')
    .max(1000000, '価格は1,000,000円以下で設定してください'),
  category_id: z.string().nullable(),
  images: z.array(z.string())
    .min(1, '最低1枚の画像をアップロードしてください')
    .max(3, '画像は最大3枚までです'),
})

export const updateListingSchema = createListingSchema.partial()

export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateListingInput = z.infer<typeof updateListingSchema>
