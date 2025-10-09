"""
エキスパートモードのテストスクリプト
"""

import requests
import json

BACKEND_URL = "http://127.0.0.1:8003"

def test_normal_mode():
    """通常モードのテスト"""
    print("=" * 60)
    print("通常モードのテスト")
    print("=" * 60)

    response = requests.post(
        f"{BACKEND_URL}/ask-enhanced",
        json={
            "text": "確定申告の期限について教えてください",
            "user_id": "test_user",
            "expert_mode": False
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("\n【回答】")
        print(data.get("answer", ""))
        print("\n【メタデータ】")
        print(f"モデル: {data.get('model', 'N/A')}")
        print(f"エキスパートモード: {data.get('expert_mode', False)}")
        print(f"処理時間: {data.get('processing_time', 0):.2f}秒")
    else:
        print(f"エラー: {response.status_code}")
        print(response.text)

def test_expert_mode():
    """エキスパートモードのテスト"""
    print("\n" + "=" * 60)
    print("エキスパートモードのテスト")
    print("=" * 60)

    response = requests.post(
        f"{BACKEND_URL}/ask-enhanced",
        json={
            "text": "確定申告の期限について教えてください",
            "user_id": "test_user",
            "expert_mode": True
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("\n【回答】")
        print(data.get("answer", ""))
        print("\n【メタデータ】")
        print(f"モデル: {data.get('model', 'N/A')}")
        print(f"エキスパートモード: {data.get('expert_mode', False)}")
        print(f"処理時間: {data.get('processing_time', 0):.2f}秒")
    else:
        print(f"エラー: {response.status_code}")
        print(response.text)

def test_expert_mode_calculation():
    """エキスパートモードの計算機能テスト"""
    print("\n" + "=" * 60)
    print("エキスパートモード（計算）のテスト")
    print("=" * 60)

    response = requests.post(
        f"{BACKEND_URL}/ask-enhanced",
        json={
            "text": "年収500万円の会社員の場合、所得税はいくらですか？",
            "user_id": "test_user",
            "expert_mode": True
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("\n【回答】")
        print(data.get("answer", ""))
        print("\n【メタデータ】")
        print(f"モデル: {data.get('model', 'N/A')}")
        print(f"エキスパートモード: {data.get('expert_mode', False)}")
        print(f"処理時間: {data.get('processing_time', 0):.2f}秒")
    else:
        print(f"エラー: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("エキスパートモード機能テスト\n")

    # 1. 通常モード
    test_normal_mode()

    # 2. エキスパートモード
    test_expert_mode()

    # 3. エキスパートモード（計算）
    test_expert_mode_calculation()

    print("\n" + "=" * 60)
    print("テスト完了")
    print("=" * 60)
