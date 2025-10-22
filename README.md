# Faro - Your Lifelong Social Benefits Partner

<div align="center">

**"あなたの人生の社会制度パートナー"**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4)](https://ai.google.dev/)

[English](#english) | [日本語](#japanese)

🚀 **Live Demo**: [https://faro10.vercel.app](https://faro10.vercel.app)

</div>

---

## 🌟 Faroとは？

**Faro**（スペイン語で「灯台」）は、日本の社会制度を楽しく学べるAIプラットフォームです。

従来の金融アプリとは異なり、Faroは**税金、年金、健康保険、雇用保険など、すべての社会制度を横断的にカバー**し、ユーザーの人生のライフイベントごとに最適な制度を提案します。

### なぜFaroが必要か？

**日本の社会制度は複雑すぎる**
- 知らないと損する制度が多い（医療費控除、育休給付金、住宅ローン控除...）
- 行政の縦割りで情報が分散している
- 「誰に聞けばいいかわからない」

**Faroが解決する**
- 🤖 **AIが24/7即答** - 税理士、社労士レベルの知識をAIで提供
- 🎯 **能動的に提案** - 「知らなかった」を防ぐ
- 🎮 **楽しく学べる** - Spotify風UI、3分体験モジュール
- 💰 **お金が増える** - 節税、給付金、控除をすべて最適化

---

## 🎯 コア機能

### Phase 1: 税金（現在）
- 💬 **AI税金相談** - 副業、ふるさと納税、確定申告...
- 🧮 **シミュレーター** - ふるさと納税限度額、医療費控除、住宅ローン控除
- 📚 **体験モジュール** - 3分で学べるインタラクティブレッスン

### Phase 2: 社会保険（6-12ヶ月）
- 年金シミュレーション（老齢、障害、遺族）
- 健康保険（傷病手当金、高額療養費）
- 雇用保険（失業手当、育児休業給付）

### Phase 3: ライフイベント（12-24ヶ月）
- 🤰 **出産** - 育休給付金、児童手当、医療費控除
- 💍 **結婚** - 配偶者控除、年金統合、扶養
- 🏠 **住宅購入** - 住宅ローン控除、不動産取得税
- 💼 **転職** - 失業手当、退職金、年金切り替え

### Phase 4: フルエージェント（24ヶ月〜）
- 能動的通知（「医療費が10万円超えました！確定申告で還付されます」）
- 申請サポート（給付金の申請手順をガイド）
- 専門家マッチング（税理士、社労士、FP紹介）

---

## 🏗️ Architecture

```
apps/
├── web/                    # Next.js 15 Web App
│   ├── app/
│   │   ├── page.tsx        # メインアプリ（統合UI）
│   │   ├── search/         # さがす（体験モジュール）
│   │   ├── tools/          # エージェント（能動的提案）
│   │   ├── mypage/         # マイページ（パーソナル情報）
│   │   └── connect/        # つながる（専門家紹介）
│   └── lib/
│       └── playlistData.ts # モジュールデータ管理

packages/
├── core/                   # ✅ Business Logic
├── infrastructure/         # ✅ Supabase + Gemini
└── ui/                     # Design System
```

### Tech Stack

**Frontend**: Next.js 15 + React 19 + TypeScript 5.7
**Backend**: Next.js API Routes + Supabase
**AI**: Gemini 2.0 Flash + text-embedding-004
**State**: Zustand + Immer
**UI**: Tailwind CSS + shadcn/ui + Framer Motion
**Payment**: Stripe（Freemium準備中）

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/faro.git
cd faro

# Install dependencies
pnpm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Development Status

**Overall**: 8/10 ✅ MVP完成

| Component | Status | Progress |
|-----------|--------|----------|
| Clean Architecture | ✅ Complete | 10/10 |
| AI Integration (Gemini) | ✅ Complete | 10/10 |
| 体験モジュール（税金） | ✅ Complete | 10/10 |
| シミュレーター | ✅ Complete | 10/10 |
| エージェント提案UI | ✅ Complete | 10/10 |
| マイページ | ✅ Complete | 10/10 |
| 専門家紹介 | 🚧 Placeholder | 5/10 |
| Stripe決済 | 🔜 準備中 | 0/10 |

---

## 🗺️ Roadmap

### Phase 1: 税金で圧倒的PMF（0-6ヶ月）← **現在地**
**目標**: 10,000ユーザー、NPS > 60

- ✅ 税金モジュール30種（完成）
- ✅ AI対話機能（完成）
- ✅ シミュレーター3種（完成）
- 🚧 SEO最適化（「副業 税金」1位目指す）
- 🚧 Product Hunt発売
- 🚧 Vercel本番デプロイ

### Phase 2: 社会保険追加（6-12ヶ月）
**目標**: 50,000ユーザー、$25k MRR

- 社会保険料シミュレーター
- 年金シミュレーター
- 健康保険（傷病手当金、高額療養費）
- Stripe決済実装（$9.99/月）

### Phase 3: ライフイベント拡張（12-24ヶ月）
**目標**: 200,000ユーザー、$100k MRR

- 出産モジュール
- 結婚モジュール
- 住宅購入モジュール
- 転職モジュール

### Phase 4: フルエージェント化（24-36ヶ月）
**目標**: 500,000ユーザー、$250k MRR（年商30億円）

- 能動的通知システム
- 申請サポート機能
- 専門家マッチング自動化
- B2B展開（企業・自治体向け）

**Ultimate Goal**: 年商50億円（企業評価100億円）🦄

---

## 💰 Business Model

### Freemium（主な収益源）
- **Free tier**: AI対話月30回、基本シミュレーター
- **Pro tier ($9.99/月)**: 無制限AI、全シミュレーター、エージェント機能

### アフィリエイト（高単価）
1. 税理士紹介: 2-10万円/件
2. 社労士紹介: 10-30万円/件
3. FP紹介: 5千-1万円/件
4. 不動産: 100-300万円/件
5. 保険: 3-10万円/件
6. 転職エージェント: 50-300万円/件
7. ふるさと納税: 寄付額の5%

### B2B（将来）
- 企業の人事部向け（従業員の制度相談をAIで対応）
- 自治体向け（住民の窓口業務を削減）

---

## 🎨 Design Philosophy

### "日本の社会制度を楽しく学べるNetflix"

**3つの柱**
1. **エンタメ × 教育** - Spotify風UI、楽しく学べる
2. **Context is Everything** - ユーザーの人生を完全理解
3. **能動的エージェント** - 知らないと損する制度を通知

**UX原則**
- モバイルファースト（375px〜）
- 3分体験モジュール（短く、楽しく）
- 対話型（質問に即答）

---

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - 完全プロジェクト仕様書
- [.workflow/STATUS.md](./.workflow/STATUS.md) - 現在の開発状況
- [.workflow/DECISIONS.md](./.workflow/DECISIONS.md) - 技術的決定ログ

---

## 🤝 Contributing

現在は一人開発プロジェクトです。将来的にコントリビューションを検討します。

---

## 📄 License

Proprietary - All Rights Reserved

---

<div align="center">

**一人の創業者がClaude Codeを使って構築中**

Faro - あなたの人生の社会制度パートナー 🏮

"知らないと損する"を、ゼロにする。

</div>
