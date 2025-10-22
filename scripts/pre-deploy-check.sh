#!/bin/bash

# デプロイ前チェックスクリプト
# 使い方: bash scripts/pre-deploy-check.sh

set -e  # エラーが発生したら即座に終了

echo "========================================="
echo "デプロイ前チェック開始"
echo "========================================="

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# チェック関数
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1 成功${NC}"
  else
    echo -e "${RED}✗ $1 失敗${NC}"
    exit 1
  fi
}

# 1. TypeScript型チェック
echo ""
echo "1. TypeScript型チェック実行中..."
pnpm type-check
check "TypeScript型チェック"

# 2. Lintチェック
echo ""
echo "2. Lint チェック実行中..."
pnpm lint
check "Lint"

# 3. ビルドチェック
echo ""
echo "3. ビルドチェック実行中..."
pnpm build
check "ビルド"

# 4. 環境変数チェック
echo ""
echo "4. 環境変数チェック中..."
if [ -f "apps/web/.env.local" ]; then
  echo -e "${GREEN}✓ .env.local 存在確認${NC}"

  # 必須環境変数のチェック
  required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_KEY"
    "GEMINI_API_KEY"
  )

  for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" apps/web/.env.local; then
      echo -e "${GREEN}  ✓ ${var}${NC}"
    else
      echo -e "${RED}  ✗ ${var} が設定されていません${NC}"
      exit 1
    fi
  done
else
  echo -e "${RED}✗ .env.local が存在しません${NC}"
  exit 1
fi

# 5. Git状態確認
echo ""
echo "5. Git状態確認中..."
if git diff --quiet; then
  echo -e "${GREEN}✓ 未コミットの変更なし${NC}"
else
  echo -e "${YELLOW}⚠ 未コミットの変更があります${NC}"
  git status --short
fi

# 6. 現在のブランチ確認
current_branch=$(git branch --show-current)
echo ""
echo "現在のブランチ: ${YELLOW}${current_branch}${NC}"

if [ "$current_branch" = "master" ] || [ "$current_branch" = "main" ]; then
  echo -e "${YELLOW}⚠ masterブランチです。本当にデプロイしますか？${NC}"
fi

# 7. 最新タグ確認
latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "タグなし")
echo "最新タグ: ${YELLOW}${latest_tag}${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}全チェック完了！デプロイ可能です${NC}"
echo "========================================="
echo ""
echo "次のステップ:"
echo "1. 安定版タグを作成:"
echo "   git tag -a v1.0.1 -m '説明'"
echo "   git push origin v1.0.1"
echo ""
echo "2. デプロイ:"
echo "   git push origin ${current_branch}"
echo ""
