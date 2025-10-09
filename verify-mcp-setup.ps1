# Claude Desktop MCP Setup Verification Script
# PowerShell version

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Claude Desktop MCP Setup Verification" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "OK: Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check npm
Write-Host "[2/5] Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "OK: npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check installed MCP servers
Write-Host "[3/5] Checking installed MCP servers..." -ForegroundColor Yellow
$expectedServers = @(
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-postgres",
    "@notionhq/notion-mcp-server",
    "@modelcontextprotocol/server-puppeteer",
    "@modelcontextprotocol/server-memory",
    "@modelcontextprotocol/server-brave-search",
    "@modelcontextprotocol/server-google-maps",
    "@upstash/context7-mcp"
)

$installedServers = npm list -g --depth=0 2>$null | Select-String -Pattern "mcp|notion"

foreach ($server in $expectedServers) {
    if ($installedServers -match [regex]::Escape($server)) {
        Write-Host "  OK: $server" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $server" -ForegroundColor Red
    }
}
Write-Host ""

# Check configuration file
Write-Host "[4/5] Checking configuration file..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "OK: Configuration file exists" -ForegroundColor Green
    Write-Host "Location: $configPath" -ForegroundColor Gray

    # Check for placeholder API keys
    $configContent = Get-Content $configPath -Raw
    if ($configContent -match "<YOUR_.*_HERE>") {
        Write-Host "WARNING: Configuration contains placeholder API keys!" -ForegroundColor Yellow
        Write-Host "Please replace <YOUR_*_HERE> with actual API keys" -ForegroundColor Yellow
    } else {
        Write-Host "OK: No placeholder values detected" -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: Configuration file not found!" -ForegroundColor Red
    Write-Host "Expected location: $configPath" -ForegroundColor Gray
}
Write-Host ""

# Check Claude Desktop installation
Write-Host "[5/5] Checking Claude Desktop installation..." -ForegroundColor Yellow
$claudeDesktopPaths = @(
    "$env:LOCALAPPDATA\Programs\claude-desktop\Claude.exe",
    "$env:PROGRAMFILES\Claude\Claude.exe"
)

$claudeFound = $false
foreach ($path in $claudeDesktopPaths) {
    if (Test-Path $path) {
        Write-Host "OK: Claude Desktop found at $path" -ForegroundColor Green
        $claudeFound = $true
        break
    }
}

if (-not $claudeFound) {
    Write-Host "WARNING: Claude Desktop not found" -ForegroundColor Yellow
    Write-Host "Download from: https://claude.ai/download" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Verification Complete" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Install Claude Desktop from https://claude.ai/download" -ForegroundColor White
Write-Host "2. Edit the config file and add your API keys:" -ForegroundColor White
Write-Host "   $configPath" -ForegroundColor Gray
Write-Host "3. Restart Claude Desktop" -ForegroundColor White
Write-Host "4. Test the MCP servers in Claude Desktop" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  MCP_SETUP_GUIDE.md       - Complete setup guide" -ForegroundColor Gray
Write-Host "  MCP_QUICK_REFERENCE.md   - Quick command reference" -ForegroundColor Gray
Write-Host ""

# API Keys reminder
Write-Host "Required API Keys:" -ForegroundColor Yellow
Write-Host "  GitHub:      https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host "  Supabase:    Your Supabase Dashboard > Settings > Database" -ForegroundColor Gray
Write-Host "  Notion:      https://www.notion.so/my-integrations" -ForegroundColor Gray
Write-Host "  Brave:       https://brave.com/search/api/" -ForegroundColor Gray
Write-Host "  Google Maps: https://console.cloud.google.com/" -ForegroundColor Gray
Write-Host "  Upstash:     https://upstash.com/" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
