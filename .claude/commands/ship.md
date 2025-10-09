---
description: 本番環境にデプロイ（型チェック→ビルド→Git→Vercel）
---

# 本番デプロイ実行

以下の手順を順番に実行してください:

## 1. コード品質チェック
```bash
cd frontend
npm run type-check
npm run lint
```

エラーがあれば修正してください。

## 2. ビルド確認
```bash
npm run build
```

ビルドエラーがあれば修正してください。

## 3. Git commit & push
```bash
cd ..
git add .
git commit -m "chore: Deploy to production

🚀 Generated with Claude Code
"
git push
```

## 4. Vercel本番デプロイ
```bash
cd frontend
vercel --prod
```

デプロイURLを表示してください。

## 5. 完了報告
- デプロイURL
- 変更されたファイル数
- 所要時間

を報告してください。
