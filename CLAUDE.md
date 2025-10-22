# Faro 開発ガイド

**このファイルは、AI（Claude）が一貫した開発を行うための唯一の真実の情報源です。**

---

## 🎯 絶対ルール（最重要）

1. **実装前に必ずローカルでテスト** - `pnpm dev` で動作確認してからコミット
2. **コミット前に必ずチェック** - `pnpm pre-deploy` を実行  
3. **安定版には必ずタグを付ける** - `git tag -a v1.0.0 -m "説明"`
4. **推測で実装しない** - 不明点があれば必ず質問
5. **既存コードを読んでから修正** - 新ファイル作成より既存修正を優先
6. **CLAUDE.mdの内容を勝手に変更しない**

---

## 📁 プロジェクト構造

```
faro/
├── apps/web/               # Next.js アプリ
│   ├── app/                # ページ（App Router）
│   │   ├── page.tsx        # メインアプリ（/）
│   │   ├── (auth)/         # 認証ページ
│   │   └── api/            # APIルート
│   ├── src/features/       # 機能別コンポーネント
│   │   ├── chat/           # AIチャット  
│   │   ├── notes/          # ノート
│   │   ├── kakeibo/        # 家計簿
│   │   └── documents/      # ドキュメント管理
│   └── lib/                # ユーティリティ
│
├── packages/
│   ├── core/               # ビジネスロジック
│   ├── infrastructure/     # Supabase/Gemini統合
│   └── ui/                 # 共有UIコンポーネント
│
├── CLAUDE.md               # このファイル（最重要）
└── DEPLOY.md               # デプロイ手順
```

**重要**: ルート `/` がメインアプリ。`/app` ルートは存在しません。

---

## 🛠️ 開発ワークフロー

### 標準手順

```bash
# 1. 安定版タグ作成
git tag -a v1.0.0 -m "現在の安定版"
git push origin v1.0.0

# 2. コード変更

# 3. ローカルテスト  
pnpm dev
# http://localhost:3000 で動作確認

# 4. デプロイ前チェック
pnpm pre-deploy

# 5. コミット & プッシュ
git add .
git commit -m "feat: 新機能"
git push origin master

# 6. 新タグ作成
git tag -a v1.1.0 -m "新機能追加"
git push origin v1.1.0
```

### 復旧手順

```bash
# 最新の安定版に戻す
git tag -l
git reset --hard v1.0.0  
git push origin master --force
```

---

## 🚫 よくある間違い

### 1. ルートパスの誤り

```typescript
// ❌ 間違い - /app は存在しない
window.location.href = '/app'

// ✅ 正しい
window.location.href = '/'
```

### 2. キャッシュ問題

```bash
# ファイル変更後にエラーが出る場合
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
pnpm dev
```

### 4. 404ソースマップエラー

開発環境で大量の404エラー（`GET /_next/src/helper.ts 404`等）が出る場合:

```
これは無害です - ブラウザのDevToolsがSupabaseライブラリの
ソースマップを要求しているだけで、アプリの動作には影響しません。

本番環境では出ません（next.config.jsで無効化済み）。

完全に消すには: ブラウザのDevTools設定で
「Enable JavaScript source maps」をオフにしてください。
```

### 3. 環境変数

```typescript
// ❌ モジュールレベルで読み込まない
const key = process.env.GEMINI_API_KEY

// ✅ 関数内で読み込む
export async function POST(req) {
  const key = process.env.GEMINI_API_KEY
}
```

---

## 📝 コーディング規約

### ファイル編集

- 新ファイル作成より既存修正を優先
- 相対パスでインポート（`@/` エイリアスは使わない）
- 必ず型を明示（`any` 禁止）

### エラーハンドリング

```typescript
// 全ての非同期処理を try-catch でラップ
try {
  const response = await fetch('/api/chat')
  if (!response.ok) throw new Error('Failed')
} catch (error) {
  console.error('[Component] Error:', error)
  // ユーザーにエラー表示
}
```

---

## 🎨 UI/UX 原則

1. **Gemini風モダンデザイン**
   - 大きな入力エリア、グラデーションボタン
2. **モバイルファースト**
   - タップターゲット 44px以上
3. **アクセシビリティ**
   - aria-label必須、キーボード対応

---

## 🚀 デプロイ

### Vercel環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NODE_ENV=production
```

詳細は [DEPLOY.md](./DEPLOY.md) 参照。

---

## 💡 ベストプラクティス

### コミットメッセージ

```bash
# ✅ 良い
feat: Gemini風UIに改善
fix: ログイン後404エラー修正

# ❌ 悪い  
update
fix bug
```

---

**このガイドを守れば、一貫性のある高品質なコードが書けます。**
