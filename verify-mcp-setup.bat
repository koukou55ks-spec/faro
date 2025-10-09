@echo off
echo ====================================
echo Claude Desktop MCP Setup Verification
echo ====================================
echo.

echo [1/4] Checking Node.js installation...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo [2/4] Checking npm installation...
npm --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo.

echo [3/4] Checking installed MCP servers...
echo.
echo Installed MCP servers:
npm list -g --depth=0 | findstr /C:"@modelcontextprotocol" /C:"@notionhq/notion-mcp-server" /C:"@upstash/context7-mcp"
echo.

echo [4/4] Checking configuration file...
if exist "C:\Users\kouko\AppData\Roaming\Claude\claude_desktop_config.json" (
    echo OK: Configuration file exists
    echo Location: C:\Users\kouko\AppData\Roaming\Claude\claude_desktop_config.json
) else (
    echo WARNING: Configuration file not found!
    echo Expected location: C:\Users\kouko\AppData\Roaming\Claude\claude_desktop_config.json
)
echo.

echo ====================================
echo Verification Complete
echo ====================================
echo.
echo Next Steps:
echo 1. Install Claude Desktop from https://claude.ai/download
echo 2. Edit the config file and add your API keys
echo 3. Restart Claude Desktop
echo 4. Test the MCP servers
echo.
echo Configuration file location:
echo C:\Users\kouko\AppData\Roaming\Claude\claude_desktop_config.json
echo.
echo For detailed setup instructions, see:
echo MCP_SETUP_GUIDE.md
echo.
pause
