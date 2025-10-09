@echo off
echo ======================================
echo MCP Configuration Verification
echo ======================================
echo.

REM Check Node.js
echo 1. Node.js Check:
where node >nul 2>nul
if %errorlevel% eq 0 (
    echo    [OK] Node.js installed
    echo    Version:
    node --version
) else (
    echo    [ERROR] Node.js not found
)
echo.

REM Check NPM
echo 2. NPM Check:
where npm >nul 2>nul
if %errorlevel% eq 0 (
    echo    [OK] NPM installed
    echo    Version:
    npm --version
) else (
    echo    [ERROR] NPM not found
)
echo.

REM Check Claude config directory
echo 3. Claude Configuration Directory:
set CLAUDE_DIR=%APPDATA%\Claude
if exist "%CLAUDE_DIR%" (
    echo    [OK] Directory exists: %CLAUDE_DIR%
) else (
    echo    [ERROR] Directory not found: %CLAUDE_DIR%
)
echo.

REM Check config file
echo 4. MCP Configuration File:
if exist "%CLAUDE_DIR%\claude_desktop_config.json" (
    echo    [OK] Config file exists
    echo.
    echo    Content:
    echo    ----------------------------------------
    type "%CLAUDE_DIR%\claude_desktop_config.json"
    echo.
    echo    ----------------------------------------
) else (
    echo    [ERROR] Config file not found
    echo    Expected at: %CLAUDE_DIR%\claude_desktop_config.json
)
echo.

REM Test MCP servers
echo 5. MCP Server Tests:
echo.

echo    Testing filesystem server...
call npx -y @modelcontextprotocol/server-filesystem --help >nul 2>&1
if %errorlevel% eq 0 (
    echo    [OK] Filesystem server available
) else (
    echo    [WARNING] Filesystem server not responding
)

echo    Testing memory server...
call npx -y @modelcontextprotocol/server-memory --help >nul 2>&1
if %errorlevel% eq 0 (
    echo    [OK] Memory server available
) else (
    echo    [WARNING] Memory server not responding
)
echo.

REM Check Claude process
echo 6. Claude Desktop Status:
tasklist /FI "IMAGENAME eq Claude.exe" 2>nul | find /I "Claude.exe" >nul
if %errorlevel% eq 0 (
    echo    [WARNING] Claude is running
    echo    Please restart Claude to apply MCP settings
) else (
    echo    [OK] Claude is not running
    echo    Start Claude to use MCP
)
echo.

echo ======================================
echo Verification Complete
echo ======================================
echo.
echo If all checks show [OK], MCP should work.
echo If Claude is running, restart it now.
echo.
pause