# Faro Mobile Implementation Roadmap
# モバイルアプリ実装ロードマップ

**作成日**: 2025-10-12
**対象**: iOS/Android ネイティブアプリ展開計画

---

## 🎯 戦略サマリー

Faroのモバイル展開は「**Webで100人獲得 → TestFlightで10,000人**」の段階的アプローチ。

一人開発で最大効率を出すため、React Native + Expoを採用し、`@faro/core`を完全共有。

---

## 📅 タイムライン

### Phase 1: Web MVP完成（現在 → +1ヶ月）
**目標**: Webアプリで100人の熱狂的ユーザー獲得

- [x] Clean Architecture実装（`@faro/core`）
- [x] Supabase統合
- [x] Gemini AI統合
- [ ] `/chat` UI完成
- [ ] `/workspace` UI完成
- [ ] Vercel本番デプロイ
- [ ] Product Hunt公開

**成功指標**:
- 100人サインアップ
- DAU/MAU > 40%
- NPS > 50

---

### Phase 2: モバイル準備（+1〜2ヶ月）
**目標**: React Native基盤構築

#### 2.1 開発環境セットアップ
```bash
# apps/mobile/ 初期化
npx create-expo-app@latest apps/mobile --template blank-typescript

# 必須パッケージインストール
cd apps/mobile
npx expo install expo-dev-client expo-router expo-secure-store
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-gesture-handler react-native-reanimated
```

#### 2.2 共有コード準備
```typescript
// apps/mobile/app/_layout.tsx
import { useAuthStore } from '@faro/shared/stores/useAuthStore';
import { SendMessageUseCase } from '@faro/core/usecases/SendMessageUseCase';

// ビジネスロジックは完全共有！
```

#### 2.3 ネイティブ機能統合
- [ ] Supabase Auth (Expo Secure Store)
- [ ] プッシュ通知準備（Expo Notifications）
- [ ] 生体認証（expo-local-authentication）
- [ ] カメラ・写真（expo-image-picker）

**成果物**:
- `apps/mobile/` プロジェクト完成
- Expo Development Build動作確認
- Web/Mobileでコード共有率70%以上

---

### Phase 3: iOS TestFlight（+2〜3ヶ月）
**目標**: Apple TestFlightで10,000人ベータテスター獲得

#### 3.1 Apple Developer登録
```bash
# $99/年
https://developer.apple.com/programs/enroll/
```

#### 3.2 EAS Build設定
```bash
# eas.json作成
npx eas build:configure

# iOS Development Build
npx eas build --profile development --platform ios

# TestFlight用 Production Build
npx eas build --profile production --platform ios
```

**eas.json** (例):
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.faro.app",
        "buildNumber": "1.0.0"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your_apple_id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

#### 3.3 TestFlight公開
```bash
# App Store Connectにアップロード
npx eas submit --platform ios

# TestFlight Public Link作成
# https://testflight.apple.com/join/XXXXXX
```

#### 3.4 TestFlight配信戦略
- Twitter/Product Hunt/Redditで拡散
- 「最初の100人に生涯無料アクセス」特典
- フィードバック収集（App Store Connect → Crashlytics）

**成功指標**:
- 10,000 TestFlightダウンロード
- クラッシュ率 < 0.1%
- App Store Rating > 4.5

---

### Phase 4: Android Beta（+3〜4ヶ月）
**目標**: Google Play Beta公開

#### 4.1 Google Play登録
```bash
# $25（一度のみ）
https://play.google.com/console/signup
```

#### 4.2 Android Build
```bash
# EAS Build (Android)
npx eas build --profile production --platform android

# Google Play Consoleにアップロード
npx eas submit --platform android
```

#### 4.3 ベータ版公開
- Google Play「クローズドテスト」→「オープンベータ」
- TestFlight以上の規模を狙う（人数制限なし）

**成功指標**:
- 5,000 Androidベータダウンロード
- iOS/Android合計15,000ユーザー

---

### Phase 5: 正式リリース（+4〜6ヶ月）
**目標**: App Store/Google Play正式公開

#### 5.1 審査対応
**Apple App Store**:
- App Privacy設定（収集データ明記）
- スクリーンショット（6.7", 6.5", 5.5"）
- プレビュー動画（15〜30秒）
- 審査期間: 24〜48時間

**Google Play**:
- Data Safety設定
- 特集用グラフィック（1024x500px）
- 審査期間: 数時間〜7日

#### 5.2 ASO（App Store最適化）
**タイトル**: Faro - AI Financial Advisor

**サブタイトル** (iOS):
> Your lifelong financial thinking partner

**説明文**（最初の3行が重要）:
```
Faro is your AI-powered financial advisor that helps you make smarter money decisions.

Unlike traditional finance apps that just track expenses, Faro understands your context and provides expert-level advice through natural conversation.

Features:
✓ AI Chat - Ask anything about money
✓ Smart Kakeibo - AI-powered expense tracking
✓ Financial Notes - Notion-style documentation
✓ Tax Optimization - Automated tax planning
```

**キーワード** (iOS):
```
finance, ai, advisor, budget, tax, kakeibo, money, planning, investment, savings
```

#### 5.3 ローンチ戦略
- Product Hunt「Product of the Day」狙い
- TechCrunch/The Verge プレスリリース
- Twitter/LinkedIn インフルエンサー連携

**目標**:
- 初週5,000ダウンロード
- 初月50,000ダウンロード

---

## 🛠️ 技術スタック

### モバイル専用
```typescript
// apps/mobile/package.json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-router": "~4.0.0",
    "expo-dev-client": "~5.0.0",
    "expo-secure-store": "~15.0.0",
    "expo-notifications": "~0.30.0",
    "expo-local-authentication": "~15.0.0",
    "react-native": "0.77.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.22.0",

    // Faro共有パッケージ
    "@faro/core": "workspace:*",
    "@faro/infrastructure": "workspace:*",
    "@faro/shared": "workspace:*",
    "@faro/ui": "workspace:*"
  }
}
```

### UI共通化戦略
```
Web: Tailwind CSS + shadcn/ui
Mobile: React Native StyleSheet + Reanimated

共通:
  - デザイントークン (@faro/ui/design-system)
  - カラー、スペーシング、タイポグラフィ
```

---

## 💰 コスト試算

| 項目 | コスト | タイミング |
|------|--------|-----------|
| Apple Developer | $99/年 | Phase 3開始時 |
| Google Play | $25（一度） | Phase 4開始時 |
| EAS Build | $29/月〜 | Phase 3開始時 |
| Supabase Pro | $25/月 | 1万ユーザー時 |
| **Total (初年度)** | **$567** | Phase 3〜5 |

**期待収益** (Phase 5終了時):
- 50,000ユーザー × 3%転換率 × $9.99 = **$14,985/月**
- **$179,820/年**

**ROI**: 31,700%

---

## 📊 モバイル優先機能

### Phase 3（TestFlight）で実装
- [x] AIチャット（音声入力対応）
- [ ] プッシュ通知（AIからの能動的アドバイス）
- [ ] ウィジェット（今日の支出、予算残高）
- [ ] ダークモード

### Phase 4（Android Beta）で実装
- [ ] 生体認証ログイン
- [ ] カメラでレシート読み取り
- [ ] オフラインモード（ローカルDB）
- [ ] Apple Pay / Google Pay統合

### Phase 5（正式リリース）で実装
- [ ] Apple Watch / Wear OSアプリ
- [ ] Siriショートカット / Google Assistant
- [ ] 銀行連携（Plaid）
- [ ] 共有機能（家族アカウント）

---

## 🎯 マイルストーン

### M1: モバイル基盤完成（+2ヶ月）
- [ ] `apps/mobile/` プロジェクト作成
- [ ] Expo Router設定
- [ ] Supabase Auth統合
- [ ] `/chat` 画面実装

### M2: iOS TestFlight公開（+3ヶ月）
- [ ] Apple Developer登録
- [ ] EAS Build設定
- [ ] TestFlight Public Link配信
- [ ] 1,000ダウンロード達成

### M3: Android Beta公開（+4ヶ月）
- [ ] Google Play登録
- [ ] Android Build
- [ ] オープンベータ公開
- [ ] 5,000ダウンロード達成

### M4: 正式リリース（+6ヶ月）
- [ ] App Store公開
- [ ] Google Play公開
- [ ] Product Hunt公開
- [ ] 50,000ダウンロード達成

---

## ✅ 次のアクション

### 今すぐ（Phase 1完了後）
```bash
# 1. モバイルプロジェクト作成
npx create-expo-app@latest apps/mobile --template blank-typescript

# 2. 共有パッケージ統合
cd apps/mobile
pnpm add @faro/core @faro/infrastructure @faro/shared @faro/ui

# 3. 開発サーバー起動
npx expo start --dev-client
```

### 1週間以内
- [ ] `/chat` 画面をMobileで実装
- [ ] Supabase Auth動作確認
- [ ] iOS Simulator動作確認

### 1ヶ月以内
- [ ] Apple Developer登録
- [ ] EAS Build実行
- [ ] TestFlight内部配信開始

---

## 📚 参考資料

### 成功事例
- **Superhuman**: Web → iOS TestFlight → 10万ウェイトリスト
- **Notion**: Web → iOS/Android同時リリース → 2000万ユーザー
- **Linear**: Web優先 → モバイルは後回し（戦略的判断）

### Expo公式ドキュメント
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Router: https://docs.expo.dev/router/introduction/
- TestFlight: https://docs.expo.dev/submit/ios/

---

**結論**: Webで100人獲得後、すぐにiOS TestFlight準備開始。Android Betaは並行して進める。
