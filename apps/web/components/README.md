# コンポーネント設計ガイド

## 📁 ディレクトリ構造と責務

```
components/
├── ui/                    # 🧩 汎用UIコンポーネント（プロジェクト非依存）
│   ├── Button.tsx         # ボタン（variant: primary/secondary/ghost/danger）
│   ├── Card.tsx           # カード（variant: default/bordered/elevated）
│   ├── AffiliateLink.tsx  # アフィリエイトリンク
│   ├── BottomNavigation.tsx # 下部ナビゲーション
│   ├── ErrorBoundary.tsx  # エラーバウンダリ
│   ├── LoadingSkeleton.tsx # ローディング
│   └── editor/            # エディター関連
│       └── NotionEditor.tsx
│
└── features/              # 🎯 機能別コンポーネント（ビジネスロジック含む）
    ├── chat/              # チャット機能
    │   ├── components/    # チャット専用UI
    │   └── stores/        # チャット状態管理
    ├── notes/             # ノート機能
    ├── quiz/              # クイズ機能
    ├── simulator/         # シミュレーター
    └── subscription/      # サブスク管理
```

---

## 🎯 判断基準: ui/ vs features/

### ✅ `ui/` に配置すべきもの

**条件（以下を全て満たす）:**
1. **プロジェクト非依存** - 他のプロジェクトでも再利用可能
2. **Pure UI** - ビジネスロジックを含まない
3. **Props駆動** - 外部から全ての動作を制御可能
4. **状態を持たない** - または最小限のUI状態のみ

**例:**
```tsx
// ✅ ui/Button.tsx - 良い例
export const Button = ({ variant, onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>
}

// ✅ ui/Card.tsx - 良い例
export const Card = ({ variant, children }: CardProps) => {
  return <div className={variantClasses[variant]}>{children}</div>
}
```

---

### ✅ `features/` に配置すべきもの

**条件（いずれかを満たす）:**
1. **ドメイン依存** - 税金、チャット、ノート等の特定機能に紐付く
2. **ビジネスロジック** - API呼び出し、データ加工、状態管理
3. **複雑な状態** - Zustand/React Query等を使用
4. **機能単位** - 単独で動作する完結した機能

**例:**
```tsx
// ✅ features/chat/components/ChatPanel.tsx - 良い例
export function ChatPanel() {
  const { messages, sendMessage } = useChatStore() // Zustand
  const handleSend = async (text: string) => {
    await fetch('/api/v1/chat', { ... }) // API呼び出し
  }
  return <div>...</div>
}

// ✅ features/notes/components/NotesPanel.tsx - 良い例
export function NotesPanel() {
  const { notes } = useNotesStore() // ドメイン固有の状態
  return <div>...</div>
}
```

---

## 🚫 よくある間違い

### ❌ 間違った配置例

```tsx
// ❌ ui/ChatButton.tsx - 間違い！
// チャット固有なので features/chat/components/ に配置すべき
export function ChatButton() {
  const { openChat } = useChatStore()
  return <Button onClick={openChat}>チャット開始</Button>
}

// ❌ features/common/Button.tsx - 間違い！
// 汎用UIなので ui/ に配置すべき
export function Button({ variant, ...props }: ButtonProps) {
  return <button {...props} />
}
```

---

## 📐 設計パターン

### Pattern 1: Composition（推奨）

```tsx
// ✅ features/chat/components/ChatPanel.tsx
import { Button } from '../../ui/Button' // 汎用UIを利用
import { Card } from '../../ui/Card'

export function ChatPanel() {
  return (
    <Card variant="elevated">
      <Button variant="primary" onClick={handleSend}>送信</Button>
    </Card>
  )
}
```

### Pattern 2: 機能専用ラッパー

```tsx
// ✅ features/chat/components/SendButton.tsx
import { Button, ButtonProps } from '../../ui/Button'

export function SendButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />
}
```

---

## 🔍 チェックリスト

新しいコンポーネントを作成する時:

- [ ] このコンポーネントは他のプロジェクトでも使える？ → YES: `ui/`
- [ ] ビジネスロジックやAPI呼び出しが含まれる？ → YES: `features/`
- [ ] 特定機能（チャット、ノート等）に依存する？ → YES: `features/`
- [ ] Zustand/React Queryを使用する？ → YES: `features/`
- [ ] 単純なUI表示のみ？ → YES: `ui/`

---

## 📚 参考資料

- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [コンポーネント設計のベストプラクティス](https://zenn.dev/knowledgework/articles/3a8e19)

---

**このガイドに従えば、6ヶ月後もコードベースが理解しやすく保守可能です。**
