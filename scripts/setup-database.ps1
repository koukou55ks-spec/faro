# Supabase Database Setup Script for Windows PowerShell
# Usage: .\scripts\setup-database.ps1

$ErrorActionPreference = "Continue"

Write-Host "Faro Database Setup Script" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Check Supabase CLI
Write-Host "[1/5] Checking Supabase CLI..." -ForegroundColor Cyan

$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabaseCmd) {
    $supabaseVersion = & supabase --version 2>&1 | Select-Object -First 1
    Write-Host "Supabase CLI found: $supabaseVersion" -ForegroundColor Green
}
else {
    Write-Host "Supabase CLI not found" -ForegroundColor Yellow
    Write-Host "Please install via: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Load environment variables
Write-Host "[2/5] Checking environment variables..." -ForegroundColor Cyan

if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
            return
        }
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host ".env.local loaded successfully" -ForegroundColor Green
}
else {
    Write-Host ".env.local not found" -ForegroundColor Red
    exit 1
}

$SUPABASE_URL = [System.Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "Process")
$SERVICE_KEY = [System.Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_KEY", "Process")

if ([string]::IsNullOrEmpty($SUPABASE_URL)) {
    Write-Host "NEXT_PUBLIC_SUPABASE_URL not set" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($SERVICE_KEY)) {
    Write-Host "SUPABASE_SERVICE_KEY not set" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Link Supabase project
Write-Host "[3/5] Linking Supabase project..." -ForegroundColor Cyan

$PROJECT_ID = $SUPABASE_URL -replace 'https://(.*)\.supabase\.co', '$1'
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Project URL: $SUPABASE_URL" -ForegroundColor Gray

if (Test-Path "supabase\.temp\project-ref") {
    Write-Host "Project already linked" -ForegroundColor Green
}
else {
    Write-Host "Linking to Supabase project..." -ForegroundColor Gray
    $linkResult = & supabase link --project-ref $PROJECT_ID 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Project linked successfully" -ForegroundColor Green
    }
    else {
        Write-Host "Link failed. Please run manually:" -ForegroundColor Yellow
        Write-Host "  supabase link --project-ref $PROJECT_ID" -ForegroundColor Yellow
        Write-Host "Error: $linkResult" -ForegroundColor Gray
        exit 1
    }
}

Write-Host ""

# Step 4: Run migrations
Write-Host "[4/5] Running database migrations..." -ForegroundColor Cyan

$migrationFiles = Get-ChildItem -Path "supabase\migrations\*.sql" -ErrorAction SilentlyContinue
$MIGRATION_COUNT = $migrationFiles.Count

Write-Host "Found $MIGRATION_COUNT migration files" -ForegroundColor Gray

if ($MIGRATION_COUNT -eq 0) {
    Write-Host "No migration files found" -ForegroundColor Yellow
    exit 1
}

Write-Host "Applying migrations..." -ForegroundColor Gray
$pushResult = & supabase db push 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migrations applied successfully" -ForegroundColor Green
}
else {
    Write-Host "Migration failed" -ForegroundColor Red
    Write-Host "Error: $pushResult" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 5: Verify pgvector
Write-Host "[5/5] Verifying pgvector extension..." -ForegroundColor Cyan

$vectorCheckSQL = "SELECT extname FROM pg_extension WHERE extname = 'vector';"
$vectorResult = & supabase db execute --sql $vectorCheckSQL 2>&1

if ($vectorResult -match "vector") {
    Write-Host "pgvector extension enabled" -ForegroundColor Green
}
else {
    Write-Host "Enabling pgvector..." -ForegroundColor Yellow
    $enableVectorSQL = "CREATE EXTENSION IF NOT EXISTS vector;"
    & supabase db execute --sql $enableVectorSQL 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "pgvector extension enabled" -ForegroundColor Green
    }
    else {
        Write-Host "Could not enable pgvector" -ForegroundColor Yellow
    }
}

Write-Host ""

# Complete
Write-Host "======================================" -ForegroundColor Green
Write-Host "Database Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start dev server: pnpm dev" -ForegroundColor White
Write-Host "2. Test API: curl http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Ready to build!" -ForegroundColor Green
