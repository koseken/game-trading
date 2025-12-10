-- ================================================================
-- Game Trading Platform - Sample Data
-- ================================================================

-- まずauth.usersにテストユーザーを作成
-- パスワードは全員 "password123"
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'taro@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "taro_gamer"}', NOW() - INTERVAL '90 days', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'hanako@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "hanako_play"}', NOW() - INTERVAL '85 days', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'yuki@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "yuki_trader"}', NOW() - INTERVAL '80 days', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'ken@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "ken_master"}', NOW() - INTERVAL '75 days', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'miki@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "miki_chan"}', NOW() - INTERVAL '70 days', NOW()),
  ('66666666-6666-6666-6666-666666666666', 'ryo@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "ryo_games"}', NOW() - INTERVAL '65 days', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'sakura@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "sakura_ff"}', NOW() - INTERVAL '60 days', NOW()),
  ('88888888-8888-8888-8888-888888888888', 'takeshi@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "takeshi_pro"}', NOW() - INTERVAL '55 days', NOW()),
  ('99999999-9999-9999-9999-999999999999', 'ayumi@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "ayumi_lol"}', NOW() - INTERVAL '50 days', NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'daiki@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"username": "daiki_apex"}', NOW() - INTERVAL '45 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- public.usersに追加のプロフィール情報を設定
UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=taro',
  rating_avg = 4.8,
  rating_count = 25
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=hanako',
  rating_avg = 4.5,
  rating_count = 18
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',
  rating_avg = 4.9,
  rating_count = 42
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ken',
  rating_avg = 4.2,
  rating_count = 8
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=miki',
  rating_avg = 5.0,
  rating_count = 15
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryo',
  rating_avg = 4.6,
  rating_count = 30
WHERE id = '66666666-6666-6666-6666-666666666666';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakura',
  rating_avg = 4.7,
  rating_count = 22
WHERE id = '77777777-7777-7777-7777-777777777777';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=takeshi',
  rating_avg = 4.4,
  rating_count = 12
WHERE id = '88888888-8888-8888-8888-888888888888';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayumi',
  rating_avg = 4.3,
  rating_count = 9
WHERE id = '99999999-9999-9999-9999-999999999999';

UPDATE public.users SET
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=daiki',
  rating_avg = 4.1,
  rating_count = 5
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- カテゴリIDを取得するための変数
DO $$
DECLARE
  cat_genshin UUID;
  cat_pokemon UUID;
  cat_ff14 UUID;
  cat_lol UUID;
  cat_valorant UUID;
  cat_apex UUID;
  cat_fortnite UUID;
  cat_minecraft UUID;
BEGIN
  SELECT id INTO cat_genshin FROM public.game_categories WHERE slug = 'genshin-impact';
  SELECT id INTO cat_pokemon FROM public.game_categories WHERE slug = 'pokemon';
  SELECT id INTO cat_ff14 FROM public.game_categories WHERE slug = 'final-fantasy-xiv';
  SELECT id INTO cat_lol FROM public.game_categories WHERE slug = 'league-of-legends';
  SELECT id INTO cat_valorant FROM public.game_categories WHERE slug = 'valorant';
  SELECT id INTO cat_apex FROM public.game_categories WHERE slug = 'apex-legends';
  SELECT id INTO cat_fortnite FROM public.game_categories WHERE slug = 'fortnite';
  SELECT id INTO cat_minecraft FROM public.game_categories WHERE slug = 'minecraft';

  -- ================================================================
  -- LISTINGS (出品データ)
  -- ================================================================

  -- 原神の出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', cat_genshin,
   '【原神】AR60 雷電将軍+ナヒーダ+フリーナ完凸アカウント',
   '長期間プレイしていたアカウントです。

【所持キャラ】
★5キャラ：雷電将軍(完凸)、ナヒーダ(完凸)、フリーナ(完凸)、鍾離、ウェンティ、甘雨、胡桃など30体以上
★5武器：草薙の稲光、聖顕の鍵など多数

【原石・紀行】
原石：15,000個以上
スターライト：200以上

迅速対応いたします。ご質問あればお気軽にどうぞ！',
   150000, 'active',
   ARRAY['https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800', 'https://images.unsplash.com/photo-1614680376408-16afefa3332b?w=800'],
   NOW() - INTERVAL '5 days'),

  ('a0000001-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', cat_genshin,
   '【原神】初期アカウント AR7 リセマラ済み 雷電将軍スタート',
   'リセマラで雷電将軍を引いた初期アカウントです。
ストーリー未進行なので、最初から楽しめます。

・AR7
・雷電将軍所持
・原石未回収多数

即対応可能です！',
   3000, 'active',
   ARRAY['https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800'],
   NOW() - INTERVAL '2 days'),

  ('a0000001-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', cat_genshin,
   '【原神】AR58 胡桃メイン 螺旋12層クリア済み',
   'メインアタッカー胡桃を中心としたアカウントです。

★5キャラ：胡桃(2凸)、夜蘭、鍾離、アルベド、モナ
★5武器：護摩の杖、磐岩結緑

深境螺旋12層クリア済み。
聖遺物厳選もかなり進んでいます。',
   45000, 'active',
   ARRAY['https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800'],
   NOW() - INTERVAL '1 day');

  -- ポケモンの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000004', '44444444-4444-4444-4444-444444444444', cat_pokemon,
   '【ポケモンSV】色違いパラドックスポケモンセット 6V理想個体',
   '色違いのパラドックスポケモンをセットでお譲りします。

【内容】
・色違いハバタクカミ 6V 臆病
・色違いテツノブジン 6V 意地っ張り
・色違いトドロクツキ 6V 陽気
・色違いテツノカイナ 6V 意地っ張り

全て自己産です。
ニックネーム変更可能。',
   8000, 'active',
   ARRAY['https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800'],
   NOW() - INTERVAL '3 days'),

  ('a0000001-0001-0001-0001-000000000005', '55555555-5555-5555-5555-555555555555', cat_pokemon,
   '【ポケモンSV】ランクマ用レンタルパーティ作成代行',
   'ランクマッチで使えるパーティを作成代行いたします。

【サービス内容】
・ご希望のポケモン6体を育成
・努力値振り、技構成、持ち物の相談可
・レンタルチーム登録まで対応

【納期】
通常3〜5日程度

ご要望に応じてカスタマイズします！',
   5000, 'active',
   ARRAY['https://images.unsplash.com/photo-1628373383885-4be0bc0172fa?w=800'],
   NOW() - INTERVAL '4 days'),

  ('a0000001-0001-0001-0001-000000000006', '66666666-6666-6666-6666-666666666666', cat_pokemon,
   '【ポケモンSV】配布色違いザシアン・ザマゼンタセット',
   '過去の配布イベントで入手した色違いザシアン・ザマゼンタのセットです。

・色違いザシアン（配布産）
・色違いザマゼンタ（配布産）

未使用のまま保管していました。
HOME経由でお渡しします。',
   12000, 'active',
   ARRAY['https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=800'],
   NOW() - INTERVAL '6 days');

  -- FF14の出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000007', '77777777-7777-7777-7777-777777777777', cat_ff14,
   '【FF14】全ジョブLv100 絶3種クリア済みアカウント',
   '長期プレイしていたアカウントをお譲りします。

【キャラクター】
・全ジョブLv100（戦闘・クラフター・ギャザラー全て）
・絶アレキ、絶バハ、絶アルテマクリア済み
・メインストーリー最新まで完了

【所持品】
・ギル：5億以上
・マウント：200種以上（九尾含む）
・ミニオン：300種以上
・レジェンダリー武器多数

詳細はお問い合わせください。',
   200000, 'active',
   ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'],
   NOW() - INTERVAL '7 days'),

  ('a0000001-0001-0001-0001-000000000008', '88888888-8888-8888-8888-888888888888', cat_ff14,
   '【FF14】ギル500M 即渡し可能',
   'FF14のギルをお譲りします。

【サーバー】
Mana DC - Chocobo

【数量】
500,000,000ギル（5億）

マケボ経由でお渡しします。
在庫複数あり、まとめ買い歓迎！',
   25000, 'active',
   ARRAY['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800'],
   NOW() - INTERVAL '1 day');

  -- LoLの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000009', '99999999-9999-9999-9999-999999999999', cat_lol,
   '【LoL】チャレンジャー到達済み スキン200種以上',
   'シーズン13でチャレンジャーに到達したアカウントです。

【ランク履歴】
S13: チャレンジャー (最高LP 800)
S12: グランドマスター
S11: マスター

【所持スキン】
・アルティメットスキン全種
・レジェンダリースキン50種以上
・限定スキン多数

【その他】
・チャンピオン全解放
・ルーンページ20枚
・BE: 100,000以上',
   80000, 'active',
   ARRAY['https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800'],
   NOW() - INTERVAL '8 days'),

  ('a0000001-0001-0001-0001-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', cat_lol,
   '【LoL】未ランク Lv30 スマーフアカウント',
   '新規のLv30アカウントです。

・Lv30到達済み
・ランク未プレイ
・BE: 50,000
・チャンピオン10体以上所持

サブ垢や練習用にどうぞ！',
   2500, 'active',
   ARRAY['https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800'],
   NOW() - INTERVAL '2 days');

  -- Valorantの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111', cat_valorant,
   '【VALORANT】イモータル3 全エージェント解放済み',
   '現シーズンイモータル3のアカウントです。

【ランク】
現在: イモータル3 (RR 80)
最高: イモータル3

【所持スキン】
・プライムバンダル
・リーバーバンダル
・オニファントム
・各種ナイフスキン

【エージェント】
全エージェント解放済み

メイン: ジェット、レイナ',
   35000, 'active',
   ARRAY['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800'],
   NOW() - INTERVAL '4 days'),

  ('a0000001-0001-0001-0001-000000000012', '22222222-2222-2222-2222-222222222222', cat_valorant,
   '【VALORANT】スキンアカウント 限定品多数',
   'スキンコレクション用のアカウントです。

【所持スキン】
・チャンピオンズ2022バンダル
・チャンピオンズ2023カラム
・VCTロックインナイフ
・プロトコル全種
・その他レア系多数

ランクはシルバーですが、スキン目当ての方にオススメ！',
   55000, 'active',
   ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'],
   NOW() - INTERVAL '5 days');

  -- Apexの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000013', '33333333-3333-3333-3333-333333333333', cat_apex,
   '【Apex】プレデター到達 レイス爪痕ダブハン',
   'シーズン18プレデター到達アカウントです。

【実績】
・プレデターバッジ (S18)
・爪痕バッジ (レイス)
・ダブハンバッジ (レイス、オクタン)
・マスターバッジ複数シーズン

【スキン】
・レイス: クンアイ所持
・全レジェンド解放済み
・限定スキン多数

K/D: 3.2',
   120000, 'active',
   ARRAY['https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800'],
   NOW() - INTERVAL '3 days'),

  ('a0000001-0001-0001-0001-000000000014', '44444444-4444-4444-4444-444444444444', cat_apex,
   '【Apex】初期アカウント Lv20 ランク未プレイ',
   'サブ垢用の初期アカウントです。

・Lv20
・ランク未プレイ
・チュートリアル完了済み

新規でランク回したい方にオススメ！',
   1500, 'active',
   ARRAY['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800'],
   NOW() - INTERVAL '1 day');

  -- Fortniteの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000015', '55555555-5555-5555-5555-555555555555', cat_fortnite,
   '【フォートナイト】OGスキン多数 レネゲードレイダー所持',
   'シーズン1からプレイしているOGアカウントです。

【レアスキン】
・レネゲードレイダー
・ブラックナイト
・スカルトルーパー (2017)
・ギャラクシースキン
・その他OGスキン多数

【V-Bucks】
15,000 V-Bucks所持

かなりレアなアカウントです！',
   250000, 'active',
   ARRAY['https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800'],
   NOW() - INTERVAL '6 days'),

  ('a0000001-0001-0001-0001-000000000016', '66666666-6666-6666-6666-666666666666', cat_fortnite,
   '【フォートナイト】バトルパス代行 全ティア解放',
   'バトルパスのティア上げ代行を行います。

【サービス内容】
・バトルパス全100ティア解放
・ボーナス報酬も全取得
・実績解除も対応可能

【納期】
1週間程度

シーズン途中からでも対応します！',
   3000, 'active',
   ARRAY['https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800'],
   NOW() - INTERVAL '2 days');

  -- Minecraftの出品
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000017', '77777777-7777-7777-7777-777777777777', cat_minecraft,
   '【マイクラ】Java版アカウント マント付き',
   'Minecraft Java Editionのアカウントです。

【特典】
・2015年購入の古参アカウント
・マイグレーションケープ所持
・Optifineケープ所持

アカウント移行済みでMicrosoftアカウントとしてお渡しします。',
   8000, 'active',
   ARRAY['https://images.unsplash.com/photo-1587573089734-599d584d85f6?w=800'],
   NOW() - INTERVAL '4 days'),

  ('a0000001-0001-0001-0001-000000000018', '88888888-8888-8888-8888-888888888888', cat_minecraft,
   '【マイクラ】Hypixelランク PLUS所持アカウント',
   'Hypixelサーバーで使えるランク付きアカウントです。

【内容】
・MVP+ ランク (永久)
・スカイブロックLv200
・ベッドウォーズスター100以上

Hypixelをメインでプレイする方にオススメ！',
   12000, 'active',
   ARRAY['https://images.unsplash.com/photo-1587573089734-599d584d85f6?w=800'],
   NOW() - INTERVAL '3 days');

  -- 追加の出品（売却済み・予約済みも含む）
  INSERT INTO public.listings (id, seller_id, category_id, title, description, price, status, images, created_at) VALUES
  ('a0000001-0001-0001-0001-000000000019', '99999999-9999-9999-9999-999999999999', cat_genshin,
   '【原神】AR55 甘雨メインアカウント',
   '甘雨を中心に育成したアカウントです。螺旋12層クリア経験あり。',
   30000, 'sold',
   ARRAY['https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800'],
   NOW() - INTERVAL '15 days'),

  ('a0000001-0001-0001-0001-000000000020', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', cat_valorant,
   '【VALORANT】ダイヤ2 エージェント全解放',
   'ダイヤ2のアカウントです。全エージェント解放済み。',
   15000, 'reserved',
   ARRAY['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800'],
   NOW() - INTERVAL '3 days');

  -- ================================================================
  -- TRANSACTIONS (取引データ)
  -- ================================================================

  INSERT INTO public.transactions (id, listing_id, buyer_id, seller_id, status, created_at, completed_at) VALUES
  -- 完了した取引
  ('b0000001-0001-0001-0001-000000000001', 'a0000001-0001-0001-0001-000000000019',
   '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   'completed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days'),

  -- 進行中の取引
  ('b0000001-0001-0001-0001-000000000002', 'a0000001-0001-0001-0001-000000000020',
   '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'in_progress', NOW() - INTERVAL '2 days', NULL);

  -- ================================================================
  -- MESSAGES (メッセージデータ)
  -- ================================================================

  INSERT INTO public.messages (id, transaction_id, sender_id, content, created_at) VALUES
  -- 完了した取引のメッセージ
  ('c0000001-0001-0001-0001-000000000001', 'b0000001-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222', 'こんにちは！購入希望です。', NOW() - INTERVAL '14 days'),
  ('c0000001-0001-0001-0001-000000000002', 'b0000001-0001-0001-0001-000000000001',
   '99999999-9999-9999-9999-999999999999', 'ありがとうございます！ご購入いただけるとのこと、嬉しいです。', NOW() - INTERVAL '14 days' + INTERVAL '30 minutes'),
  ('c0000001-0001-0001-0001-000000000003', 'b0000001-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222', 'アカウント情報はどのように受け取れますか？', NOW() - INTERVAL '14 days' + INTERVAL '1 hour'),
  ('c0000001-0001-0001-0001-000000000004', 'b0000001-0001-0001-0001-000000000001',
   '99999999-9999-9999-9999-999999999999', 'メールアドレスとパスワードをお送りします。二段階認証は解除済みです。', NOW() - INTERVAL '14 days' + INTERVAL '2 hours'),
  ('c0000001-0001-0001-0001-000000000005', 'b0000001-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222', '確認できました！ありがとうございます！', NOW() - INTERVAL '12 days'),

  -- 進行中の取引のメッセージ
  ('c0000001-0001-0001-0001-000000000006', 'b0000001-0001-0001-0001-000000000002',
   '33333333-3333-3333-3333-333333333333', 'はじめまして。こちらの商品を購入したいです。', NOW() - INTERVAL '2 days'),
  ('c0000001-0001-0001-0001-000000000007', 'b0000001-0001-0001-0001-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'お問い合わせありがとうございます！ご購入お待ちしておりました。', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
  ('c0000001-0001-0001-0001-000000000008', 'b0000001-0001-0001-0001-000000000002',
   '33333333-3333-3333-3333-333333333333', 'スキンの詳細を教えていただけますか？', NOW() - INTERVAL '1 day'),
  ('c0000001-0001-0001-0001-000000000009', 'b0000001-0001-0001-0001-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'もちろんです。スクリーンショットをお送りしますね。', NOW() - INTERVAL '1 day' + INTERVAL '2 hours');

  -- ================================================================
  -- REVIEWS (レビューデータ)
  -- ================================================================

  INSERT INTO public.reviews (id, transaction_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
  ('d0000001-0001-0001-0001-000000000001', 'b0000001-0001-0001-0001-000000000001',
   '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999',
   5, '迅速な対応でとても良い取引ができました。アカウントの状態も説明通りで満足です！', NOW() - INTERVAL '12 days'),
  ('d0000001-0001-0001-0001-000000000002', 'b0000001-0001-0001-0001-000000000001',
   '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222',
   5, 'スムーズな取引ありがとうございました。またよろしくお願いします！', NOW() - INTERVAL '12 days');

END $$;
