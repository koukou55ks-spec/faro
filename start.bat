@echo off
echo 🚀 TaxHack Next.js プロジェクトを起動中...
echo.

REM Node.jsがインストールされているかチェック
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.jsがインストールされていません。
    echo.
    echo 📥 Node.jsをインストールしてください:
    echo    https://nodejs.org/
    echo.
    echo 💡 または、既存のPythonサーバーを使用してください:
    echo    cd ../Taxhack
    echo    python run_server.py
    echo.
    pause
    exit /b 1
)

REM 依存関係のインストール
if not exist "node_modules" (
    echo 📦 依存関係をインストール中...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依存関係のインストールに失敗しました。
        pause
        exit /b 1
    )
)

REM 開発サーバーの起動
echo 🌐 開発サーバーを起動中...
echo 📍 URL: http://localhost:3000
echo ⏹️  停止するにはCtrl+Cを押してください
echo.

npm run dev
