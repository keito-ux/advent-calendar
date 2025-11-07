# デプロイメントガイド / Deployment Guide

## データ管理について / Data Management

### データベース (Supabase)
すべてのデータはSupabaseで管理されています：

1. **ユーザーデータ**
   - `auth.users`: Supabase認証システム（自動管理）
   - `profiles`: ユーザープロフィール情報

2. **カレンダーデータ**
   - `user_calendars`: カレンダー情報（タイトル、説明、価格など）
   - `user_calendar_days`: 各日のコンテンツ（画像、メッセージなど）

3. **購入データ**
   - `calendar_purchases`: 購入履歴（カレンダー全体/日付単位）

4. **ストレージ**
   - `advent.pics`: 画像ファイル保存用

### 接続情報
`.env`ファイルに以下の情報があります：
```
VITE_SUPABASE_URL=https://cxhpdgmlnfumkxwsyopq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## GitHub へのデプロイ / Deploy to GitHub

### 1. 準備
リポジトリにプッシュする前に：

```bash
# .envファイルは既に.gitignoreに含まれています
# 確認：
cat .gitignore | grep .env
```

### 2. GitHubにプッシュ

```bash
# Gitリポジトリの初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: Advent Calendar App"

# GitHubリポジトリに接続
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 3. Vercel/Netlifyでのデプロイ

#### Vercel の場合：
1. https://vercel.com にログイン
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. 環境変数を設定：
   - `VITE_SUPABASE_URL`: `https://cxhpdgmlnfumkxwsyopq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. "Deploy" をクリック

#### Netlify の場合：
1. https://netlify.com にログイン
2. "Add new site" → "Import an existing project"
3. GitHubリポジトリを選択
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 環境変数を設定（Vercelと同じ）
6. "Deploy site" をクリック

### 4. GitHub Pages でのデプロイ

```bash
# package.jsonを確認（既に設定済み）
# "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO"
# を追加してください

npm run deploy
```

## 決済について / Payment Processing

### 現在の実装（デモモード）
- 決済処理は**シミュレーション**されています
- `calendar_purchases`テーブルに記録されます
- 実際の金銭のやり取りは発生しません

### Stripe連携（今後の実装）
実際の決済を有効にする場合：

1. **Stripeアカウントを作成**
   - https://stripe.com でアカウント作成

2. **APIキーを取得**
   - Dashboard → Developers → API keys
   - Publishable key と Secret key を取得

3. **環境変数を追加**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Stripe Checkout実装**
   - `@stripe/stripe-js` パッケージをインストール
   - Checkout Session を作成するエッジファンクションを実装
   - 決済完了後のWebhookで`calendar_purchases`を更新

## データのバックアップ

Supabaseダッシュボードから：
1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択
3. Database → Backups でバックアップを作成

## 重要な注意事項

### セキュリティ
- ✅ `.env`ファイルは`.gitignore`に含まれています
- ✅ Supabase Row Level Security (RLS) が有効です
- ⚠️ Stripe Secret Keyは**絶対に**公開しないでください
- ⚠️ `.env`ファイルは**絶対に**Gitにコミットしないでください

### データの移行
現在のSupabaseプロジェクトを別のプロジェクトに移行する場合：

1. **スキーマのエクスポート**
   ```bash
   # supabase/migrations/ フォルダに全てのマイグレーションがあります
   ```

2. **新しいプロジェクトで実行**
   - 新しいSupabaseプロジェクトを作成
   - マイグレーションファイルを順番に実行
   - ストレージバケットを再作成
   - RLSポリシーを確認

3. **データのコピー**
   - Supabaseダッシュボードから SQL Editor を使用
   - `COPY` コマンドでデータをエクスポート/インポート

## トラブルシューティング

### ビルドエラー
```bash
npm install
npm run build
```

### 環境変数が読み込まれない
- `VITE_` プレフィックスが必要です
- デプロイ先のプラットフォームで環境変数を設定してください

### データベース接続エラー
- Supabaseプロジェクトが有効か確認
- `.env`の接続情報が正しいか確認

## サポート

問題が発生した場合：
1. Supabase Logs を確認: https://supabase.com/dashboard
2. Browser Console でエラーを確認
3. Network タブで API リクエストを確認
