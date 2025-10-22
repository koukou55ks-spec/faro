# デプロイガイド

## 🚀 デプロイ前の必須チェック

### 1. 自動チェックを実行

```bash
# クイックチェック（型・Lint・ビルド）
pnpm pre-deploy

# 完全チェック（環境変数・Git状態も確認）
# Windows
powershell -ExecutionPolicy Bypass -File scripts/pre-deploy-check.ps1

# Mac/Linux
bash scripts/pre-deploy-check.sh
```

### 2. ローカルで動作確認

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで確認
# http://localhost:3000
# 全機能が正常に動作するか確認
```

### 3. 安定版タグを作成

```bash
# バージョン番号を付けてタグ作成
git tag -a v1.0.1 -m "Gemini風UI完成"
git push origin v1.0.1

# または日付ベースのタグ
git tag -a stable-2025-10-22 -m "安定版"
git push origin stable-2025-10-22

# タグ一覧を確認
pnpm tag:list
```

### 4. デプロイ

```bash
# masterブランチにプッシュ（Vercelが自動デプロイ）
git push origin master
```

---

## ⚠️ トラブルシューティング

### 問題: デプロイしたら動かなくなった

**解決策: 最新の安定版タグに戻す**

```bash
# 1. 安定版タグ一覧を確認
git tag -l

# 2. 最新の安定版をチェックアウト
git checkout v1.0.0

# 3. 新しいブランチを作成
git checkout -b fix/rollback-to-stable

# 4. masterに反映
git push origin fix/rollback-to-stable --force
```

### 問題: 404エラーが大量に出る

**原因**: インポートパスが間違っている、ファイルが存在しない

**解決策**:

```bash
# 1. キャッシュクリア
rm -rf apps/web/.next apps/web/.turbo node_modules/.cache
pnpm install

# 2. 開発サーバー再起動
pnpm dev

# 3. ブラウザコンソールでエラー確認
```

### 問題: ビルドエラーが出る

**解決策**:

```bash
# 1. 型チェック
pnpm type-check

# 2. Lint
pnpm lint

# 3. エラーを修正してから再ビルド
pnpm build
```

---

## 📋 ベストプラクティス

### ✅ やるべきこと

- [ ] 変更前にローカルでテスト
- [ ] コミット前に `pnpm pre-deploy` を実行
- [ ] デプロイ成功後に安定版タグを作成
- [ ] 大きな変更は feature ブランチで開発

### ❌ やってはいけないこと

- [ ] 動作確認なしでデプロイ
- [ ] masterブランチで実験的な変更
- [ ] 複数の機能を1つのコミットに含める
- [ ] 安定版タグなしでデプロイ

---

## 🏷️ タグ管理

### タグ命名規則

- `v1.0.0` - メジャーバージョン（大きな機能追加）
- `v1.1.0` - マイナーバージョン（小さな機能追加）
- `v1.1.1` - パッチバージョン（バグ修正）
- `stable-YYYY-MM-DD` - 日付ベースの安定版

### タグ関連コマンド

```bash
# タグ一覧表示
pnpm tag:list

# タグ作成
git tag -a v1.0.1 -m "説明"
git push origin v1.0.1

# タグ削除（ローカル）
git tag -d v1.0.1

# タグ削除（リモート）
git push origin :refs/tags/v1.0.1
```

---

## 🔄 開発ワークフロー

### 通常の開発

```bash
# 1. 機能ブランチ作成
git checkout -b feature/new-ui

# 2. 開発
# コードを変更...

# 3. ローカルテスト
pnpm dev
# ブラウザで動作確認

# 4. チェック
pnpm pre-deploy

# 5. コミット
git add .
git commit -m "feat: 新しいUI追加"

# 6. プッシュ
git push origin feature/new-ui

# 7. masterにマージ（GitHubのPRまたはローカル）
git checkout master
git merge feature/new-ui
git push origin master

# 8. 安定版タグ作成
git tag -a v1.1.0 -m "新しいUI追加"
git push origin v1.1.0
```

### 緊急修正

```bash
# 1. hotfixブランチ作成
git checkout -b hotfix/critical-bug

# 2. 修正
# バグを修正...

# 3. テスト
pnpm pre-deploy

# 4. コミット & プッシュ
git add .
git commit -m "fix: 緊急バグ修正"
git push origin hotfix/critical-bug

# 5. masterに即座にマージ
git checkout master
git merge hotfix/critical-bug
git push origin master

# 6. パッチタグ作成
git tag -a v1.0.1 -m "緊急バグ修正"
git push origin v1.0.1
```

---

## 📞 サポート

問題が解決しない場合は、以下を確認：

1. `CLAUDE.md` の「バージョン管理の絶対原則」セクション
2. `CLAUDE.md` の「エラー対応の絶対原則」セクション
3. Vercelダッシュボードのデプロイログ
