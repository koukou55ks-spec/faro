@echo off
echo ======================================
echo MCP (Model Context Protocol) Setup
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Create Claude config directory
set CLAUDE_DIR=%APPDATA%\Claude
if not exist "%CLAUDE_DIR%" (
    echo Creating Claude config directory...
    mkdir "%CLAUDE_DIR%"
)
echo [OK] Claude config directory: %CLAUDE_DIR%
echo.

REM Copy configuration file
echo Copying MCP configuration...
copy /Y "claude_desktop_config_complete.json" "%CLAUDE_DIR%\claude_desktop_config.json" >nul
if %errorlevel% eq 0 (
    echo [OK] Configuration file copied successfully
) else (
    echo [ERROR] Failed to copy configuration file
    pause
    exit /b 1
)
echo.

REM Install MCP servers
echo Installing MCP servers...
echo.

echo Installing filesystem server...
call npx -y @modelcontextprotocol/server-filesystem --version >nul 2>&1
if %errorlevel% eq 0 (
    echo [OK] Filesystem server ready
) else (
    echo [WARNING] Filesystem server installation issue
)

echo Installing memory server...
call npx -y @modelcontextprotocol/server-memory --version >nul 2>&1
if %errorlevel% eq 0 (
    echo [OK] Memory server ready
) else (
    echo [WARNING] Memory server installation issue
)

echo Installing brave-search server...
call npx -y @modelcontextprotocol/server-brave-search --version >nul 2>&1
if %errorlevel% eq 0 (
    echo [OK] Brave search server ready
) else (
    echo [WARNING] Brave search server installation issue
)
echo.

REM Display configuration
echo ======================================
echo Current MCP Configuration:
echo ======================================
type "%CLAUDE_DIR%\claude_desktop_config.json"
echo.
echo ======================================

echo.
echo Setup complete!
echo.
echo IMPORTANT NEXT STEPS:
echo 1. Close Claude Desktop completely (check system tray)
echo 2. Restart Claude Desktop
echo 3. Open a new chat session
echo 4. MCP should now be active
echo.
echo If you have a Brave API key, edit the config file at:
echo %CLAUDE_DIR%\claude_desktop_config.json
echo.
pause