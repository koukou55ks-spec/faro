# 本番環境セキュリティチェックリスト

Faro本番デプロイ前の必須セキュリティ確認項目

## 📋 デプロイ前チェックリスト

### 1. 環境変数・APIキー管理

- [ ] `.env.local` がGitにコミットされていない（`.gitignore`で除外）
- [ ] 本番用Stripe APIキーを使用（`sk_live_`, `pk_live_`）
- [ ] テストキー（`sk_test_`, `pk_test_`）を本番環境で使用していない
- [ ] すべての環境変数がVercel環境変数に設定されている（Production環境）
- [ ] Supabase Service Key (`SUPABASE_SERVICE_KEY`) がサーバーサイドのみで使用
- [ ] Gemini API Key (`GEMINI_API_KEY`) がサーバーサイドのみで使用
- [ ] `NEXT_PUBLIC_` プレフィックスの付いた変数のみクライアントに公開

### 2. Stripe セキュリティ

- [ ] Webhook署名検証が有効（`STRIPE_WEBHOOK_SECRET`設定済み）
- [ ] Webhook URLがHTTPS（`https://yourdomain.vercel.app/api/stripe/webhook`）
- [ ] Webhook エンドポイントで署名検証エラーが400を返す
- [ ] 本番モードでStripe Dashboardを使用
- [ ] Price IDが本番環境用（`NEXT_PUBLIC_STRIPE_PRICE_ID`）
- [ ] Stripe APIバージョンが最新（`2025-09-30.clover`以降）

### 3. Supabase セキュリティ

- [ ] Row-Level Security (RLS) が**全テーブル**で有効
  - `subscriptions` テーブル
  - `usage_limits` テーブル
  - `conversations` テーブル
  - `messages` テーブル
  - `profiles` テーブル
- [ ] RLSポリシーが正しく設定されている
  - ユーザーは自分のデータのみアクセス可能
  - サービスロールキーのみが全データにアクセス可能
- [ ] Anon Key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）は公開用
- [ ] Service Key（`SUPABASE_SERVICE_KEY`）はサーバーサイドのみで使用

### 4. HTTPS・通信セキュリティ

- [ ] すべてのAPI通信がHTTPSで行われる
- [ ] HTTPからHTTPSへの自動リダイレクトが有効（Vercel デフォルト）
- [ ] HSTSヘッダーが設定されている（Vercel デフォルト）
- [ ] CORSが適切に設定されている（許可ドメインのみ）

### 5. フロントエンドセキュリティ

- [ ] ブラウザコンソールにAPIキーが表示されていない
- [ ] `NEXT_PUBLIC_` プレフィックスのない環境変数がクライアントに漏れていない
- [ ] XSS対策（`dangerouslySetInnerHTML` 使用していない）
- [ ] CSRF対策（SameSite Cookie設定）
- [ ] 入力値のサニタイゼーション

### 6. 認証・認可

- [ ] Supabase Authが正しく設定されている
- [ ] JWTトークンの検証が適切に行われている
- [ ] 未認証ユーザーは保護されたルートにアクセスできない
- [ ] セッション管理が適切（タイムアウト設定）

### 7. レート制限

- [ ] Upstash Redisが本番環境で設定されている
- [ ] API エンドポイントにレート制限が実装されている
- [ ] 無料ユーザーの使用量制限が正しく動作
  - AIメッセージ: 月30回
  - ドキュメント: 月5個

### 8. エラー処理・ログ

- [ ] エラーメッセージにAPIキーや機密情報が含まれていない
- [ ] 本番環境でスタックトレースが公開されていない
- [ ] エラーログが適切に記録されている（Sentry/Axiom）
- [ ] 404/500エラーページが適切に実装されている

### 9. データベースセキュリティ

- [ ] SQLインジェクション対策（Prepared Statements使用）
- [ ] 機密データの暗号化（パスワード、トークン）
- [ ] データベースバックアップが設定されている（Supabase自動バックアップ）
- [ ] 不要なデータが削除されている（テストデータ等）

### 10. コードセキュリティ

- [ ] 依存パッケージのセキュリティ脆弱性チェック（`pnpm audit`）
- [ ] ハードコードされたAPIキー・パスワードが存在しない
- [ ] `.gitignore` に機密ファイルが含まれている
- [ ] コミット履歴にAPIキーが含まれていない

---

## 🔍 セキュリティスキャンコマンド

### 1. 依存パッケージの脆弱性チェック

```bash
pnpm audit
pnpm audit --fix  # 自動修正
```

### 2. APIキー漏洩チェック

```bash
# Gitコミット履歴から機密情報を検索
git log --all --full-history --source --pickaxe-all -S 'sk_live'
git log --all --full-history --source --pickaxe-all -S 'sk_test'
git log --all --full-history --source --pickaxe-all -S 'whsec_'
```

### 3. 環境変数漏洩チェック

```bash
# コードベース全体で環境変数の誤使用を検索
grep -r "sk_live" apps/web/
grep -r "sk_test" apps/web/
grep -r "SUPABASE_SERVICE_KEY" apps/web/src/  # クライアントコードに含まれてはいけない
```

### 4. .gitignoreチェック

```bash
# .env.local がGitで追跡されていないか確認
git status | grep ".env.local"  # 何も表示されなければOK
```

---

## 🚨 緊急時の対応

### APIキーが漏洩した場合

1. **即座にAPIキーを無効化**
   - Stripe Dashboard → API Keys → キーを削除
   - Supabase Dashboard → Settings → API → キーを再生成

2. **新しいAPIキーを生成**
   - 新しいキーを取得
   - Vercel環境変数を更新
   - 再デプロイ

3. **Gitコミット履歴から削除**（高度）
   ```bash
   # 専門家に相談してから実行
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.local' \
     --prune-empty --tag-name-filter cat -- --all
   ```

### 不正アクセスを検知した場合

1. **Stripe Dashboardで異常な取引を確認**
2. **Supabase Dashboard → Auth → Usersで不正なアカウントを確認**
3. **Vercel → Logsでアクセスログを確認**
4. **必要に応じてサービス一時停止**

---

## ✅ 確認完了後のアクション

すべてのチェックが完了したら：

1. [ ] このチェックリストをチーム（または自分）と共有
2. [ ] Vercelにデプロイ
3. [ ] デプロイ後に再度セキュリティ確認
4. [ ] 監視ダッシュボードをセットアップ（Sentry/Axiom）
5. [ ] インシデント対応計画を準備

---

## 📚 参考リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#security)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Security](https://vercel.com/docs/security)

---

**セキュリティは継続的なプロセスです。定期的にこのチェックリストを見直してください。**
