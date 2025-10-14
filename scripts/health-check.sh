#!/bin/bash
# Faro Health Check Script
# 開発環境の状態を素早く確認

echo "🏥 Faro Health Check"
echo "===================="
echo ""

# サーバー確認
echo "🖥️  Development Server:"
if pgrep -f "pnpm dev" > /dev/null 2>&1; then
    echo "   ✅ Running (http://localhost:3000)"
else
    echo "   ❌ Stopped (run: pnpm dev)"
fi
echo ""

# Git状態
echo "📝 Git Status:"
CHANGED=$(git status --short 2>/dev/null | wc -l)
BRANCH=$(git branch --show-current 2>/dev/null)
echo "   Branch: $BRANCH"
echo "   Changed files: $CHANGED"
echo ""

# 依存関係チェック
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
    echo "   ✅ Installed"
else
    echo "   ❌ Missing (run: pnpm install)"
fi
echo ""

# 環境変数チェック
echo "🔧 Environment:"
if [ -f "apps/web/.env.local" ]; then
    echo "   ✅ .env.local configured"

    # 必須キーの存在確認
    if grep -q "SUPABASE_SERVICE_KEY" apps/web/.env.local 2>/dev/null; then
        echo "   ✅ Database configured"
    else
        echo "   ⚠️  Database: Check SUPABASE_SERVICE_KEY"
    fi

    if grep -q "GEMINI_API_KEY" apps/web/.env.local 2>/dev/null; then
        echo "   ✅ AI configured"
    else
        echo "   ⚠️  AI: Check GEMINI_API_KEY"
    fi
else
    echo "   ❌ Missing .env.local"
fi
echo ""

# 最近のコミット
echo "📜 Recent Activity:"
git log -1 --oneline 2>/dev/null || echo "   No commits yet"
echo ""

# 次のアクション
echo "🎯 Next Actions:"
if [ -f "NEXT.md" ]; then
    head -3 NEXT.md 2>/dev/null | sed 's/^/   /'
else
    echo "   No NEXT.md found"
fi
echo ""

# 起動コマンド提示
if ! pgrep -f "pnpm dev" > /dev/null 2>&1; then
    echo "💡 To start: pnpm dev"
fi
