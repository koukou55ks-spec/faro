# Adaptive Canvas - 3D金融データ可視化UI実験

## 目的

従来の2D UIを超えた、革新的な金融体験インターフェースの実現

- コンテキスト駆動型の動的UI
- 3D空間でのデータ可視化
- 時間軸を自由に移動できるナビゲーション
- 複数AIペルソナの協調システム

## 実装日

2025-10-10

## ステータス

- [x] 完了（不採用）

## 実装した機能

### 1. Adaptive Canvas (メインシステム)
- 3層レイヤーシステム（Context / Conversation / Tool）
- Three.js + React Three Fiber統合
- 動的背景グラデーション

### 2. Time-Shift Navigator
- 過去・現在・未来を自由に移動
- ドラッグ可能なタイムラインUI
- 時間軸に応じたデータフィルタリング

### 3. Semantic Workspace
- 3D空間での金融データノード表示
- 4つのレイアウト（graph / timeline / layers / constellation）
- 意味的関連性による自動組織化

### 4. AI Persona Manager
- 複数AIペルソナの同時実行
- 税務アドバイザー、投資ストラテジスト、家計コーチ
- パーソナリティ特性の可視化

### 5. Morphing Messages
- テキスト→チャート→カード→タイムラインへの自動変形
- コンテキスト依存の表示形式

### 6. Gesture Handler
- タッチジェスチャー対応（スワイプ、ピンチ、シェイク）
- デバイスモーション検知

### 7. Ambient Display
- 金融健康度のリアルタイム表示
- マーケット状況インジケーター
- 次のイベント通知

### 8. Dynamic Tool Layer
- コンテキスト依存のツール自動サジェスト
- ドラッグ可能な浮遊ツール（電卓、チャート、タイムライン）

## 技術スタック

- **3D**: Three.js, React Three Fiber, @react-three/drei
- **アニメーション**: Framer Motion
- **状態管理**: Zustand + Immer (MapSet対応)
- **TypeScript**: 完全型安全

## ファイル構成

```
experiments/adaptive-canvas/
├── README.md (このファイル)
├── components/
│   ├── AdaptiveCanvas.tsx           # メインCanvas
│   ├── AIPersonaManager.tsx         # AIペルソナ管理
│   ├── AmbientDisplay.tsx           # 環境情報表示
│   ├── GestureHandler.tsx           # ジェスチャー制御
│   ├── MorphingMessage.tsx          # モーフィングメッセージ
│   ├── SemanticWorkspace.tsx        # 3Dセマンティック空間
│   ├── TimeShiftNavigator.tsx       # 時間軸ナビゲーター
│   └── layers/
│       ├── ContextLayer.tsx         # 3D背景レイヤー
│       ├── ConversationLayer.tsx    # 会話レイヤー
│       └── ToolLayer.tsx            # 動的ツールレイヤー
└── adaptive-canvas-store.ts         # Zustand状態管理
```

## 学び

### 成功したこと ✅

1. **技術的実装**: すべての機能を技術的に実装できた
2. **3D統合**: Three.jsとReactの統合に成功
3. **状態管理**: Zustand + Immerで複雑な状態を管理
4. **アニメーション**: Framer Motionで滑らかなUI遷移
5. **型安全性**: TypeScriptで完全な型チェック

### 課題 ❌

1. **複雑性**: 実装が複雑すぎてメンテナンス困難
2. **実用性**: ユーザーが実際に使いこなせない
3. **パフォーマンス**: 3D描画でリソース消費が大きい
4. **学習曲線**: 新しいUIパラダイムの習得コスト高
5. **バグ修正**: Immer MapSet、Environment読み込み等の問題

## 不採用の理由

1. **Over-engineering**: 問題に対して解決策が複雑すぎる
2. **UX**: 革新的すぎて、実際の金融管理には不向き
3. **保守性**: 将来のメンテナンスコストが高すぎる
4. **ROI**: 開発コストに対するユーザー価値が不明確
5. **シンプルさ**: Faroのコアバリューである「Accessible excellence」に反する

## 代替案

シンプルで実用的なアプローチ：

1. **標準的な2D UI**: 既存のチャットページをベースに機能追加
2. **段階的な革新**: 小さな改善を積み重ねる
3. **ユーザーフィードバック**: 実際のニーズに基づいて開発
4. **プロトタイプ優先**: MVPで検証してから拡張

## 将来の可能性

以下の要素は将来的に再利用可能：

- [ ] **Morphing Messages**: シンプル版として2D UIに統合
- [ ] **Time-Shift Navigator**: タイムライン機能として簡略化
- [ ] **AI Persona Manager**: チャットモード切替として実装
- [ ] **Ambient Display**: ステータスバーとして採用

## 使用方法（参考用）

もし将来的に使用する場合：

```typescript
// apps/web/app/(app)/chat/page.tsx
import dynamic from 'next/dynamic'

const AdaptiveCanvas = dynamic(
  () => import('@/experiments/adaptive-canvas/components/AdaptiveCanvas').then(m => m.AdaptiveCanvas),
  { ssr: false }
)

export default function ChatPage() {
  return <AdaptiveCanvas />
}
```

**必須**: `enableMapSet()`をImporterで有効化

```typescript
import { enableMapSet } from 'immer'
enableMapSet()
```

## スクリーンショット

（実装時のスクリーンショットを追加予定）

## 結論

**革新的なアイデアだったが、実用性とのバランスが取れなかった。**

学びを活かし、よりシンプルで実用的なUIを構築する。

---

**実験日**: 2025-10-10
**実装者**: Claude (Anthropic)
**評価**: 技術的成功、実用性失敗
**次のステップ**: シンプルな2D UIの段階的改善
