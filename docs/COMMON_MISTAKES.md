# よくある実装ミスと防止策

このドキュメントは、過去に発生した実装ミスとその防止策をまとめたものです。
新機能実装時は必ずこのドキュメントを確認してください。

## 目次
1. [Zustandストアの関数シグネチャ統一](#zustandストアの関数シグネチャ統一)
2. [データベースマイグレーション完全性](#データベースマイグレーション完全性)
3. [API開発時の必須確認事項](#api開発時の必須確認事項)
4. [開発環境での認証スキップパターン](#開発環境での認証スキップパターン)

---

## Zustandストアの関数シグネチャ統一

### 原則
**認証トークンは常に第1引数**

### 理由
- 開発環境での認証スキップパターンを統一するため
- 空文字列 `''` をフォールバックとして渡しやすくするため
- コードの可読性と一貫性を保つため

### 正しいパターン ✅
```typescript
interface DocumentsState {
  uploadDocument: (token: string, file: File, collectionId?: string) => Promise<Document>
  createCollection: (token: string, name: string, description?: string) => Promise<Collection>
  fetchDocuments: (token: string, collectionId?: string) => Promise<void>
  fetchCollections: (token: string) => Promise<void>
}
```

### 間違ったパターン ❌
```typescript
// これは間違い！NotebookLM実装時にこの間違いを犯した
interface DocumentsState {
  uploadDocument: (file: File, token: string, collectionId?: string) => Promise<Document>
  createCollection: (name: string, token: string, description?: string) => Promise<Collection>
}
```

### 実装時のチェックリスト
- [ ] 新しいストア関数を作る前に、既存の関数シグネチャを確認
- [ ] `token`引数が第1引数になっているか確認
- [ ] 呼び出し側のコード（コンポーネント）も全て確認して修正
- [ ] TypeScriptのエラーが出ていないか確認

### 実例（NotebookLM修正時）
```typescript
// 修正前（間違い）
uploadDocument: (file: File, token: string, collectionId?: string) => Promise<Document>

// 呼び出し側
await uploadDocument(file, authToken || '', projectId)

// 修正後（正しい）
uploadDocument: (token: string, file: File, collectionId?: string) => Promise<Document>

// 呼び出し側
await uploadDocument(authToken || '', file, projectId)
```

---

## データベースマイグレーション完全性

### 原則
**コードで使うカラムは全てマイグレーションに含める**

### チェック項目
- [ ] APIで`insert`する全カラムがマイグレーションに含まれているか
- [ ] マイグレーションファイル名が正しいタイムスタンプ形式か（`YYYYMMDDHHMMSS_name.sql`）
- [ ] `IF NOT EXISTS`を使って冪等性を確保しているか
- [ ] インデックスも一緒に作成しているか
- [ ] COMMENTで説明を追加しているか

### 実例（NotebookLM）

#### 問題
`/api/documents/upload`で`content`カラムに値を入れようとしたが、マイグレーションに含めるのを忘れた。

#### 修正前のマイグレーション（不完全）❌
```sql
-- collection_id だけ追加
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
```

#### 修正後のマイグレーション（完全）✅
```sql
-- collection_id を追加
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- content カラムを追加（これを忘れていた！）
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS content TEXT;

-- インデックスも作成
CREATE INDEX IF NOT EXISTS idx_documents_collection_id ON documents(collection_id);

-- コメントで説明
COMMENT ON COLUMN documents.collection_id IS 'Direct collection assignment for NotebookLM';
COMMENT ON COLUMN documents.content IS 'Extracted text content (first 10k chars for quick access)';
```

### マイグレーション作成のワークフロー
1. コードで使う全てのカラムをリストアップ
2. マイグレーションファイルを作成（タイムスタンプ形式）
3. `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` で冪等性を確保
4. インデックスを追加（検索に使うカラム）
5. COMMENTで説明を追加
6. Supabase SQL Editorで実行してテスト

---

## API開発時の必須確認事項

### 🚨 最重要原則：新規API作成時は必ず既存APIをテンプレートとして使用

**絶対ルール**: 新しいAPIを作成する際は、車輪の再発明をしない。必ず既存のAPIをコピー＆ペーストして、認証パターンを統一する。

#### 推奨テンプレート
- `/api/documents/route.ts` - GET/POSTの基本パターン
- `/api/chat/route.ts` - ストリーミングレスポンスパターン
- `/api/notebook/chat/route.ts` - 開発環境認証スキップの完全実装

#### 手順
1. 既存APIファイルを丸ごとコピー
2. エンドポイント固有のロジックだけ変更
3. 認証部分は**絶対に**そのまま使う

#### 実例：`/api/collections`での失敗
`/api/collections`を新規作成した際、開発環境での認証スキップを実装せず、401エラーが発生した。
既存の`/api/documents`をテンプレートとして使っていれば防げた問題。

---

### 新しいAPIエンドポイントを作成する前のチェックリスト

#### 1. 開発環境での認証スキップパターンを実装したか ✅
```typescript
const isDevelopment = process.env.NODE_ENV === 'development'
let user: any = null

if (!isDevelopment) {
  // Production: strict auth required
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user: authUser } } = await supabase.auth.getUser(token)
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  user = authUser
} else {
  // Development: allow guest with mock user
  if (token) {
    const { data: { user: authUser } } = await supabase.auth.getUser(token)
    user = authUser
  }
  if (!user) {
    user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
  }
}
```

#### 2. エラーハンドリング（try-catch）を実装したか ✅
```typescript
try {
  // API logic
  return NextResponse.json({ success: true, data })
} catch (error: any) {
  console.error('[API Name] Error:', error)
  return NextResponse.json(
    { error: error.message || 'Internal server error' },
    { status: 500 }
  )
}
```

#### 3. ログ出力（console.log/error）を実装したか ✅
```typescript
console.log('[Notebook Chat API] Processing message for project:', projectId)
console.log('[Notebook Chat API] Found', documents.length, 'documents')
console.error('[Notebook Chat API] Error fetching documents:', docsError)
```

#### 4. フィルタパラメータをサポートしたか ✅
```typescript
// クエリパラメータを取得
const { searchParams } = new URL(request.url)
const collectionId = searchParams.get('collectionId')

// フィルタを適用
let query = supabase
  .from('documents')
  .select('*')
  .eq('user_id', user.id)

if (collectionId) {
  query = query.eq('collection_id', collectionId)
}
```

#### 5. 型定義が正しいか ✅
```typescript
// インターフェースを定義
interface Document {
  id: string
  title: string
  collection_id?: string
  content?: string
  // ...
}

// レスポンスで使用
return NextResponse.json({ documents: documents as Document[] })
```

---

## 開発環境での認証スキップパターン

### 問題の背景
NotebookLM機能実装時、最初は認証必須として実装してしまった。
しかし、CLAUDE.mdには「開発環境では認証スキップ」と明記されていた。
→ **CLAUDE.mdのルールを守らなかったため発生した問題**

### 正しい実装パターン

#### API Routes
```typescript
export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  let user: any = null

  if (!isDevelopment) {
    // Production: strict auth required
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: { user: authUser } } = await supabase.auth.getUser(token)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    user = authUser
  } else {
    // Development: allow guest with mock user
    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token)
      user = authUser
    }
    if (!user) {
      console.log('[API] Development mode: using mock guest user')
      user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@localhost' }
    }
  }

  // Continue with user object
  const userId = user.id
}
```

#### フロントエンド（React Components）
```typescript
// ゲストチェックを削除
const handleFileUpload = async (file: File) => {
  // ❌ 間違い
  if (isGuest) {
    alert('ログインが必要です')
    return
  }

  // ✅ 正しい（開発環境ではバックエンドが自動でゲスト対応）
  await uploadDocument(authToken || '', file, projectId)
}
```

### なぜこのパターンが重要か
1. **開発速度の向上**: 毎回ログインする手間が不要
2. **機能テストに集中**: 認証フローのテストは後回しでOK
3. **本番環境の安全性**: 本番では厳格な認証を維持

---

## 再発防止のための実装前チェックリスト

新機能を実装する前に、必ず以下を確認すること：

### ステップ1: 既存コードを確認
- [ ] 類似機能の既存実装を読む（例：新しいAPI → `/api/chat`, `/api/documents/upload`）
- [ ] ストアの関数シグネチャを確認（`token`は第1引数か？）
- [ ] 既存のパターンを踏襲する

### ステップ2: CLAUDE.mdを確認
- [ ] 該当セクションを読む（API実装 → 「開発モード時の認証スキップ」）
- [ ] エラー処理のセクションを読む
- [ ] 型定義のセクションを読む

### ステップ3: データベース確認
- [ ] 必要なカラムが全てマイグレーションに含まれているか
- [ ] インデックスは作成されているか
- [ ] RLSポリシーは設定されているか

### ステップ4: 実装
- [ ] 開発環境での認証スキップパターンを実装
- [ ] エラーハンドリング（try-catch）を実装
- [ ] ログ出力を実装
- [ ] 型定義を実装

### ステップ5: テスト
- [ ] ゲストユーザーでテスト
- [ ] 認証ユーザーでテスト
- [ ] エラーケースをテスト
- [ ] ブラウザコンソールでエラーがないか確認
- [ ] サーバーログでエラーがないか確認

---

## このドキュメントの更新ルール

新しい実装ミスを発見した場合：
1. この ドキュメントに追加する
2. 問題の内容、原因、修正方法を明記する
3. 実例のコードを含める
4. 再発防止のチェックリストを更新する

**重要**: このドキュメントは「実装の聖書」として扱い、新機能実装時は必ず確認すること。
