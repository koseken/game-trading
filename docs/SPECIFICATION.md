# ゲームアイテム取引サービス MVP 仕様書

## 1. サービス概要

ゲームアカウントの「出品・購入・取引チャット・評価」まで行える最小版フリマサイト。
メルカリのような直感的でシンプルなUIを採用。

### 1.1 参考サービス
- https://gametrade.jp/
- https://rmt.club/
- メルカリ（UI/UX参考）

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド | Next.js API Routes + Supabase |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| ストレージ | Supabase Storage |
| リアルタイム通信 | Supabase Realtime |
| デプロイ | Vercel (推奨) |

## 3. 機能要件

### 3.1 ユーザー認証
- [x] メールアドレス + パスワードでの新規登録
- [x] メールアドレス + パスワードでのログイン
- [x] ログアウト機能
- [x] パスワードリセット機能

### 3.2 出品機能
- [ ] タイトル入力（必須、最大100文字）
- [ ] ゲーム名選択（カテゴリ選択）
- [ ] 画像アップロード（最大3枚、各5MB以下）
- [ ] 説明文入力（必須、最大2000文字）
- [ ] 価格入力（必須、100円〜100万円）
- [ ] 出品するボタン
- [ ] 出品の編集・削除

### 3.3 商品一覧・検索
- [ ] トップページに商品一覧（カード3列表示）
  - サムネイル画像
  - タイトル
  - 価格
  - 出品者評価
- [ ] 検索窓（キーワード検索）
- [ ] カテゴリ一覧からの絞り込み
- [ ] 新着順ソート

### 3.4 商品詳細ページ
- [ ] 画像スライド表示
- [ ] タイトル
- [ ] 説明文
- [ ] 価格
- [ ] 出品者情報（名前、評価）
- [ ] 「購入希望を送る」ボタン → チャットへ遷移

### 3.5 チャット機能
- [ ] 出品者 ⇔ 購入希望者 のテキスト送受信
- [ ] リアルタイム更新
- [ ] 取引完了ボタン（出品者のみ）
- [ ] チャット履歴の保存

### 3.6 取引完了・評価機能
- [ ] 取引完了ボタンで取引ステータス変更
- [ ] 5段階評価（星）
- [ ] コメント入力
- [ ] 評価送信後、お互いの評価が公開

### 3.7 マイページ
- [ ] 出品中一覧
- [ ] 購入履歴
- [ ] メッセージ一覧
- [ ] 設定（アイコン、名前変更）
- [ ] 受けた評価一覧

### 3.8 管理画面（簡易版）
- [ ] ユーザー一覧
- [ ] 出品一覧（承認/削除）
- [ ] 取引一覧
- [ ] 通報管理（将来拡張）

## 4. データベース設計

### 4.1 テーブル構成

#### users（ユーザー）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  rating_avg DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### game_categories（ゲームカテゴリ）
```sql
CREATE TABLE game_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### listings（出品）
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES game_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 100 AND price <= 1000000),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'sold', 'cancelled')),
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### transactions（取引）
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

#### messages（メッセージ）
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### reviews（評価）
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. 画面一覧

| 画面 | パス | 認証 |
|------|------|------|
| トップ（商品一覧） | `/` | 不要 |
| 商品詳細 | `/listings/[id]` | 不要 |
| ログイン | `/login` | 不要 |
| 新規登録 | `/register` | 不要 |
| 出品フォーム | `/sell` | 必要 |
| 出品編集 | `/listings/[id]/edit` | 必要 |
| マイページ | `/mypage` | 必要 |
| 出品一覧（自分） | `/mypage/listings` | 必要 |
| 購入履歴 | `/mypage/purchases` | 必要 |
| メッセージ一覧 | `/mypage/messages` | 必要 |
| チャット画面 | `/transactions/[id]` | 必要 |
| 設定 | `/mypage/settings` | 必要 |
| 管理画面 | `/admin` | 管理者のみ |

## 6. API エンドポイント

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト

### 出品
- `GET /api/listings` - 出品一覧取得
- `GET /api/listings/[id]` - 出品詳細取得
- `POST /api/listings` - 新規出品
- `PUT /api/listings/[id]` - 出品編集
- `DELETE /api/listings/[id]` - 出品削除

### 取引
- `POST /api/transactions` - 取引開始（購入希望）
- `GET /api/transactions/[id]` - 取引詳細
- `PUT /api/transactions/[id]/complete` - 取引完了

### メッセージ
- `GET /api/transactions/[id]/messages` - メッセージ取得
- `POST /api/transactions/[id]/messages` - メッセージ送信

### 評価
- `POST /api/reviews` - 評価投稿
- `GET /api/users/[id]/reviews` - ユーザーの評価一覧

### ユーザー
- `GET /api/users/me` - 自分の情報
- `PUT /api/users/me` - プロフィール更新

## 7. セキュリティ要件

- Supabase RLS (Row Level Security) による認可制御
- XSS対策（React標準のエスケープ）
- CSRF対策（Supabase Auth のトークン管理）
- 画像アップロードのバリデーション（ファイルタイプ、サイズ制限）
- SQLインジェクション対策（Supabase クライアント使用）

## 8. 納品物

1. ソースコード一式（GitHub）
2. 環境構築手順書
3. 動作確認用デモ環境
4. データベースマイグレーションファイル
5. 本仕様書

## 9. 契約条件

| 項目 | 内容 |
|------|------|
| 予算 | 20〜30万円 |
| 納期 | 3〜6週間 |
| 修正対応回数 | 3回まで（軽微な修正は回数外） |
| ソースコードの所有権 | 納品後、クライアントに譲渡 |
| 保守費用 | 別途相談（月額2〜5万円目安） |
| コミュニケーション | Slack / Discord / Chatwork いずれか |

## 10. 将来拡張（MVP外）

- Stripe決済連携
- 本人確認（KYC）
- プッシュ通知
- SNSログイン（Google, Twitter）
- お気に入り機能
- 通報機能の拡充
