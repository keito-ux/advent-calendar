# アーキテクチャ変更サマリー

## 実装完了項目

### 1. データベーススキーマ ✅
- **マイグレーションファイル**: `supabase/migrations/20251031045204_create_user_calendars_schema.sql`
  - `user_calendars` / `user_calendar_days` テーブル作成
  - 構造: `user_calendars` (メタ情報), `user_calendar_days` (各日付の投稿)
  - RLSポリシー設定（ユーザーは自分のカレンダーのみ操作可能、共有時は閲覧可能）

### 2. 型定義更新 ✅
- `src/lib/types.ts` に以下を追加/更新:
  - `advent_calendar` テーブル型定義
  - `user_calendars`, `user_calendar_days` テーブル型定義
  - `AdventCalendar`, `UserCalendar`, `UserCalendarDay` エクスポート型

### 3. 新規コンポーネント ✅

#### HomeCalendar (`src/components/HomeCalendar.tsx`)
- `advent_calendar` テーブルを使用
- 全ユーザーが閲覧可能（ログイン不要）
- 既存のCalendarGridのロジックを再利用

#### MyCalendar (`src/components/MyCalendar.tsx`)
- `user_calendar_days` テーブルを使用
- ログインユーザー専用
- 画像アップロード機能内蔵
- 各日付に作品を投稿可能

#### Navbar (`src/components/Navbar.tsx`)
- ナビゲーションバーコンポーネント
- Home, My Calendar（ログイン時のみ）, Ranking, Profile への遷移
- ログイン/ログアウトボタン

#### HomeSceneDetail (`src/components/HomeSceneDetail.tsx`)
- 共通カレンダーのシーン詳細表示

#### MySceneDetail (`src/components/MySceneDetail.tsx`)
- ユーザーカレンダーのシーン詳細表示

### 4. 既存コンポーネント更新 ✅

#### CalendarDay
- `UserCalendarDay | AdventCalendar` のユニオン型に対応

#### App.tsx
- 新しいルーティング構成
- ログイン不要で共通カレンダーを表示
- ログイン後にMy Calendarにアクセス可能

## ルーティング構成

```
/ (Home)
  ├─ 共通カレンダー（advent_calendar） - ログイン不要
  └─ シーン詳細表示

/my-calendar (My Calendar)
  ├─ ユーザー専用カレンダー（user_calendar_days） - ログイン必須
  └─ シーン詳細表示

/ranking (Ranking)
  └─ ランキングページ - ログイン不要

/profile (Profile)
  └─ プロフィールページ - ログイン必須
```

## データフロー

### 共通カレンダー（HomeCalendar）
1. `advent_calendar` テーブルから全データを取得
2. ログイン不要で全ユーザーが閲覧可能
3. 日付に応じてアンロック状態を管理

### ユーザーカレンダー（MyCalendar）
1. `user_calendar_days` テーブルから `user_id` でフィルタリング
2. ログインユーザーのみアクセス可能
3. 画像アップロード機能で新規投稿可能

## 使用方法

### 1. マイグレーション実行
```bash
supabase migration up
```

### 2. 開発サーバー起動
```bash
npm run dev
```

### 3. 動作確認
- ログインなしで共通カレンダーを閲覧
- ログイン後にMy Calendarで投稿
- ナビゲーションバーで各ページに遷移

## 注意事項

- `user_calendar_days` テーブルには現在いいね・コメント機能は実装されていません
- 共通カレンダー（`advent_calendar`）は既存データをそのまま利用
- ユーザーカレンダー（`user_calendar_days`）は各ユーザーが独自に投稿

