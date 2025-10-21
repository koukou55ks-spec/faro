# サブスク管理機能 - 要件定義書

## 概要
Faroにサブスクリプション管理機能を追加し、ユーザーが月額・年額サービスを一元管理できるようにする。

## 機能要件

### 1. コア機能

#### 1.1 サブスク登録
- **サービス名**: Netflix, Spotify, ChatGPTなど
- **料金**: 月額/年額の選択
- **支払い日**: 毎月の引き落とし日
- **カテゴリ**: エンタメ、仕事、学習、健康など
- **通貨**: 円/ドル/ユーロ対応
- **自動更新**: ON/OFF
- **無料試用期間**: 終了日の記録

#### 1.2 通知機能
- **更新通知**: 引き落とし前日にリマインド
- **試用期間終了**: 3日前と前日に通知
- **年額更新**: 1週間前に通知
- **値上げ通知**: 料金変更の記録と通知

#### 1.3 分析・レポート
- **月間支出**: 総額と前月比較
- **カテゴリ別内訳**: 円グラフ表示
- **年間推移**: 折れ線グラフ
- **利用頻度分析**: アクティブ/非アクティブ判定
- **節約提案**: 未使用サービスの検出

### 2. データモデル

```typescript
// サブスクリプションエンティティ
interface Subscription {
  id: string
  userId: string
  serviceName: string        // Netflix, Spotify など
  serviceIcon?: string       // アイコンURL
  amount: number             // 金額
  currency: 'JPY' | 'USD' | 'EUR'
  billingCycle: 'monthly' | 'yearly' | 'weekly'
  nextBillingDate: Date      // 次回請求日
  category: SubscriptionCategory
  status: 'active' | 'paused' | 'cancelled' | 'trial'
  trialEndDate?: Date        // 試用期間終了日
  autoRenew: boolean         // 自動更新
  paymentMethod?: string     // クレカ末尾4桁など
  notes?: string            // メモ
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
}

// カテゴリ
type SubscriptionCategory =
  | 'entertainment'    // エンタメ（Netflix, Disney+）
  | 'music'           // 音楽（Spotify, Apple Music）
  | 'productivity'    // 仕事（Notion, Slack）
  | 'cloud_storage'   // ストレージ（iCloud, Google Drive）
  | 'learning'        // 学習（Udemy, Coursera）
  | 'news'           // ニュース（日経、WSJ）
  | 'fitness'        // 健康（Apple Fitness+）
  | 'gaming'         // ゲーム（PS Plus, Xbox）
  | 'software'       // ソフト（Adobe, Office）
  | 'ai_tools'       // AI（ChatGPT, Claude）
  | 'other'          // その他

// 支払い履歴
interface PaymentHistory {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  paidAt: Date
  status: 'success' | 'failed' | 'pending'
}

// 通知設定
interface NotificationSettings {
  userId: string
  renewalReminder: boolean      // 更新リマインド
  reminderDaysBefore: number    // 何日前に通知
  trialEndReminder: boolean     // 試用期間終了通知
  priceChangeAlert: boolean     // 値上げアラート
  unusedServiceAlert: boolean   // 未使用サービス通知
}
```

### 3. 必要な実装

#### フロントエンド
1. **UI コンポーネント**
   - サブスク一覧画面
   - 新規登録フォーム
   - 編集モーダル
   - カレンダービュー（支払い予定表示）
   - 分析ダッシュボード

2. **状態管理（Zustand）**
   - `useSubscriptionStore`
   - `useGuestSubscriptionStore`（ゲストモード用）

#### バックエンド
1. **Supabase テーブル**
   - `subscriptions`
   - `payment_histories`
   - `notification_settings`

2. **API エンドポイント**
   - `/api/subscriptions` - CRUD操作
   - `/api/subscriptions/analytics` - 分析データ
   - `/api/subscriptions/notifications` - 通知設定

3. **定期実行ジョブ（Cron）**
   - 毎日: 通知チェック
   - 毎月: レポート生成

### 4. 実装優先順位

#### Phase 1: MVP（1週間）
- [x] データモデル設計
- [ ] ゲストモードストア実装
- [ ] 基本CRUD機能
- [ ] シンプルな一覧表示UI

#### Phase 2: 分析機能（2週間目）
- [ ] 月間サマリー
- [ ] カテゴリ別集計
- [ ] グラフ表示（Recharts使用）

#### Phase 3: 通知・自動化（3週間目）
- [ ] 通知システム
- [ ] カレンダー統合
- [ ] 未使用サービス検出

### 5. 技術スタック

- **フロントエンド**:
  - React + Next.js
  - Zustand（状態管理）
  - Recharts（グラフ）
  - lucide-react（アイコン）

- **バックエンド**:
  - Supabase（DB + Auth）
  - Next.js API Routes
  - node-cron（定期実行）

- **モバイル**:
  - React Native
  - Expo Notifications

### 6. UI/UXデザイン

#### メイン画面
```
┌─────────────────────────────────────┐
│ 📊 サブスク管理                      │
├─────────────────────────────────────┤
│ 今月の支払い予定: ¥12,850           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│ アクティブなサブスク (8)            │
│ ┌───────────────────────────────┐ │
│ │ 🎬 Netflix      ¥1,490/月    │ │
│ │    次回: 10/25               │ │
│ ├───────────────────────────────┤ │
│ │ 🎵 Spotify      ¥980/月     │ │
│ │    次回: 10/28               │ │
│ ├───────────────────────────────┤ │
│ │ 🤖 ChatGPT Plus  $20/月      │ │
│ │    次回: 11/1                │ │
│ └───────────────────────────────┘ │
│                                     │
│ [＋ 新規追加]                       │
└─────────────────────────────────────┘
```

#### 分析画面
```
┌─────────────────────────────────────┐
│ 📈 支出分析                          │
├─────────────────────────────────────┤
│ 月間推移                            │
│ ┌─────────────────────────────┐   │
│ │     📊 折れ線グラフ          │   │
│ │   15k┤                       │   │
│ │   10k┤    ╱─────╲            │   │
│ │    5k┤___╱        ╲___       │   │
│ │      └─────────────────────   │   │
│ │      J F M A M J J A S O     │   │
│ └─────────────────────────────┘   │
│                                     │
│ カテゴリ別                          │
│ ┌─────────────────────────────┐   │
│ │ エンタメ    45% ████████    │   │
│ │ 仕事       30% ██████       │   │
│ │ 学習       15% ███          │   │
│ │ その他     10% ██           │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 7. 差別化ポイント

1. **AIアドバイス機能**
   - 「このサブスク、3ヶ月使ってないけど解約する？」
   - 「Netflix年額プランの方が15%お得だよ」
   - 「同じカテゴリで重複してるサービスがあるよ」

2. **日本サービス特化**
   - dマガジン、U-NEXT、Hulu対応
   - 日本円メインの料金管理
   - 日本の決済サービス対応

3. **家計簿連携**
   - 既存の家計簿機能と統合
   - サブスクを固定費として自動計上
   - 予算管理との連動

### 8. セキュリティ・プライバシー

- パスワードは保存しない
- 支払い情報は末尾4桁のみ
- データは全てユーザーローカルまたはSupabase RLSで保護
- ゲストモードはlocalStorageのみ使用

### 9. 成功指標（KPI）

- **利用率**: アクティブユーザーの50%が使用
- **継続率**: 機能使用者の80%が毎月更新
- **節約額**: 平均月2,000円の無駄を発見
- **満足度**: NPS 50以上

### 10. リリース計画

1. **Week 1**: ゲストモードでMVP実装
2. **Week 2**: 認証ユーザー向けDB統合
3. **Week 3**: 分析・レポート機能
4. **Week 4**: 通知システム
5. **Week 5**: モバイルアプリ対応
6. **Week 6**: AI機能統合

---

## 実装開始チェックリスト

- [ ] このスペックのレビューと承認
- [ ] UIモックアップの作成
- [ ] データベーススキーマの作成
- [ ] ゲストモードストアの実装
- [ ] 基本CRUDコンポーネント
- [ ] テストケースの作成

## 参考競合サービス

- **Bobby** - シンプルなサブスク管理
- **Subscriptions Tracker** - カレンダー連携
- **Money Forward ME** - 日本の家計簿アプリ
- **Mint** - 総合的な財務管理（閉鎖）

## 技術的な課題と解決策

### 課題1: 為替レート
- **解決**: 固定レートまたは手動入力

### 課題2: サービスアイコン
- **解決**: 主要100サービスは事前登録、その他は絵文字

### 課題3: 支払い日の自動検出
- **解決**: 初回は手動、履歴から学習

### 課題4: 無料試用期間の管理
- **解決**: 登録時に終了日を入力必須