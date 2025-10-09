"""
SQLite to Supabase Migration Script
既存のSQLiteデータをSupabaseに移行
"""

import sqlite3
import os
from typing import List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

# Supabase設定
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service key (admin権限)

# SQLite DBパス
SQLITE_NOTES_DB = "data/user_notes.db"
SQLITE_CONVERSATIONS_DB = "data/conversations.db"

def get_supabase_client() -> Client:
    """Supabaseクライアントを取得"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URLとSUPABASE_SERVICE_KEYを.envに設定してください")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def migrate_notes():
    """ノートデータをSQLiteからSupabaseに移行"""
    print("📝 ノートデータを移行中...")

    if not os.path.exists(SQLITE_NOTES_DB):
        print(f"⚠️  {SQLITE_NOTES_DB}が見つかりません。スキップします。")
        return

    # SQLite接続
    sqlite_conn = sqlite3.connect(SQLITE_NOTES_DB)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()

    # Supabase接続
    supabase = get_supabase_client()

    # デフォルトユーザーを作成（既存のuser_idがない場合）
    default_user_id = str(uuid.uuid4())

    try:
        # ノート取得
        cursor.execute("SELECT * FROM notes")
        notes = cursor.fetchall()

        migrated_count = 0
        for note in notes:
            note_data = {
                "id": str(uuid.uuid4()),
                "user_id": default_user_id,  # 既存データは全てデフォルトユーザーに紐付け
                "title": note["title"],
                "content": note["content"],
                "tags": note["tags"].split(",") if note.get("tags") else [],
                "category": note.get("category", "personal"),
                "is_private": bool(note.get("is_private", 1)),
                "metadata": {},
                "created_at": note.get("created_at", datetime.now().isoformat()),
                "updated_at": note.get("updated_at", datetime.now().isoformat())
            }

            # Supabaseに挿入
            result = supabase.table("notes").insert(note_data).execute()
            migrated_count += 1

            if migrated_count % 10 == 0:
                print(f"  移行済み: {migrated_count}件")

        print(f"✅ ノート移行完了: {migrated_count}件")

    except Exception as e:
        print(f"❌ ノート移行エラー: {e}")
    finally:
        sqlite_conn.close()

def migrate_conversations():
    """会話履歴をSQLiteからSupabaseに移行"""
    print("💬 会話履歴を移行中...")

    if not os.path.exists(SQLITE_CONVERSATIONS_DB):
        print(f"⚠️  {SQLITE_CONVERSATIONS_DB}が見つかりません。スキップします。")
        return

    # SQLite接続
    sqlite_conn = sqlite3.connect(SQLITE_CONVERSATIONS_DB)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()

    # Supabase接続
    supabase = get_supabase_client()

    # デフォルトユーザーID
    default_user_id = str(uuid.uuid4())

    try:
        # 会話取得（テーブル構造は既存のconversations.dbに依存）
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        if not tables:
            print("⚠️  会話テーブルが見つかりません")
            return

        # 仮の実装（実際のスキーマに合わせて調整が必要）
        print("✅ 会話履歴移行スキップ（手動で設定してください）")

    except Exception as e:
        print(f"❌ 会話移行エラー: {e}")
    finally:
        sqlite_conn.close()

def verify_migration():
    """移行結果を検証"""
    print("\n🔍 移行結果を検証中...")

    supabase = get_supabase_client()

    # ノート数確認
    notes_result = supabase.table("notes").select("id", count="exact").execute()
    print(f"✅ Supabaseノート数: {notes_result.count}件")

    # 会話数確認
    conversations_result = supabase.table("conversations").select("id", count="exact").execute()
    print(f"✅ Supabase会話数: {conversations_result.count}件")

def main():
    """メイン実行"""
    print("=" * 60)
    print("🚀 SQLite → Supabase データ移行開始")
    print("=" * 60)

    # 移行実行
    migrate_notes()
    migrate_conversations()

    # 検証
    verify_migration()

    print("\n" + "=" * 60)
    print("✨ データ移行完了！")
    print("=" * 60)
    print("\n次のステップ:")
    print("1. Supabase Dashboardでデータを確認")
    print("2. .envファイルにSUPABASE_URLとSUPABASE_ANON_KEYを設定")
    print("3. アプリケーションコードをSupabaseクライアントに切り替え")

if __name__ == "__main__":
    main()
