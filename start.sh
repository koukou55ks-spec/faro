#!/bin/bash

echo "🚀 TaxHack Next.js プロジェクトを起動中..."
echo

# Node.jsがインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません。"
    echo
    echo "📥 Node.jsをインストールしてください:"
    echo "   https://nodejs.org/"
    echo
    echo "💡 または、既存のPythonサーバーを使用してください:"
    echo "   cd ../Taxhack"
    echo "   python run_server.py"
    echo
    exit 1
fi

# 依存関係のインストール
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依存関係のインストールに失敗しました。"
        exit 1
    fi
fi

# 開発サーバーの起動
echo "🌐 開発サーバーを起動中..."
echo "📍 URL: http://localhost:3000"
echo "⏹️  停止するにはCtrl+Cを押してください"
echo

npm run dev
