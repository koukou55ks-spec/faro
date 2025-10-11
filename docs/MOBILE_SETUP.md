# Faro Mobile - Development Build セットアップガイド

## なぜDevelopment Buildなのか？

Expo Goではなく**Development Build**を採用した理由：

- ✅ **カスタムネイティブコードのサポート** - 将来の銀行連携やプッシュ通知に必須
- ✅ **本番環境と同じビルド構成** - デプロイ前の完全なテスト
- ✅ **安定した接続とホットリロード** - Wi-Fi経由で自動リロード
- ✅ **将来の拡張性** - 一人ユニコーンに向けた最適解

---

## 初回セットアップ（3ステップ）

### 1. EAS CLIをグローバルインストール

```bash
npm install -g eas-cli
```

### 2. Expoにログイン

```bash
eas login
```

Expoアカウントがない場合は、[expo.dev](https://expo.dev)で作成してください。

### 3. プロジェクトIDを設定

```bash
cd apps/mobile
eas build:configure
```

これにより`app.json`内の`projectId`が自動設定されます。

---

## Development Buildのビルド

### Android向けビルド

```bash
cd apps/mobile
npm run build:dev:android
```

または

```bash
eas build --profile development --platform android
```

ビルド完了後、QRコードが表示されます。Androidスマホでスキャンしてアプリをインストールしてください。

### iOS向けビルド

```bash
cd apps/mobile
npm run build:dev:ios
```

または

```bash
eas build --profile development --platform ios
```

※ iOSの場合、Apple Developer Accountが必要です（初回のみ）。

---

## 開発サーバーの起動

Development Buildをスマホにインストール後：

```bash
cd apps/mobile
npm start
```

または

```bash
npx expo start --dev-client
```

スマホでDevelopment Buildアプリを開くと、自動的に開発サーバーに接続されます。

---

## 開発フロー

1. **コード編集** - VSCodeで`apps/mobile/`内のコードを編集
2. **自動リロード** - スマホアプリが自動的にリロードされる
3. **確認** - 実機で即座に確認
4. **反復** - 無制限で改善を続ける

---

## よく使うコマンド

```bash
# Development Build起動（開発用）
npm start

# Android実機で起動
npm run android

# iOS実機で起動
npm run ios

# プレビュービルド（テスター配布用）
npm run build:preview

# 本番ビルド（App Store/Google Play配布用）
npm run build:production

# OTAアップデート配信（即座にバグ修正）
eas update
```

---

## トラブルシューティング

### スマホが開発サーバーに接続できない

1. PCとスマホが同じWi-Fiネットワークにいることを確認
2. Tunnelモードを試す：
   ```bash
   npx expo start --dev-client --tunnel
   ```

### ビルドエラーが出る

```bash
# 依存関係を再インストール
cd apps/mobile
rm -rf node_modules
pnpm install

# キャッシュをクリア
npx expo start --dev-client --clear
```

### Development Buildが古い場合

再度ビルドしてスマホにインストールしてください：

```bash
npm run build:dev:android  # または build:dev:ios
```

---

## モノレポ構成での注意点

Faroはモノレポ構成のため、以下の点に注意：

```bash
# ルートディレクトリから全パッケージをビルド
pnpm build

# Mobile開発サーバー起動（apps/mobile/で実行）
cd apps/mobile
npm start
```

`@faro/core`、`@faro/infrastructure`、`@faro/shared`はすべてモバイルアプリから参照されます。

---

## EAS Build Profiles

`eas.json`で3つのプロファイルを定義：

### `development`
- **用途**: 開発用（ホットリロード対応）
- **配布**: Internal（チーム内のみ）
- **ビルド**: デバッグビルド

### `preview`
- **用途**: テスター配布
- **配布**: Internal
- **ビルド**: リリースビルド（署名なし）

### `production`
- **用途**: App Store / Google Play配布
- **配布**: Store
- **ビルド**: 最適化された本番ビルド

---

## OTAアップデート（EAS Update）

コード変更をアプリストアを経由せず即座に配信：

```bash
# 変更をOTA配信
eas update

# 特定のブランチに配信
eas update --branch production

# メッセージ付きで配信
eas update --message "Fix: チャット送信バグ修正"
```

※ ネイティブコード変更（`expo-*`パッケージ追加など）はOTA不可。再ビルドが必要。

---

## 次のステップ

1. `app.json`内の`owner`をあなたのExpoユーザー名に変更
2. Development Buildをスマホにインストール
3. `npm start`で開発サーバー起動
4. 実機で即座に確認しながら開発

一人ユニコーンに向けて、最速で反復開発を行いましょう！🚀
