# Uptime Monitoring Setup Guide

## 目的
- サービスのダウンタイムを即座に検知
- 99.9% SLA達成のための監視
- パフォーマンス低下の早期発見

---

## 推奨ツール: UptimeRobot (無料)

### 選定理由
- ✅ 無料で50モニター
- ✅ 5分間隔で監視
- ✅ Email/SMS/Slack通知
- ✅ パブリックステータスページ作成可能
- ✅ APIアクセス可能

### 代替案
- **Better Uptime** (有料, チーム向け)
- **Pingdom** (有料, 詳細分析)
- **Vercel Monitoring** (Vercel Pro)

---

## UptimeRobotセットアップ手順

### 1. アカウント作成
1. [UptimeRobot](https://uptimerobot.com/) にアクセス
2. 無料アカウント登録
3. Email確認

### 2. モニター追加

#### 2.1 メインアプリ (https://taxhack.vercel.app/)
```
Monitor Type: HTTP(s)
Friendly Name: Faro - Main App
URL: https://taxhack.vercel.app/
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

#### 2.2 APIエンドポイント (Health Check)
```
Monitor Type: HTTP(s)
Friendly Name: Faro - API Health
URL: https://taxhack.vercel.app/api/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

#### 2.3 認証エンドポイント
```
Monitor Type: HTTP(s)
Friendly Name: Faro - Auth API
URL: https://taxhack.vercel.app/api/auth/signin
Monitoring Interval: 10 minutes
```

#### 2.4 Supabase接続
```
Monitor Type: HTTP(s)
Friendly Name: Faro - Database Connection
URL: https://taxhack.vercel.app/api/health?check=db
Monitoring Interval: 5 minutes
```

---

## 3. Health Check API実装

### 3.1 APIルート作成

**ファイル**: `apps/web/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const check = searchParams.get('check')

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    checks: {} as Record<string, { status: string; latency?: number }>
  }

  // Database check
  if (check === 'db' || check === 'all') {
    const dbStart = Date.now()
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.from('profiles').select('id').limit(1)

      if (error) throw error

      health.checks.database = {
        status: 'ok',
        latency: Date.now() - dbStart
      }
    } catch (error) {
      health.status = 'degraded'
      health.checks.database = {
        status: 'error',
        latency: Date.now() - dbStart
      }
    }
  }

  // Gemini API check
  if (check === 'ai' || check === 'all') {
    const aiStart = Date.now()
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY,
        { method: 'GET' }
      )

      if (!response.ok) throw new Error('Gemini API unavailable')

      health.checks.ai = {
        status: 'ok',
        latency: Date.now() - aiStart
      }
    } catch (error) {
      health.status = 'degraded'
      health.checks.ai = {
        status: 'error',
        latency: Date.now() - aiStart
      }
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
```

### 3.2 実装後の確認
```bash
# ローカルテスト
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health?check=db
curl http://localhost:3000/api/health?check=all

# 本番テスト
curl https://taxhack.vercel.app/api/health
```

---

## 4. アラート設定

### 4.1 通知先設定
1. UptimeRobot Dashboard > My Settings > Alert Contacts
2. Email追加（創業者のメールアドレス）
3. Slack Webhook追加（オプション）

### 4.2 アラートルール
```
Down Event: サイトがダウンした時
Up Event: サイトが復旧した時
Still Down Reminder: 1時間ごと
```

### 4.3 Slack通知（推奨）
```bash
# Slack Incoming Webhook URL取得
1. Slack Workspace > Apps > Incoming Webhooks
2. Webhook URL生成
3. UptimeRobot に URL追加
```

---

## 5. ステータスページ作成

### 5.1 パブリックステータスページ
1. UptimeRobot Dashboard > Public Status Pages
2. 新しいステータスページ作成
3. カスタムドメイン: `status.faro.app` (将来)
4. URLシェア: チームや投資家向け

### 5.2 表示内容
- ✅ 現在のステータス
- ✅ 過去30日の稼働率
- ✅ 過去のダウンタイム履歴
- ✅ レスポンスタイムグラフ

---

## 6. パフォーマンス監視

### 6.1 レスポンスタイムアラート
```
Alert if response time > 3秒
Check interval: 5分
```

### 6.2 目標値
- ✅ Uptime: 99.9% (月43分まで許容)
- ✅ レスポンスタイム: < 2秒 (p95)
- ✅ エラー率: < 0.1%

---

## 7. インシデント対応

### ダウン時の対応フロー
1. **即座**: UptimeRobotからアラート受信
2. **確認**: Vercel Dashboard でログ確認
3. **通知**: ユーザーにTwitter/Status Pageで通知
4. **復旧**: 問題特定・修正・デプロイ
5. **事後**: Incident Report作成

### エスカレーションルール
- 5分以内に復旧しない → Vercel Supportに連絡
- データ損失の可能性 → Supabase Supportに連絡
- セキュリティ問題 → 全サービス停止

---

## 8. コスト

| サービス | 料金 | 機能 |
|---------|------|------|
| UptimeRobot (Free) | $0 | 50モニター, 5分間隔 |
| UptimeRobot (Pro) | $7/月 | 1分間隔, SMS通知 |
| Better Uptime | $18/月 | インシデント管理 |
| Pingdom | $13/月 | 詳細分析 |

### 推奨:
- **現在**: UptimeRobot無料プラン
- **100ユーザー達成後**: UptimeRobot Pro ($7/月)
- **1,000ユーザー達成後**: Better Uptime ($18/月)

---

## 9. 実装チェックリスト

- [ ] Health Check API実装 (`/api/health`)
- [ ] UptimeRobot アカウント作成
- [ ] メインアプリ監視追加
- [ ] API Health Check監視追加
- [ ] Email通知設定
- [ ] Slack通知設定（オプション）
- [ ] ステータスページ作成
- [ ] レスポンスタイムアラート設定
- [ ] インシデント対応フロー文書化
- [ ] 初回ダウンテストの実施

---

## 10. 次のステップ

### 今すぐ実施
1. Health Check API実装
2. UptimeRobotアカウント作成
3. 基本モニター設定

### 100ユーザー達成後
1. UptimeRobot Pro にアップグレード
2. SMS通知追加
3. より詳細なパフォーマンス監視

### 1,000ユーザー達成後
1. Better Uptime 移行検討
2. インシデント管理フロー強化
3. オンコールローテーション設定（チーム拡大時）

---

## 参考リンク

- [UptimeRobot Documentation](https://uptimerobot.com/api/)
- [Vercel Monitoring](https://vercel.com/docs/monitoring)
- [Better Uptime](https://betteruptime.com/)
- [SLA Calculator](https://uptime.is/)

---

**最終更新**: 2025-10-14
**作成者**: Claude (AI Assistant)
