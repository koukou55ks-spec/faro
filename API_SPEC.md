# Faro API仕様書 v3.0

## 目次
- [概要](#概要)
- [認証](#認証)
- [エラーハンドリング](#エラーハンドリング)
- [レート制限](#レート制限)
- [エンドポイント一覧](#エンドポイント一覧)

---

## 概要

**ベースURL**:
- 開発: `http://localhost:3000/api`
- 本番: `https://faro10.vercel.app/api`

**APIバージョン**: `v1`

**データ形式**: JSON

---

## 認証

### ゲストモード
認証不要。`guestId`（クライアント生成UUID）を使用。

### 認証ユーザー
Supabase Authトークンを`Authorization`ヘッダーに含める。

```http
Authorization: Bearer <supabase_jwt_token>
```

---

## エラーハンドリング

全てのエラーレスポンスは以下の形式:

```json
{
  "code": "ERROR_CODE",
  "message": "ユーザーフレンドリーなメッセージ",
  "statusCode": 400,
  "details": {
    "additionalInfo": "..."
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `BAD_REQUEST` | 400 | リクエストが不正 |
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | 権限不足 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `VALIDATION_ERROR` | 422 | バリデーションエラー |
| `RATE_LIMIT_EXCEEDED` | 429 | レート制限超過 |
| `INTERNAL_SERVER_ERROR` | 500 | サーバーエラー |
| `DATABASE_ERROR` | 500 | DB接続エラー |
| `EXTERNAL_API_ERROR` | 502 | 外部API（Gemini等）エラー |

---

## レート制限

### ゲストユーザー
- **制限**: 50回 / 日
- **識別**: `guestId`

### 認証ユーザー
- **無料プラン**: 200回 / 日
- **Proプラン**: 10,000回 / 日

### レスポンスヘッダー
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-10-27T00:00:00Z
```

---

## エンドポイント一覧

### 1. チャット API

#### `POST /api/v1/chat/guest`
**ゲストユーザー向けチャット**

**リクエスト**
```json
{
  "message": "103万円の壁について教えて",
  "guestId": "guest_12345_abcde",
  "conversationHistory": [
    {
      "role": "user",
      "content": "前回のメッセージ"
    },
    {
      "role": "assistant",
      "content": "前回の回答"
    }
  ]
}
```

**レスポンス（成功）**
```json
{
  "success": true,
  "message": "103万円の壁とは...",
  "timestamp": "2025-10-26T10:00:00Z",
  "usage": {
    "current": 5,
    "limit": 50,
    "remaining": 45,
    "reset": "2025-10-27T00:00:00Z",
    "plan": "guest"
  }
}
```

**レスポンス（レート制限超過）**
```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "利用制限に達しました。しばらく待ってから再度お試しください",
  "statusCode": 429,
  "details": {
    "limit": 50,
    "remaining": 0,
    "reset": "2025-10-27T00:00:00Z"
  }
}
```

---

#### `POST /api/v1/chat`
**認証ユーザー向けチャット（RAG統合）**

**ヘッダー**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**リクエスト**
```json
{
  "message": "今年の確定申告のポイントは？",
  "conversationId": "conv_123", // オプション
  "stream": true // ストリーミングレスポンス
}
```

**レスポンス（非ストリーム）**
```json
{
  "success": true,
  "conversationId": "conv_123",
  "data": {
    "userMessage": {
      "id": "msg_456",
      "content": "今年の確定申告のポイントは？",
      "timestamp": "2025-10-26T10:00:00Z"
    },
    "assistantMessage": {
      "id": "msg_457",
      "content": "あなたの年収600万円、既婚...",
      "timestamp": "2025-10-26T10:00:05Z",
      "sources": [
        {
          "type": "user_profile",
          "data": "年収600万円、既婚"
        },
        {
          "type": "library_article",
          "title": "確定申告ガイド2025",
          "url": "/library/123"
        }
      ]
    }
  },
  "usage": {
    "current": 25,
    "limit": 200,
    "remaining": 175,
    "plan": "free"
  }
}
```

**レスポンス（ストリーム）**
```
data: {"content": "あなた"}
data: {"content": "の"}
data: {"content": "年収"}
...
data: [DONE]
```

---

### 2. プロフィール API

#### `GET /api/profile`
**ユーザープロフィール取得**

**レスポンス**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "age": 30,
    "occupation": "エンジニア",
    "employmentType": "full_time",
    "annualIncome": 6000000,
    "maritalStatus": "single",
    "numChildren": 0,
    "interests": ["投資", "節税"],
    "hasMortgage": false,
    "hasSavings": true,
    "hasInvestments": true
  }
}
```

#### `PATCH /api/profile`
**プロフィール更新**

**リクエスト**
```json
{
  "age": 31,
  "annualIncome": 6500000,
  "interests": ["投資", "節税", "不動産"]
}
```

---

### 3. ライブラリ API

#### `GET /api/library`
**記事一覧取得**

**クエリパラメータ**
- `category`: カテゴリID（オプション）
- `search`: 検索キーワード（オプション）
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article_123",
        "title": "103万円の壁を徹底解説",
        "category": "税金",
        "difficulty": "beginner",
        "readTime": 5,
        "views": 1250,
        "createdAt": "2025-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

#### `GET /api/library/:id`
**記事詳細取得**

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "article_123",
    "title": "103万円の壁を徹底解説",
    "content": "# 103万円の壁とは...",
    "category": "税金",
    "tags": ["扶養控除", "学生", "アルバイト"],
    "difficulty": "beginner",
    "readTime": 5,
    "author": "Faro AI",
    "createdAt": "2025-01-15T00:00:00Z",
    "updatedAt": "2025-01-20T00:00:00Z"
  }
}
```

---

### 4. カスタムタブ API

#### `POST /api/custom-tabs`
**カスタムタブ作成**

**リクエスト**
```json
{
  "name": "ふるさと納税メモ",
  "description": "2025年のふるさと納税管理",
  "icon": "📋"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "tab_123",
    "name": "ふるさと納税メモ",
    "description": "2025年のふるさと納税管理",
    "icon": "📋",
    "createdAt": "2025-10-26T10:00:00Z"
  }
}
```

---

### 5. ヘルスチェック

#### `GET /api/health`
**システムヘルスチェック**

**レスポンス**
```json
{
  "status": "ok",
  "version": "3.0.0",
  "timestamp": "2025-10-26T10:00:00Z",
  "services": {
    "database": "ok",
    "gemini": "ok",
    "redis": "ok"
  }
}
```

---

## Webhooks

### Stripe Webhook

#### `POST /api/stripe/webhook`
**Stripeイベント受信**

**イベントタイプ**
- `checkout.session.completed`: 決済完了
- `customer.subscription.updated`: サブスク更新
- `customer.subscription.deleted`: サブスク解約

---

## バージョニング

APIバージョンはURLパスに含まれます:
- `/api/v1/...`: 現在の安定版
- `/api/v2/...`: 将来のバージョン（Breaking Changes時）

### 非推奨ポリシー
- 新バージョンリリース後、旧バージョンは6ヶ月間サポート
- 非推奨の警告は`X-API-Deprecated`ヘッダーで通知

---

## レスポンスタイム目標

| エンドポイント | P50 | P95 | P99 |
|---------------|-----|-----|-----|
| `/chat/guest` | 1.5s | 3s | 5s |
| `/chat` | 2s | 4s | 6s |
| `/library` | 200ms | 500ms | 1s |
| `/profile` | 100ms | 300ms | 500ms |

---

## セキュリティ

### CORS
許可されたオリジン:
- `https://faro10.vercel.app`
- `http://localhost:3000` (開発環境のみ)

### CSP
Content Security Policyが有効です。

### SSL/TLS
全てのAPI通信はHTTPS必須（本番環境）

---

## サポート

質問・不具合報告: https://github.com/anthropics/claude-code/issues
