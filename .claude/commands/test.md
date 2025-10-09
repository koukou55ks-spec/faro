---
description: テスト実行とカバレッジ確認
---

# テスト実行

以下を実行してください:

## 1. 既存テストの確認
```bash
ls tests/
```

## 2. テスト実行
```bash
# Pythonテスト（バックエンド）
pytest tests/ -v

# Next.jsテスト（フロントエンド）
cd frontend
npm test
```

## 3. テストが失敗した場合
- エラー内容を分析
- 修正案を提示
- 修正を実施
- 再テスト

## 4. テストが存在しない場合
主要な機能（Chat API, Auth, Notes）のテストを作成してください:

```typescript
// frontend/__tests__/api/chat.test.ts
// frontend/__tests__/auth/login.test.ts
// frontend/__tests__/components/ChatPanel.test.tsx
```

## 5. カバレッジレポート
- テストカバレッジを表示
- 80%未満の場合は不足箇所を指摘
