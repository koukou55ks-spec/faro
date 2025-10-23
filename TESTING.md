# テスト戦略ガイド

**完全性より実用性を重視したテスト戦略**

---

## 🎯 テスト方針

### テストピラミッド（現実的版）

```
           /\
          /E2E\      ← 10% (重要なユーザーフロー)
         /------\
        /        \
       /Integration\ ← 20% (API・DB連携)
      /------------\
     /              \
    /   Unit Tests   \ ← 70% (ビジネスロジック)
   /------------------\
```

### カバレッジ目標

| テストタイプ | 目標カバレッジ | 優先度 |
|------------|--------------|--------|
| **Unit Tests** | 60%+ | 🔴 必須 |
| **Integration** | 40%+ | 🟡 推奨 |
| **E2E Tests** | 重要フロー | 🟢 選択 |

---

## 🧪 テストツール構成

### 1. Unit & Integration Tests: **Vitest + Testing Library**

**理由:**
- Jest互換だが高速（ESM対応、Vite統合）
- Next.js 15と相性良好
- ホットリロード対応

**設定:**
```bash
# インストール
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom

# 実行
pnpm test              # テスト実行
pnpm test:watch        # ウォッチモード
pnpm test:coverage     # カバレッジ
```

### 2. E2E Tests: **Playwright**

**理由:**
- 複数ブラウザ対応
- 並列実行が速い
- Next.jsと統合簡単

**対象:**
- ユーザー登録 → ログイン → 初回チャット
- Pro登録フロー（Stripe連携）
- ノート作成 → 保存 → 検索

---

## 📝 何をテストするか

### ✅ テストすべきもの（優先度順）

#### 1. ビジネスロジック（Unit）🔴 必須
```typescript
// ✅ lib/ai/rag.ts
describe('RAG System', () => {
  it('should return relevant documents', async () => {
    const result = await searchDocs('確定申告')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].relevance).toBeGreaterThan(0.7)
  })
})

// ✅ lib/recommendations/engine.ts
describe('Recommendation Engine', () => {
  it('should suggest relevant tools', () => {
    const suggestions = getRecommendations(userProfile)
    expect(suggestions).toContain('iDeCo')
  })
})
```

#### 2. ユーティリティ関数（Unit）🔴 必須
```typescript
// ✅ lib/utils/formatters.ts
describe('formatCurrency', () => {
  it('should format JPY correctly', () => {
    expect(formatCurrency(1000)).toBe('¥1,000')
  })
})
```

#### 3. カスタムフック（Unit）🟡 推奨
```typescript
// ✅ lib/hooks/useAuthStatus.ts
describe('useAuthStatus', () => {
  it('should return authenticated state', () => {
    const { result } = renderHook(() => useAuthStatus())
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

#### 4. API Routes（Integration）🟡 推奨
```typescript
// ✅ app/api/v1/chat/route.test.ts
describe('POST /api/v1/chat', () => {
  it('should return AI response', async () => {
    const res = await POST({
      json: async () => ({ message: 'こんにちは' })
    })
    expect(res.status).toBe(200)
  })
})
```

#### 5. UIコンポーネント（Unit）🟢 選択的
```typescript
// ✅ components/ui/Button.test.tsx
describe('Button', () => {
  it('should render with primary variant', () => {
    render(<Button variant="primary">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('from-blue-600')
  })
})
```

---

### ❌ テストしなくてよいもの

- **Next.jsのルーティング** - フレームワークの責任
- **サードパーティライブラリ** - Supabase, Gemini等
- **シンプルな表示コンポーネント** - `<div>`だけのコンポーネント
- **型定義** - TypeScriptがチェック

---

## 📂 テストファイル配置

### パターン1: 並列配置（推奨）
```
lib/
├── ai/
│   ├── rag.ts
│   └── rag.test.ts          # ← 同階層に配置
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
```

### パターン2: test/ ディレクトリ（E2E用）
```
test/
├── e2e/
│   ├── auth.spec.ts
│   ├── chat.spec.ts
│   └── subscription.spec.ts
└── setup.ts
```

---

## 🚀 実装ロードマップ

### Phase 1: 基盤構築（1日）✅
- [x] Vitest設定
- [x] Testing Library設定
- [x] サンプルテスト作成

### Phase 2: 重要ロジック（1週間）🔴 優先
- [ ] RAGシステムのテスト
- [ ] レコメンドエンジンのテスト
- [ ] 認証フローのテスト
- [ ] Stripe Webhookのテスト

### Phase 3: API Routes（1週間）🟡
- [ ] POST /api/v1/chat
- [ ] POST /api/stripe/webhook
- [ ] GET /api/v1/notes

### Phase 4: E2E（収益化後）🟢
- [ ] ユーザー登録フロー
- [ ] Pro登録フロー
- [ ] 重要な業務フロー

---

## 📊 CI/CDでの実行

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm build # ビルドテスト
```

---

## 🎓 テストのベストプラクティス

### 1. AAA パターン
```typescript
it('should calculate tax correctly', () => {
  // Arrange - 準備
  const income = 5000000

  // Act - 実行
  const tax = calculateTax(income)

  // Assert - 検証
  expect(tax).toBe(572500)
})
```

### 2. テストは独立させる
```typescript
// ❌ 悪い例 - 順序依存
let user
it('creates user', () => { user = create() })
it('updates user', () => { update(user) }) // user依存

// ✅ 良い例 - 各テストで準備
it('updates user', () => {
  const user = createTestUser()
  update(user)
})
```

### 3. モックは最小限
```typescript
// ❌ 過剰なモック
vi.mock('./everything')

// ✅ 必要な部分のみ
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve(mockUser))
}))
```

---

## 📈 カバレッジレポート

```bash
# カバレッジ生成
pnpm test:coverage

# レポート確認
open coverage/index.html
```

**目標達成チェック:**
```
✅ Statements: 60%+
✅ Branches: 50%+
✅ Functions: 60%+
✅ Lines: 60%+
```

---

## 🔗 参考資料

- [Vitest公式](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
- [Kent C. Dodds - Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**現実的で継続可能なテスト戦略を目指しましょう。**
