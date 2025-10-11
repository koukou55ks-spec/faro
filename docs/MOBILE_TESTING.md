# モバイル実機テスト：完全ガイド

## 🎯 前提：PWAはスマホユーザーが大多数

URLからアクセスするユーザーの80%以上がスマホ → **モバイル実機での確認が必須**

---

## 📱 方法1: ローカルネットワーク経由（最速・推奨）

### **セットアップ（1回のみ）**

```bash
# 1. PCのローカルIPアドレスを確認
ipconfig

# 出力例:
# IPv4 アドレス: 192.168.68.60
```

### **開発サーバーを起動**

```bash
# apps/webディレクトリで実行
cd apps/web
pnpm dev

# 出力:
# > Local:    http://localhost:3000
# > Network:  http://192.168.68.60:3000  ← これを使う
```

### **スマホでアクセス**

1. **PCとスマホを同じWi-Fiに接続**
2. スマホのブラウザで `http://192.168.68.60:3000/faro` を開く
3. コード変更が即座に反映される（ホットリロード）

### **メリット**
- ✅ 最速（1秒でアクセス可能）
- ✅ リアルタイムでコード変更を確認
- ✅ デバッグコンソールも使える（Chrome Remote Debugging）

### **デメリット**
- ❌ 同じWi-Fiネットワークが必要
- ❌ HTTPS環境ではない（PWA機能が一部制限される）

---

## 🌐 方法2: Vercel Preview Deploy（推奨・本番同等）

### **セットアップ**

```bash
# 1. Vercelにログイン（初回のみ）
npx vercel login

# 2. プロジェクトをVercelにリンク
npx vercel link

# 3. プレビューデプロイ（毎回）
npx vercel
```

### **使い方**

1. コード変更を保存
2. `npx vercel` を実行
3. 表示されるURLをスマホで開く（例: `https://taxhack-abc123.vercel.app`）
4. QRコード生成 → スマホでスキャン

```bash
# QRコード生成（オプション）
npx qrcode-terminal https://taxhack-abc123.vercel.app
```

### **メリット**
- ✅ HTTPS環境（本番と同じ）
- ✅ PWA機能が完全に動作
- ✅ どこからでもアクセス可能
- ✅ チーム共有可能

### **デメリット**
- ❌ デプロイに1〜2分かかる
- ❌ リアルタイム更新ではない

---

## 🔍 方法3: Chrome DevTools（デスクトップで擬似確認）

### **使い方**

1. ブラウザで `http://localhost:3000/faro` を開く
2. `F12` → DevTools起動
3. `Ctrl + Shift + M` → モバイルビュー切り替え
4. デバイス選択: **iPhone 14 Pro (390x844)** または **Pixel 7 (412x915)**

### **メリット**
- ✅ 最速でプレビュー
- ✅ デバッグツールが豊富
- ✅ 複数デバイスを瞬時に切り替え

### **デメリット**
- ❌ 実機の挙動と異なる場合がある
- ❌ タッチジェスチャーが正確に再現できない
- ❌ PWA機能の一部が動作しない

---

## 🚀 推奨ワークフロー（開発速度最優先）

### **日常の開発フロー**

```
1. Chrome DevToolsで基本動作確認（30秒）
   ↓
2. ローカルネットワークで実機確認（1分）
   ↓
3. 満足したらVercel Previewデプロイ（2分）
   ↓
4. 実機で最終確認（PWA機能含む）
```

### **具体的なコマンド**

```bash
# ターミナル1: 開発サーバー起動
cd apps/web
pnpm dev

# ブラウザ: http://localhost:3000/faro を開く
# Chrome DevTools: Ctrl+Shift+M → iPhone 14 Pro

# スマホ: http://192.168.68.60:3000/faro を開く

# 満足したらデプロイ
npx vercel

# QRコード生成してスマホでスキャン
npx qrcode-terminal https://taxhack-abc123.vercel.app/faro
```

---

## 📐 モバイル最適化のチェックリスト

### **必須チェック項目**

```
□ タップ領域が44×44px以上（指で押しやすい）
□ フォントサイズが16px以上（ズーム不要）
□ 横スクロールが発生しない
□ キーボード表示時にUIが崩れない
□ ローディング速度が3秒以内
□ オフライン対応（PWA機能）
□ ホーム画面追加が可能
□ スワイプジェスチャーが自然
```

### **PWA特有のチェック**

```
□ manifest.jsonが正しく読み込まれている
□ Service Workerが登録されている
□ アプリアイコンが表示される
□ スプラッシュ画面が表示される
□ オフラインでも基本機能が動作
□ インストールプロンプトが表示される
```

---

## 🛠️ Chrome Remote Debugging（高度）

### **セットアップ**

1. **Android端末の場合:**
   - 設定 → 開発者向けオプション → USBデバッグを有効化
   - PCとUSB接続
   - Chrome DevToolsで `chrome://inspect` を開く
   - スマホのブラウザが表示される → Inspect

2. **iPhone端末の場合:**
   - Mac + Safari必須
   - iPhone: 設定 → Safari → 詳細 → Webインスペクタを有効化
   - Mac: Safari → 開発 → [あなたのiPhone] → 対象ページを選択

### **できること**
- ✅ スマホのコンソールログをPC画面で確認
- ✅ ネットワークリクエストの監視
- ✅ パフォーマンス計測
- ✅ DOM要素の検証・編集

---

## 🎨 モバイルファースト実装のベストプラクティス

### **Tailwind CSSでのモバイルファースト**

```tsx
// ❌ 悪い例: デスクトップファースト
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ 良い例: モバイルファースト
<div className="w-full max-w-[375px] mx-auto">
  {/* モバイルは375px、デスクトップも375pxで中央配置 */}
</div>
```

### **タップ領域の最適化**

```tsx
// ❌ 悪い例: タップ領域が小さい
<button className="px-2 py-1 text-xs">送信</button>

// ✅ 良い例: 最低44×44px
<button className="px-6 py-3 text-base min-h-[44px]">送信</button>
```

### **フォントサイズの最適化**

```tsx
// ❌ 悪い例: 読みにくい
<p className="text-xs">重要なお知らせ</p>

// ✅ 良い例: 最低16px（base）
<p className="text-base leading-relaxed">重要なお知らせ</p>
```

---

## 🔧 Faroの現在の設定

### **apps/web/app/layout.tsx**

```tsx
// 既に375px固定でモバイル最適化済み
<body className="max-w-[375px] mx-auto">
  {children}
</body>
```

### **確認コマンド**

```bash
# 開発サーバー起動
cd apps/web
pnpm dev

# PCのIPアドレス確認
ipconfig

# スマホでアクセス
# http://192.168.68.60:3000/faro
```

---

## 📊 パフォーマンス計測

### **Lighthouse（Chrome DevTools内蔵）**

```
1. Chrome DevToolsを開く（F12）
2. Lighthouseタブを選択
3. "Mobile"を選択
4. "Analyze page load"をクリック
5. スコアを確認:
   - Performance: 90点以上
   - Accessibility: 90点以上
   - Best Practices: 90点以上
   - SEO: 90点以上
   - PWA: 100点（manifest.json実装後）
```

### **モバイル実機での計測**

```bash
# Vercel Previewデプロイ後
npx lighthouse https://taxhack-abc123.vercel.app/faro --view
```

---

## 🎯 次のステップ

### **今すぐ実行**

```bash
# 1. 開発サーバー起動
cd apps/web
pnpm dev

# 2. スマホで確認
# http://192.168.68.60:3000/faro

# 3. Chrome DevToolsで最適化
# F12 → Ctrl+Shift+M → iPhone 14 Pro
```

### **PWA実装後**

```bash
# Vercel本番デプロイ
npx vercel --prod

# PWA機能確認
# - ホーム画面に追加
# - オフライン動作
# - インストールプロンプト
```

---

モバイル実機での確認が、一人ユニコーンへの最短ルートです！🚀
