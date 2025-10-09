#!/usr/bin/env python3
"""
Notion移行スクリプト - MCP経由でMarkdownファイルをNotionに移行
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests
import json

# プロジェクトルート
PROJECT_ROOT = Path(__file__).parent.parent

# .env.notionから設定読み込み
load_dotenv(PROJECT_ROOT / ".env.notion")

NOTION_TOKEN = os.getenv("NOTION_API_TOKEN")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

if not NOTION_TOKEN or not NOTION_DATABASE_ID:
    print("❌ Error: NOTION_API_TOKEN or NOTION_DATABASE_ID not found in .env.notion")
    sys.exit(1)

# Notion API設定
NOTION_VERSION = "2022-06-28"
HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION
}

def markdown_to_notion_blocks(markdown_text: str) -> list:
    """
    MarkdownテキストをNotion blocksに変換（簡易版）
    """
    blocks = []
    lines = markdown_text.split('\n')

    i = 0
    while i < len(lines):
        line = lines[i]

        # 空行はスキップ
        if not line.strip():
            i += 1
            continue

        # H1 (# )
        if line.startswith('# '):
            blocks.append({
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                }
            })
        # H2 (## )
        elif line.startswith('## '):
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": line[3:]}}]
                }
            })
        # H3 (### )
        elif line.startswith('### '):
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": [{"type": "text", "text": {"content": line[4:]}}]
                }
            })
        # コードブロック開始
        elif line.startswith('```'):
            # コードブロック内容を収集
            language = line[3:].strip() or "plain text"
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i])
                i += 1

            code_content = '\n'.join(code_lines)
            # Notion APIの制限: 2000文字まで
            if len(code_content) > 1900:
                code_content = code_content[:1900] + "\n... (truncated)"

            blocks.append({
                "object": "block",
                "type": "code",
                "code": {
                    "language": language,
                    "rich_text": [{"type": "text", "text": {"content": code_content}}]
                }
            })
        # リスト項目 (- )
        elif line.startswith('- ') or line.startswith('* '):
            content = line[2:].strip()
            # Notion APIの制限: 2000文字まで
            if len(content) > 1900:
                content = content[:1900] + "..."

            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": content}}]
                }
            })
        # 水平線
        elif line.strip() == '---':
            blocks.append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
        # 通常のテキスト
        else:
            content = line.strip()
            # Notion APIの制限: 2000文字まで
            if len(content) > 1900:
                content = content[:1900] + "..."

            if content:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}]
                    }
                })

        i += 1

    return blocks

def create_notion_page(title: str, markdown_content: str) -> dict:
    """
    Notionページ作成
    """
    print(f"📄 Creating Notion page: {title}")

    # Markdownをblocksに変換
    blocks = markdown_to_notion_blocks(markdown_content)

    # Notion API制限: 一度に100ブロックまで
    # 超える場合は最初の100ブロックのみ
    if len(blocks) > 100:
        print(f"⚠️  Warning: Content has {len(blocks)} blocks, using first 100")
        blocks = blocks[:100]

    # ページ作成
    url = "https://api.notion.com/v1/pages"
    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        },
        "children": blocks
    }

    response = requests.post(url, headers=HEADERS, json=payload)

    if response.status_code == 200:
        result = response.json()
        page_url = result.get("url", "")
        print(f"✅ Success: {page_url}")
        return result
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None

def migrate_markdown_file(file_path: Path):
    """
    Markdownファイルを移行
    """
    print(f"\n{'='*60}")
    print(f"📝 Migrating: {file_path.name}")
    print(f"{'='*60}")

    # ファイル読み込み
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return None

    # タイトル生成（ファイル名から.md削除）
    title = file_path.stem

    # Notionページ作成
    result = create_notion_page(title, content)

    return result

def main():
    """
    メイン実行
    """
    print("🚀 Notion Migration Tool - MCP Mode")
    print(f"Database ID: {NOTION_DATABASE_ID[:8]}...")
    print()

    # 移行対象ファイル
    files_to_migrate = [
        "DEPLOY_NOW.md",
        "IMPLEMENTATION_SUMMARY.md",
        "MIGRATION_COMPLETE.md",
        "CLEANUP_PLAN.md",
        "README.md"
    ]

    results = []

    for filename in files_to_migrate:
        file_path = PROJECT_ROOT / filename

        if not file_path.exists():
            print(f"⚠️  Skipping: {filename} (not found)")
            continue

        result = migrate_markdown_file(file_path)
        results.append({
            "file": filename,
            "success": result is not None,
            "url": result.get("url") if result else None
        })

    # サマリー
    print("\n" + "="*60)
    print("📊 Migration Summary")
    print("="*60)

    for r in results:
        status = "✅" if r["success"] else "❌"
        print(f"{status} {r['file']}")
        if r["url"]:
            print(f"   → {r['url']}")

    success_count = sum(1 for r in results if r["success"])
    print(f"\n✨ Completed: {success_count}/{len(results)} files migrated")

if __name__ == "__main__":
    main()
