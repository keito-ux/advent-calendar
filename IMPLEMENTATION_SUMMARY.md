# Advent Calendar アプリ フルリニューアル実装サマリー

## 実装完了項目

### 1. データベーススキーマ拡張 ✅
- **マイグレーションファイル**: `supabase/migrations/20250101000000_add_sns_features.sql`
  - `likes` テーブル: いいね機能
  - `comments` テーブル: コメント機能
  - `user_calendar_days` に `model_url` と `like_count` カラム追加
  - `profiles` に SNSリンク（twitter_url, instagram_url, website_url, bio）追加
  - RLSポリシーとインデックス設定

### 2. 型定義更新 ✅
- `src/lib/types.ts` に以下を追加:
  - `UserCalendar`, `UserCalendarDay`, `Profile`, `Like`, `Comment`
  - `CalendarDayWithDetails` インターフェース

### 3. 新規コンポーネント ✅

#### LikeButton (`src/components/LikeButton.tsx`)
- いいね機能の実装
- リアルタイムいいね数更新
- ユーザー認証チェック

#### CommentBox (`src/components/CommentBox.tsx`)
- コメント表示・投稿機能
- プロフィール情報表示
- コメント削除機能

#### RankingPage (`src/components/RankingPage.tsx`)
- いいね数順・最新順ソート
- トップ50の投稿を表示
- クリエイタープロフィール表示

#### MyCalendarPage (`src/components/MyCalendarPage.tsx`)
- ユーザーのカレンダー一覧
- カレンダー作成・削除機能
- シェア機能

#### UserProfile (`src/components/UserProfile.tsx`)
- プロフィール表示
- SNSリンク表示（Twitter, Instagram, Website）
- 作成したカレンダー一覧

#### EnhancedThreeViewer (`src/components/EnhancedThreeViewer.tsx`)
- 雪のパーティクルエフェクト
- 光のパーティクル（Sparkles）
- 星の背景（Stars）
- モデルフェードインアニメーション
- カメラアニメーション
- 自動回転・浮遊アニメーション

### 4. 既存コンポーネント更新 ✅

#### App.tsx
- 新しいビュー管理システム
- ナビゲーションバー追加
- ルーティング統合（Home, My Calendars, Rankings, Profile）

#### CalendarGrid
- `user_calendar_days` ベースに移行
- カレンダーIDベースの読み込み
- UploadScene統合

#### SceneDetail
- `user_calendar_days` ベースに移行
- LikeButton統合
- CommentBox統合
- EnhancedThreeViewer統合（3Dモデル表示時）

#### UploadScene
- 画像とGLBの両方に対応
- モーダルUI
- カレンダーIDベースのアップロード

#### CalendarDay
- `UserCalendarDay` 型に対応

### 5. ライブラリ関数拡張 ✅

#### supabase.ts
- `uploadModel()` 関数追加（GLBアップロード対応）

## デザインシステム

### カラーパレット
- **ベース**: スレート900、ネイビー900、スレート950
- **アクセント**: アンバー400（金）、ローズ500（ピンク）
- **白**: 白・半透明白（ガラスモーフィズム効果）

### UI特徴
- ガラスモーフィズム（backdrop-blur）
- グラデーション背景
- 雪のパーティクルアニメーション
- ホバーエフェクト
- トランジションアニメーション

## 使用方法

### 1. マイグレーション実行
```bash
# Supabase CLIでマイグレーションを実行
supabase migration up
```

### 2. 環境変数確認
`.env` ファイルに以下が設定されていることを確認:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. 開発サーバー起動
```bash
npm run dev
```

## 主要機能

1. **ユーザーカレンダー管理**
   - 複数カレンダー作成可能
   - カレンダーごとに25日分の投稿

2. **投稿機能**
   - 画像または3Dモデル（GLB）アップロード
   - タイトル・メッセージ設定

3. **SNS機能**
   - いいね機能
   - コメント機能
   - ランキング表示

4. **3D表示**
   - GLBモデル表示
   - パーティクルエフェクト
   - アニメーション

5. **プロフィール**
   - SNSリンク設定
   - カレンダー一覧表示

## 注意事項

- 既存の `advent_calendar` テーブルは使用されていません（`user_calendars` / `user_calendar_days` に移行）
- プロフィール作成は手動で行う必要があります（初回ログイン時）
- ストレージバケット `advent.pics` に画像とGLBモデルをアップロード

## 今後の拡張案

1. プロフィール自動作成（トリガー関数）
2. カレンダーシェア機能の強化
3. フォロー機能
4. 通知機能
5. 検索機能
6. タグ機能

