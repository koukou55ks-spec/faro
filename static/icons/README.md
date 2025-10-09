# アイコンディレクトリ

このディレクトリには、アプリケーションのアイコンファイルが保存されます。

## 現在の状態

現在、SVGアイコン（`icon.svg`）が用意されています。

## PNGアイコンの生成方法

より広い互換性のために、以下のサイズのPNGアイコンを生成することをお勧めします：

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### オンラインツールを使用（推奨）

1. `icon.svg`を以下のサイトにアップロード：
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/
   - https://realfavicongenerator.net/

2. 各サイズのPNGファイルを生成

3. このディレクトリに保存

### コマンドラインツールを使用

Inkscapeがインストールされている場合：

```bash
inkscape icon.svg -w 192 -h 192 -o icon-192x192.png
```

ImageMagickがインストールされている場合：

```bash
magick icon.svg -resize 192x192 icon-192x192.png
```

## SVGアイコンについて

現在のSVGアイコンは、以下のブラウザでサポートされています：
- Chrome/Edge 80+
- Firefox 41+
- Safari 9+
- Opera 67+

ほとんどの現代のブラウザで正常に動作します。


