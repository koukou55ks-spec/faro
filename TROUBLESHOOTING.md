# Faro トラブルシューティングガイド

このドキュメントは、開発中によく発生する問題とその解決方法をまとめています。

---

## 🔧 よくある問題

### 1. 開発サーバーが起動しない

#### 症状
- `pnpm dev` が失敗する
- ポート3000が既に使用中

#### 解決方法

**Windows:**
```powershell
# ポート3000を使用しているプロセスを確認
netstat -ano | findstr :3000

# 該当するプロセスIDを確認後、手動で終了
taskkill /PID <プロセスID> /F
```

**注意**: CLAUDE.mdに記載の通り、以下のコマンドは使用しないでください（エラーが発生します）：
```powershell
# ❌ 使用禁止
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
powershell -Command "Stop-Process -Name node -Force"
```

**Linux/Mac:**
```bash
# ポート3000を使用しているプロセスを終了
lsof -ti:3000 | xargs kill -9
```

または、プロジェクトのスクリプトを使用：
```bash
pnpm dev:clean
```

---

### 2. カスタムタブAPIがエラーを返す

#### 症状
- Custom Tabs APIが500エラーを返す
- "Supabase environment variables not configured" エラー

#### 原因
環境変数 `SUPABASE_SERVICE_KEY` が設定されていない

#### 解決方法

1. `.env.local` ファイルを作成（存在しない場合）
2. Supabaseプロジェクトの設定から Service Role Key を取得
3. 以下を追加：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key  # ← これが必要
```

4. 開発サーバーを再起動：
```bash
pnpm dev:clean
```

---

### 3. 認証トークンがnull

#### 症状
- useCustomTabsフックでタブが取得できない
- "No token available" がコンソールに表示される

#### 原因
ユーザーがログインしていない

#### 解決方法

1. `/login` ページでログイン
2. または、Google OAuth でサインイン
3. セッションが有効か確認：

```javascript
// ブラウザのコンソールで実行
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
```

---

### 4. Claude Codeが「ウェブアプリ開いて」に反応しない

#### 症状
- Claude Codeが "Deliberating..." のまま止まる
- コマンドを理解できない

#### 原因
コマンドが曖昧で、具体的なアクションが不明

#### 解決方法

より具体的な指示を出す：

**悪い例：**
```
ウェブアプリ開いて
```

**良い例：**
```
開発サーバーを起動して、ブラウザでlocalhost:3000を開いてください
```

または：
```
pnpm dev を実行してください
```

---

### 5. データベースマイグレーションエラー

#### 症状
- Supabaseのテーブルが存在しない
- "relation does not exist" エラー

#### 解決方法

1. マイグレーションを実行：
```bash
cd supabase
supabase db push --include-all
```

2. マイグレーション状態を確認：
```bash
supabase migration list
```

3. ローカルでテストする場合：
```bash
supabase start
supabase db reset
```

---

### 6. 型エラーが発生する

#### 症状
- TypeScriptの型エラーが多数表示される
- ビルドが失敗する

#### 解決方法

1. 型チェックを実行：
```bash
pnpm type-check
```

2. 型定義ファイルを確認：
```bash
# 該当する型定義ファイルを探す
find apps/web/types -name "*.ts"
```

3. 必要に応じて型を修正

---

## 🚀 デプロイ前チェックリスト

Vercelにデプロイする前に、必ず以下を実行：

```bash
# 1. 型チェック
pnpm type-check

# 2. リント
pnpm lint

# 3. ビルド
pnpm build
```

または、一括実行：
```bash
pnpm pre-deploy
```

---

## 📊 デバッグツール

### 環境変数の確認

開発サーバーで `/api/debug-env` にアクセス（開発環境のみ）

### ログ確認

```bash
# Vercelのログを確認
vercel logs

# ローカルログを確認
# ブラウザのDevToolsコンソールを開く（F12）
```

### Supabaseの状態確認

```bash
# Supabaseダッシュボードを開く
supabase db dashboard
```

---

## 💡 ベストプラクティス

1. **環境変数は必ず `.env.local` に保存**
   - `.env.example` は公開用のテンプレート
   - 実際の値は `.env.local` に記載（.gitignore済み）

2. **開発サーバーを定期的に再起動**
   - 環境変数を変更したら必ず再起動
   - キャッシュの問題を避けるため

3. **エラーログを必ず確認**
   - ブラウザのコンソール
   - ターミナルの出力
   - Vercelのログ（本番環境）

4. **マイグレーションは必ず順番に適用**
   - ファイル名の日付順に実行される
   - 既存のマイグレーションは変更しない

---

## 📞 サポート

問題が解決しない場合：

1. このドキュメントを再確認
2. CLAUDE.md の該当セクションを確認
3. エラーメッセージをGoogleで検索
4. Supabase/Next.jsの公式ドキュメントを確認

---

**Last Updated:** 2025-10-25

