# Faro セキュリティガイド

## セキュリティ原則

1. **Privacy First**: ユーザーデータのプライバシーを最優先
2. **Defense in Depth**: 多層防御戦略
3. **Zero Trust**: すべてのリクエストを検証
4. **Least Privilege**: 最小権限の原則

## 実装済みセキュリティ機能

### 1. 認証・認可

- **Supabase Auth**: 安全な認証フロー
- **Row-Level Security (RLS)**: データベースレベルのアクセス制御
- **JWT Tokens**: セキュアなセッション管理

### 2. レート制限

Upstash Redisによる3段階のレート制限：

```typescript
// API全般: 100 requests / 10秒
ratelimit.api

// AIチャット: 20 messages / 分
ratelimit.chat

// 認証: 5 attempts / 分
ratelimit.auth
```

### 3. Content Security Policy (CSP)

厳格なCSPヘッダーで以下を防止：
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME type sniffing
- Code injection

### 4. HTTPセキュリティヘッダー

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5. 暗号化

- **転送時**: HTTPS強制（Vercel標準）
- **保存時**: Supabase Vaultで機密データ暗号化
- **APIキー**: 環境変数 + Vault管理

### 6. 監査ログ

すべての重要操作をAxiomで記録：
- ユーザー認証イベント
- データベース変更
- AI API呼び出し
- エラーとセキュリティイベント

## セキュリティベストプラクティス

### 環境変数管理

```bash
# ❌ 悪い例
git add .env

# ✅ 良い例
cp .env.example .env
# .envは.gitignoreに含まれる
```

### APIキーローテーション

1. 新しいAPIキーを生成
2. 環境変数を更新
3. デプロイ後、古いキーを無効化

### データベースアクセス

```sql
-- ✅ RLSポリシー例
CREATE POLICY "Users can only view their own data"
ON transactions FOR SELECT
USING (auth.uid() = user_id);
```

### 入力検証

```typescript
import { z } from 'zod'

// ✅ Zodでスキーマバリデーション
const TransactionSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  date: z.date(),
})
```

## セキュリティチェックリスト

### 開発時

- [ ] `.env`ファイルをコミットしていない
- [ ] APIキーをコードにハードコードしていない
- [ ] すべてのユーザー入力を検証している
- [ ] SQLインジェクション対策済み（Supabase ORMを使用）
- [ ] XSS対策済み（Reactの自動エスケープ）

### デプロイ前

- [ ] すべてのシークレットが環境変数として設定されている
- [ ] HTTPS強制が有効
- [ ] セキュリティヘッダーが設定されている
- [ ] レート制限が適切に設定されている
- [ ] RLSポリシーが適用されている

### 定期的なチェック

- [ ] 依存関係の脆弱性スキャン（週次）
- [ ] ログの監視（毎日）
- [ ] APIキーのローテーション（四半期ごと）
- [ ] セキュリティ監査（年次）

## インシデント対応

### セキュリティインシデント発生時

1. **即座の対応**: 影響を受けるサービスを隔離
2. **ログ調査**: Axiom/Sentryでインシデントの範囲を特定
3. **影響範囲の特定**: 影響を受けるユーザーを特定
4. **修復**: 脆弱性を修正
5. **通知**: 必要に応じてユーザーに通知
6. **事後分析**: インシデントレポート作成

### 報告先

セキュリティ問題を発見した場合：
- セキュリティチームに連絡: security@faro.example.com
- または GitHub Security Advisoriesを使用

## コンプライアンス

### GDPR対応

- ユーザーデータの削除リクエスト対応
- データポータビリティ
- 同意管理

### 金融規制対応（将来）

- PCI DSS準拠（決済機能追加時）
- SOC 2準拠（エンタープライズ展開時）

## 参考リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Supabase Security](https://supabase.com/docs/guides/database/security)
