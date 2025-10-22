# デプロイ前チェックスクリプト (PowerShell版)
# 使い方: powershell -ExecutionPolicy Bypass -File scripts\pre-deploy-check.ps1

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "デプロイ前チェック開始" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Check-Success {
    param($message)
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $message 成功" -ForegroundColor Green
    } else {
        Write-Host "✗ $message 失敗" -ForegroundColor Red
        exit 1
    }
}

# 1. TypeScript型チェック
Write-Host "`n1. TypeScript型チェック実行中..." -ForegroundColor Yellow
pnpm type-check
Check-Success "TypeScript型チェック"

# 2. Lintチェック
Write-Host "`n2. Lint チェック実行中..." -ForegroundColor Yellow
pnpm lint
Check-Success "Lint"

# 3. ビルドチェック
Write-Host "`n3. ビルドチェック実行中..." -ForegroundColor Yellow
pnpm build
Check-Success "ビルド"

# 4. 環境変数チェック
Write-Host "`n4. 環境変数チェック中..." -ForegroundColor Yellow
$envFile = "apps\web\.env.local"
if (Test-Path $envFile) {
    Write-Host "✓ .env.local 存在確認" -ForegroundColor Green

    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_KEY",
        "GEMINI_API_KEY"
    )

    $content = Get-Content $envFile
    foreach ($var in $requiredVars) {
        if ($content -match "^$var=") {
            Write-Host "  ✓ $var" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $var が設定されていません" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "✗ .env.local が存在しません" -ForegroundColor Red
    exit 1
}

# 5. Git状態確認
Write-Host "`n5. Git状態確認中..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "⚠ 未コミットの変更があります" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "✓ 未コミットの変更なし" -ForegroundColor Green
}

# 6. 現在のブランチ確認
$currentBranch = git branch --show-current
Write-Host "`n現在のブランチ: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
    Write-Host "⚠ masterブランチです。本当にデプロイしますか？" -ForegroundColor Yellow
}

# 7. 最新タグ確認
try {
    $latestTag = git describe --tags --abbrev=0 2>&1
} catch {
    $latestTag = "タグなし"
}
Write-Host "最新タグ: $latestTag" -ForegroundColor Yellow

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "全チェック完了！デプロイ可能です" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`n次のステップ:"
Write-Host "1. 安定版タグを作成:"
Write-Host "   git tag -a v1.0.1 -m '説明'"
Write-Host "   git push origin v1.0.1"
Write-Host "`n2. デプロイ:"
Write-Host "   git push origin $currentBranch"
Write-Host ""
