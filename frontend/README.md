# Faro Frontend - Next.js 14

Faroのフロントエンドアプリケーション。Next.js 14、TypeScript、Tailwind CSSで構築されています。

## 技術スタック

- **Next.js 14** - App Router、Server Components
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティファーストCSS
- **Supabase Auth** - 認証システム
- **Zustand** - 状態管理
- **Recharts** - データ可視化
- **Lucide React** - アイコン

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8003
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

## プロジェクト構造

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   ├── layout.tsx         # グローバルレイアウト
│   ├── globals.css        # グローバルスタイル
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx   # ログインページ
│   │   └── signup/
│   │       └── page.tsx   # 新規登録ページ
│   └── dashboard/
│       └── page.tsx       # ダッシュボード（CFOチャット）
├── components/
│   └── ui/                # UIコンポーネント
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── api-client.ts      # Backend API クライアント
│   └── supabase-client.ts # Supabase クライアント
├── public/                # 静的ファイル
├── .env.local             # 環境変数（Git管理外）
├── next.config.js         # Next.js設定
├── tailwind.config.js     # Tailwind CSS設定
├── tsconfig.json          # TypeScript設定
└── package.json           # 依存関係
```

## 主要機能

### 1. 認証システム
- `/auth/login` - ログイン
- `/auth/signup` - 新規登録
- Supabase Auth を使用

### 2. ダッシュボード
- `/dashboard` - CFOチャットインターフェース
- リアルタイムAI対話
- データフライホイール搭載（ログイン済みユーザー）
- クイックアクション（よくある質問）

### 3. トップページ
- `/` - ランディングページ
- 機能紹介
- CTAボタン

## API統合

### Backend API Client (`lib/api-client.ts`)

```typescript
import { apiClient } from '@/lib/api-client'

// AI質問（通常）
const { data } = await apiClient.askEnhanced('つみたてNISAについて教えてください')

// AI質問（データフライホイール搭載）
const { data } = await apiClient.askWithFlywheel(
  '資産形成の方法を教えてください',
  userProfile,
  accessToken
)

// 財務DNA更新
await apiClient.updateFinancialDNA(financialData, accessToken)

// 法令検索
const { data } = await apiClient.searchLaws('所得税')

// ニュース取得
const { data } = await apiClient.getNews('finance')
```

### Supabase Client (`lib/supabase-client.ts`)

```typescript
import { signUp, signIn, signOut, getCurrentUser } from '@/lib/supabase-client'

// 新規登録
await signUp('user@example.com', 'password123')

// ログイン
await signIn('user@example.com', 'password123')

// ログアウト
await signOut()

// 現在のユーザー取得
const user = await getCurrentUser()
```

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リント
npm run lint

# 型チェック
npm run type-check
```

## Vercel デプロイ

### 1. Vercel CLI インストール

```bash
npm install -g vercel
```

### 2. ログイン

```bash
vercel login
```

### 3. デプロイ

```bash
# プレビューデプロイ
vercel

# プロダクションデプロイ
vercel --prod
```

### 4. 環境変数設定

Vercelダッシュボードで以下を設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (本番バックエンドURL)

または CLI で設定：

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL
```

## トラブルシューティング

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 型エラー

```bash
# 型チェック実行
npm run type-check
```

### Supabase接続エラー

- `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認
- Supabaseプロジェクトが起動しているか確認

### Backend API接続エラー

- `NEXT_PUBLIC_API_URL` が正しいか確認
- Backendサーバー（FastAPI）が起動しているか確認：
  ```bash
  curl http://localhost:8003/health
  ```

## パフォーマンス最適化

### 画像最適化

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Faro Logo"
  width={200}
  height={50}
  priority
/>
```

### フォント最適化

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

### Dynamic Import

```tsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading...</p>,
  ssr: false
})
```

## セキュリティ

### 環境変数の取り扱い

- `NEXT_PUBLIC_` プレフィックスは**ブラウザに公開**されます
- 秘密鍵（Service Key等）は絶対に `NEXT_PUBLIC_` を付けない
- `.env.local` は `.gitignore` に追加済み

### CSP ヘッダー

`vercel.json` で設定済み：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 認証フロー

1. ユーザーがログイン → Supabase Auth
2. アクセストークン取得 → localStorage に保存
3. API リクエスト時に `Authorization: Bearer <token>` ヘッダーを付与
4. Backend で JWT 検証

## 次のステップ

1. **プロフィール機能追加**
   - ユーザープロフィール編集ページ
   - 年齢、職業、目標などの入力

2. **ノート機能統合**
   - Notion風ノート編集
   - AIがノートを読んでアドバイス

3. **10年タイムライン**
   - Chart.js / Recharts で可視化
   - 楽観的・現実的・悲観的シナリオ

4. **ニュースフィード**
   - パーソナライズされたニュース表示
   - AIによる解説付き

5. **法令検索UI**
   - e-Gov API統合
   - サイドバーで検索

## ライセンス

Private - Faro Project

## サポート

質問・バグ報告：GitHub Issues
