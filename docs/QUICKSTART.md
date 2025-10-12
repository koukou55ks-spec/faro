# Faro Quick Start Guide
# 5分でFaroを起動する

**最終更新**: 2025-10-12

---

## ⚡ 超高速セットアップ（5分）

### 前提条件

✅ Node.js 18以上インストール済み
✅ pnpmインストール済み（`npm install -g pnpm`）
✅ Gitインストール済み

---

## 🚀 ステップ1: プロジェクトをクローン（30秒）

```bash
git clone https://github.com/your-username/faro.git
cd faro
```

---

## 📦 ステップ2: 依存関係をインストール（2分）

```bash
pnpm install
```

**時間がかかる場合**: ネットワーク環境に依存しますが、通常1〜3分で完了します。

---

## 🔑 ステップ3: 環境変数を設定（1分）

```bash
# テンプレートをコピー
cp .env.local.example .env.local
```

`.env.local`を開いて、以下の4つの必須項目を設定：

```bash
# 必須項目（これだけで動きます）
NEXT_PUBLIC_SUPABASE_URL=https://tckfgrxuxkxysmpemplj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### APIキーの取得方法

#### Supabaseキー
1. https://app.supabase.com/project/tckfgrxuxkxysmpemplj/settings/api にアクセス
2. `anon public` と `service_role` をコピー

#### Gemini APIキー
1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. 無料（15 RPM）で使用可能

---

## 🗄️ ステップ4: データベースセットアップ（1分）

### Windows

```powershell
# Supabase CLIインストール（初回のみ）
scoop install supabase

# ログイン
supabase login

# データベースセットアップ
.\scripts\setup-database.ps1
```

### macOS/Linux

```bash
# Supabase CLIインストール（初回のみ）
brew install supabase/tap/supabase

# ログイン
supabase login

# データベースセットアップ
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

**期待される出力**:
```
Database Setup Complete!
Ready to build!
```

---

## 🎯 ステップ5: 開発サーバー起動（30秒）

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開く

**成功！** 🎉

---

## ✅ 動作確認

### APIヘルスチェック

```bash
curl http://localhost:3000/api/health
```

**期待される応答**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T12:00:00.000Z"
}
```

### 型チェック

```bash
pnpm type-check
```

**期待される出力**: エラーゼロ

---

## 🐛 トラブルシューティング

### エラー: `Supabase CLI not found`

```bash
# Scoopインストール（Windows）
iwr -useb get.scoop.sh | iex

# Supabase CLIインストール
scoop install supabase
```

### エラー: `GEMINI_API_KEY not set`

`.env.local`ファイルを確認してください。コメントアウトされていないか確認。

### エラー: `Migration failed`

```bash
# 既存のマイグレーションをリセット
supabase db reset

# 再度セットアップ
.\scripts\setup-database.ps1
```

### ポート3000が使用中

```bash
# 別のポートで起動
PORT=3001 pnpm dev
```

---

## 📚 次のステップ

### 1. チャット機能を試す

http://localhost:3000/chat にアクセス

### 2. コードを探索

```bash
# プロジェクト構造
tree -L 2

# 主要ファイル
apps/web/app/             # Next.js App Router
packages/core/            # ビジネスロジック
packages/infrastructure/  # Supabase & Gemini統合
```

### 3. テストを実行

```bash
pnpm test
```

### 4. ビルドを確認

```bash
pnpm build
```

---

## 🚢 本番デプロイ（オプション）

### Vercelデプロイ

```bash
# Vercel CLIインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

環境変数をVercel Dashboardに設定してください。

詳細: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

---

## 📖 さらに詳しく

- [完全セットアップガイド](../SETUP_INSTRUCTIONS.md)
- [プロジェクト仕様書](../CLAUDE.md)
- [実装状況](../IMPLEMENTATION_STATUS.md)
- [スケール戦略](./SCALING_STRATEGY.md)
- [デプロイチェックリスト](./DEPLOY_CHECKLIST.md)

---

## 🆘 サポート

問題が発生した場合:

1. [SETUP_INSTRUCTIONS.md](../SETUP_INSTRUCTIONS.md) のトラブルシューティングセクションを確認
2. GitHub Issues: https://github.com/your-username/faro/issues
3. ドキュメント: [docs/](../docs/)

---

## ⏱️ タイムライン

- **インストール**: 2分
- **環境変数設定**: 1分
- **DBセットアップ**: 1分
- **サーバー起動**: 30秒
- **動作確認**: 30秒

**合計**: 5分 ⚡

---

<div align="center">

**これでFaroの開発環境が完成しました！**

次は [CLAUDE.md](../CLAUDE.md) でプロジェクトの全体像を把握しましょう。

Happy Coding! 🚀

</div>
