#!/bin/bash

# ============================================
# Supabase Database Setup Script
# ============================================
#
# このスクリプトは以下を実行します:
# 1. Supabase CLIのインストール確認
# 2. Supabase認証
# 3. データベースマイグレーション実行
# 4. pgvectorエクステンション有効化
# 5. セットアップ検証
#
# 使い方:
#   chmod +x scripts/setup-database.sh
#   ./scripts/setup-database.sh
#
# ============================================

set -e  # エラー時に即座に終了

echo "🚀 Faro Database Setup Script"
echo "======================================"
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 1. Supabase CLI インストール確認
# ============================================
echo -e "${BLUE}[1/5]${NC} Checking Supabase CLI..."

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"

    # OS判定
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install supabase/tap/supabase
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    else
        echo -e "${RED}❌ Unsupported OS. Please install Supabase CLI manually:${NC}"
        echo "   https://supabase.com/docs/guides/cli"
        exit 1
    fi

    echo -e "${GREEN}✅ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Supabase CLI found ($(supabase --version))${NC}"
fi

echo ""

# ============================================
# 2. 環境変数確認
# ============================================
echo -e "${BLUE}[2/5]${NC} Checking environment variables..."

if [ -f ".env.local" ]; then
    source .env.local
    echo -e "${GREEN}✅ .env.local loaded${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "   Please create .env.local from .env.local.example"
    echo "   cp .env.local.example .env.local"
    exit 1
fi

# Supabase URL確認
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

# Service Key確認
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_KEY not set${NC}"
    exit 1
fi

echo ""

# ============================================
# 3. Supabase プロジェクトリンク
# ============================================
echo -e "${BLUE}[3/5]${NC} Linking Supabase project..."

# プロジェクトID抽出（URLから）
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "   Project ID: $PROJECT_ID"
echo "   Project URL: $NEXT_PUBLIC_SUPABASE_URL"

# 既にリンクされているか確認
if [ -f "supabase/.temp/project-ref" ]; then
    echo -e "${GREEN}✅ Project already linked${NC}"
else
    # プロジェクトリンク
    supabase link --project-ref $PROJECT_ID || {
        echo -e "${YELLOW}⚠️  Auto-link failed. Please run manually:${NC}"
        echo "   supabase link --project-ref $PROJECT_ID"
        exit 1
    }
    echo -e "${GREEN}✅ Project linked${NC}"
fi

echo ""

# ============================================
# 4. データベースマイグレーション実行
# ============================================
echo -e "${BLUE}[4/5]${NC} Running database migrations..."

# マイグレーションファイル確認
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "   Found $MIGRATION_COUNT migration files"

if [ $MIGRATION_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No migration files found${NC}"
    exit 1
fi

# マイグレーション実行
supabase db push || {
    echo -e "${RED}❌ Migration failed${NC}"
    echo "   Please check:"
    echo "   1. Supabase service key is correct"
    echo "   2. Database is accessible"
    echo "   3. Migration SQL syntax is valid"
    exit 1
}

echo -e "${GREEN}✅ Migrations applied successfully${NC}"

echo ""

# ============================================
# 5. pgvector エクステンション確認
# ============================================
echo -e "${BLUE}[5/5]${NC} Verifying pgvector extension..."

# pgvector有効化確認（SQL実行）
supabase db execute --sql "SELECT extname FROM pg_extension WHERE extname = 'vector';" | grep -q "vector" && {
    echo -e "${GREEN}✅ pgvector extension enabled${NC}"
} || {
    echo -e "${YELLOW}⚠️  pgvector not enabled. Enabling now...${NC}"
    supabase db execute --sql "CREATE EXTENSION IF NOT EXISTS vector;"
    echo -e "${GREEN}✅ pgvector extension enabled${NC}"
}

echo ""

# ============================================
# セットアップ完了
# ============================================
echo -e "${GREEN}======================================"
echo "✅ Database Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify tables:"
echo "   supabase db remote inspect"
echo ""
echo "2. Start development server:"
echo "   pnpm dev"
echo ""
echo "3. Test API endpoints:"
echo "   curl http://localhost:3000/api/health"
echo ""

# データベース統計表示
echo "Database Statistics:"
supabase db execute --sql "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
" 2>/dev/null || echo "   (Statistics unavailable)"

echo ""
echo "🎉 You're ready to build!"
