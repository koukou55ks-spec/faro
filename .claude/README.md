# Claude Code 設定ガイド

このディレクトリには、Claude Code専用の設定ファイルが含まれています。

## 📁 ファイル構成

```
.claude/
├── README.md              # このファイル
├── CONTEXT.md            # プロジェクト状態（常に最新に保つ）
├── mcp.json              # MCP設定（認証情報は.env.localから読み込み）
├── settings.local.json   # Claude Code個別設定
└── commands/             # Slash Commands
    ├── ship.md           # /ship - 本番デプロイ
    ├── test.md           # /test - テスト実行
    ├── fix.md            # /fix - エラー修正
    └── status.md         # /status - 状況レポート
```

## 🚀 Slash Commands使い方

### /ship - 本番デプロイ
```bash
/ship
```
実行内容:
1. 型チェック・Lint
2. ビルド確認
3. Git commit & push
4. Vercelデプロイ

### /test - テスト実行
```bash
/test
```
実行内容:
1. 既存テスト実行
2. カバレッジ確認
3. 不足テスト作成

### /fix - エラー修正
```bash
/fix
```
実行内容:
1. Lintエラー修正
2. 型エラー修正
3. ビルドエラー修正

### /status - 状況レポート
```bash
/status
```
実行内容:
1. Git状態確認
2. 実装状況レポート
3. 次のアクション提案

## 🔌 MCP Servers

### 有効化されているサーバー

1. **filesystem** - ローカルファイル操作
2. **github** - GitHub連携（PR作成等）
3. **postgres** - Supabase直接接続
4. **vercel** - Vercelデプロイ管理
5. **memory** - セッション間の記憶保持
6. **notion** - Notion連携（ドキュメント管理）

### 設定ファイル
[mcp.json](mcp.json)

### 環境変数
認証情報は全て `.env.local` に保存されています:
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- `VERCEL_ACCESS_TOKEN`
- `NOTION_API_KEY`
- `POSTGRES_CONNECTION_STRING`

## 📝 CONTEXT.mdの更新ルール

Claude Codeとの会話で以下のイベント発生時に更新:

### 更新タイミング
- ✅ 新機能実装完了時
- ✅ 課題解決時
- ✅ 技術スタック変更時
- ✅ 週1回の定期レビュー

### 更新方法
```bash
# Claude Codeに依頼
「CONTEXT.mdを更新して。今日完了したのは〇〇機能です」
```

## 🎯 効果的なClaude Code活用法

### 1. コンテキストを明確に
**悪い例:**
```
「バグ直して」
```

**良い例:**
```
「frontend/app/api/chat/route.tsで500エラーが出ています。
Gemini APIのレスポンス処理部分を見直してください。
エラーログは以下の通りです: [ログ貼り付け]」
```

### 2. Slash Commandsを活用
手動でコマンド実行する代わりに:
```bash
/fix      # エラーを自動検出・修正
/test     # テストを実行・不足分を作成
/ship     # 本番デプロイまで全自動
```

### 3. MCPサーバーを使う
```bash
# 直接指示
「GitHub MCPでPR作成して」
「Notion MCPに今日の作業をメモして」
「Vercel MCPでプレビューデプロイして」
```

## 🔧 トラブルシューティング

### Slash Commandsが動かない
1. `.claude/commands/` にファイルが存在するか確認
2. ファイルにfrontmatter（`---`）が含まれているか確認

### MCPサーバーが接続できない
1. `.env.local` に認証情報が設定されているか確認
2. Claude Code再起動

### CONTEXT.mdが反映されない
Claude Codeに明示的に指示:
```
「.claude/CONTEXT.mdを読んでから作業開始して」
```

---

**メンテナンス**: このディレクトリの設定は定期的に見直してください。
**質問**: Claude Codeに「.claude/README.mdを見せて」と依頼
