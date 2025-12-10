import { z } from 'zod'

// User profile update schema
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます'),
  avatar_url: z.string().url('有効なURLを入力してください').nullable().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .max(100, 'パスワードは100文字以内で入力してください'),
    confirmPassword: z.string().min(1, 'パスワードを再入力してください'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// Review schema
export const createReviewSchema = z.object({
  transaction_id: z.string().uuid('有効な取引IDを入力してください'),
  reviewee_id: z.string().uuid('有効なユーザーIDを入力してください'),
  rating: z
    .number()
    .int('評価は整数で入力してください')
    .min(1, '評価は1以上で入力してください')
    .max(5, '評価は5以下で入力してください'),
  comment: z
    .string()
    .max(500, 'コメントは500文字以内で入力してください')
    .optional()
    .nullable(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'ファイルサイズは5MB以下にしてください')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'JPEG、PNG、WebP、GIF形式の画像のみアップロード可能です'
    ),
})

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>
