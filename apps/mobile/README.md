# Faro Mobile

React Native モバイルアプリケーション（Expo SDK 54使用）

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm start

# iOS シミュレーターで実行（macOS のみ）
pnpm ios

# Android エミュレーターで実行
pnpm android

# Web ブラウザで実行
pnpm web
```

## アーキテクチャ

- **@faro/core**: ビジネスロジック（Clean Architecture）
- **@faro/infrastructure**: Supabase/AI統合
- **@faro/shared**: 共通ユーティリティ

## 開発状況

🚧 **現在準備中**

- [x] プロジェクト初期化
- [x] モノレポ統合
- [ ] 基本UI実装
- [ ] 認証フロー
- [ ] チャット機能
- [ ] TestFlight配信

## ドキュメント

詳細は [CLAUDE.md](../../CLAUDE.md) の「配信戦略」セクションを参照
