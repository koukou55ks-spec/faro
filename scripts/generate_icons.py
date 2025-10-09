#!/usr/bin/env python3
"""
Generate PNG icons from SVG source files.
This script converts SVG icons to various PNG sizes for better browser compatibility.
"""

import os
import sys

# Check if cairosvg is installed
try:
    import cairosvg
    HAS_CAIROSVG = True
except ImportError:
    HAS_CAIROSVG = False

# Try alternative: use PIL with svg support
try:
    from PIL import Image
    import io
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

def generate_png_icons():
    """Generate PNG icons from SVG source."""
    
    if not HAS_CAIROSVG:
        print("⚠️  cairosvgがインストールされていません。")
        print("   インストール方法: pip install cairosvg")
        print("")
        print("   または、オンラインツールを使用してください:")
        print("   - https://cloudconvert.com/svg-to-png")
        print("   - https://svgtopng.com/")
        print("")
        print("   必要なアイコンサイズ:")
        sizes = [72, 96, 128, 144, 152, 192, 384, 512]
        for size in sizes:
            print(f"   - icon-{size}x{size}.png")
        return False
    
    # Icon sizes needed for manifest.json
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    # Paths
    svg_source = "static/icons/icon.svg"
    favicon_source = "static/favicon.svg"
    output_dir = "static/icons"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    print("🎨 アイコンファイルを生成中...")
    
    # Generate main app icons
    if os.path.exists(svg_source):
        for size in sizes:
            output_file = os.path.join(output_dir, f"icon-{size}x{size}.png")
            try:
                cairosvg.svg2png(
                    url=svg_source,
                    write_to=output_file,
                    output_width=size,
                    output_height=size
                )
                print(f"✓ 作成: {output_file}")
            except Exception as e:
                print(f"✗ エラー: {output_file} - {e}")
    else:
        print(f"✗ SVGファイルが見つかりません: {svg_source}")
    
    # Generate favicon.ico (32x32)
    if os.path.exists(favicon_source):
        try:
            cairosvg.svg2png(
                url=favicon_source,
                write_to="static/favicon.png",
                output_width=32,
                output_height=32
            )
            print(f"✓ 作成: static/favicon.png")
            
            # Try to convert to .ico format if PIL is available
            if HAS_PIL:
                img = Image.open("static/favicon.png")
                img.save("static/favicon.ico", format="ICO")
                print(f"✓ 作成: static/favicon.ico")
        except Exception as e:
            print(f"✗ エラー: favicon生成 - {e}")
    else:
        print(f"✗ SVGファイルが見つかりません: {favicon_source}")
    
    print("\n✨ アイコン生成完了！")
    return True

if __name__ == "__main__":
    success = generate_png_icons()
    sys.exit(0 if success else 1)

