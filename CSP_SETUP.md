# CSP (Content Security Policy) 設定ガイド

## 概要

このプロジェクトでは、開発環境と本番環境で異なるCSP設定を使用しています。

## 開発環境

開発環境（`npm run dev`）では、ViteのHMR（Hot Module Replacement）とReact Refreshが動作するように、CSPが緩和されています。

### 設定場所
- `vite.config.ts`の`server.headers`に設定されています
- 開発サーバー起動時のみ有効です

### CSP内容
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self' ws://localhost:*;
object-src 'none';
base-uri 'self';
frame-ancestors 'none';
```

## 本番環境

本番環境では、厳格なCSPが適用されます。

### 設定方法

#### GitHub Pagesの場合
`index.html`の`<meta http-equiv="Content-Security-Policy">`タグが使用されます。

#### Cloudflare Pagesの場合
`public/_headers`ファイルが使用されます。

### CSP内容
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self';
object-src 'none';
base-uri 'self';
frame-ancestors 'none';
```

## ビルドコマンド

本番ビルドを実行する場合：
```bash
npm run build -- --mode production
```

これにより、React Refreshが無効化され、インラインスクリプトが生成されません。

## 確認事項

- ✅ 開発環境で「@vitejs/plugin-react can't detect preamble」エラーが発生しない
- ✅ 開発環境でCSPエラーが発生しない
- ✅ 本番環境でインラインスクリプトがブロックされない
- ✅ 本番環境で厳格なCSPが適用される

