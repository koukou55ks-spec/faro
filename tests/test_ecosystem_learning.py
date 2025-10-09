"""
エコシステム学習システムのテスト
ユーザーインタラクションを通じてチャットボットを賢くするシステム
"""

import os
import sys
import traceback
import time
from datetime import datetime, timedelta

def test_ecosystem_learning_system():
    """エコシステム学習システムテスト"""
    try:
        print("エコシステム学習システムテスト開始...")
        
        # 環境変数を設定
        os.environ['GOOGLE_API_KEY'] = 'AIzaSyBJ2YlcAIMnH_O1ipi-uAjy7NSGkJtPmg4'
        
        # エコシステム学習システムをインポート
        print("  - エコシステム学習システムをインポート中...")
        from app.ecosystem_learning_system import ecosystem_learner
        
        # テスト用のインタラクションを記録
        print("  - テスト用インタラクションを記録中...")
        test_interactions = [
            ("user_001", "所得税の計算方法について教えてください", "所得税の計算方法について説明します...", 2.5),
            ("user_001", "年収500万円の所得税はいくらですか？", "年収500万円の場合、所得税は...", 3.2),
            ("user_002", "消費税の税率について教えてください", "消費税の税率は現在10%です...", 1.8),
            ("user_001", "節税対策について教えてください", "節税対策について説明します...", 4.1),
            ("user_003", "法人税の計算方法について", "法人税の計算方法について説明します...", 2.9),
            ("user_001", "所得税の控除について詳しく教えてください", "所得税の控除について詳しく説明します...", 3.7),
            ("user_002", "消費税の軽減税率について", "消費税の軽減税率について説明します...", 2.3),
            ("user_003", "相続税について教えてください", "相続税について説明します...", 3.4),
            ("user_001", "所得税の確定申告について", "所得税の確定申告について説明します...", 4.2),
            ("user_002", "消費税のインボイス制度について", "消費税のインボイス制度について説明します...", 3.8)
        ]
        
        interaction_ids = []
        for user_id, query, response, response_time in test_interactions:
            interaction_id = ecosystem_learner.record_interaction(
                user_id=user_id,
                query=query,
                response=response,
                response_time=response_time,
                context={"test": True}
            )
            interaction_ids.append(interaction_id)
            print(f"    記録済み: {user_id} - {query[:20]}...")
        
        # 学習サマリーを取得
        print("  - 学習サマリーを取得中...")
        summary = ecosystem_learner.get_learning_summary()
        print(f"    総インタラクション数: {summary['total_interactions']}")
        print(f"    知識ギャップ数: {summary['knowledge_gaps']}")
        print(f"    学習インサイト数: {summary['learning_insights']}")
        
        # トップクエリパターンを表示
        if summary['top_query_patterns']:
            print("    トップクエリパターン:")
            for pattern, count in list(summary['top_query_patterns'].items())[:5]:
                print(f"      - {pattern}: {count}回")
        
        # 高優先度ギャップを表示
        if summary['high_priority_gaps']:
            print("    高優先度知識ギャップ:")
            for gap in summary['high_priority_gaps'][:3]:
                print(f"      - {gap['pattern']}: 優先度{gap['priority']}")
        
        # ユーザー個人化推奨事項をテスト
        print("  - ユーザー個人化推奨事項をテスト中...")
        recommendations = ecosystem_learner.get_personalized_recommendations("user_001")
        print(f"    ユーザー001の推奨事項数: {len(recommendations.get('recommendations', []))}")
        
        if recommendations['recommendations']:
            print("    推奨事項:")
            for rec in recommendations['recommendations'][:3]:
                print(f"      - {rec['title']} ({rec['priority']})")
        
        # 満足度スコアの更新テスト
        print("  - 満足度スコア更新をテスト中...")
        if interaction_ids:
            ecosystem_learner.update_satisfaction_score(
                interaction_ids[0], 
                4.5, 
                "とても役に立ちました"
            )
            print("    満足度スコアを更新しました")
        
        print("エコシステム学習システムテストが成功しました！")
        return True
        
    except Exception as e:
        print(f"エコシステム学習システムエラー: {e}")
        traceback.print_exc()
        return False

def test_enhanced_chatbot_with_learning():
    """学習機能付きチャットボットテスト"""
    try:
        print("\n学習機能付きチャットボットテスト開始...")
        
        from app.enhanced_chatbot import enhanced_chatbot
        
        # テストクエリでインタラクションを生成
        test_queries = [
            "所得税の計算方法について教えてください",
            "年収400万円の所得税はいくらですか？",
            "消費税の税率について教えてください",
            "節税対策について詳しく教えてください",
            "法人税の計算方法について"
        ]
        
        for i, query in enumerate(test_queries):
            user_id = f"test_user_{i % 2 + 1}"  # 2人のユーザーでテスト
            print(f"  テストクエリ {i+1}: {query}")
            
            result = enhanced_chatbot.process_query(query, user_id)
            
            print(f"    回答長: {len(result['answer'])}文字")
            print(f"    信頼度: {result['confidence_score']}")
            
            # 推奨事項が含まれているかチェック
            if 'recommendations' in result:
                print(f"    推奨事項数: {len(result['recommendations'])}")
            
            # 少し待機（学習処理のため）
            time.sleep(0.5)
        
        # 学習インサイトを取得
        print("  - 学習インサイトを取得中...")
        insights = enhanced_chatbot.get_learning_insights()
        print(f"    総インタラクション数: {insights['total_interactions']}")
        print(f"    学習インサイト数: {insights['learning_insights']}")
        
        # ユーザー推奨事項を取得
        print("  - ユーザー推奨事項を取得中...")
        recommendations = enhanced_chatbot.get_user_recommendations("test_user_1")
        print(f"    推奨事項数: {len(recommendations.get('recommendations', []))}")
        
        print("学習機能付きチャットボットテストが成功しました！")
        return True
        
    except Exception as e:
        print(f"学習機能付きチャットボットエラー: {e}")
        traceback.print_exc()
        return False

def test_fastapi_learning_endpoints():
    """学習システムFastAPIエンドポイントテスト"""
    try:
        print("\n学習システムFastAPIエンドポイントテスト開始...")
        
        from app.enhanced_main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # 学習インサイトエンドポイント
        print("  - 学習インサイトエンドポイントをテスト中...")
        response = client.get("/learning/insights")
        assert response.status_code == 200
        data = response.json()
        print(f"    総インタラクション数: {data['total_interactions']}")
        print(f"    知識ギャップ数: {data['knowledge_gaps']}")
        
        # ユーザー推奨事項エンドポイント
        print("  - ユーザー推奨事項エンドポイントをテスト中...")
        response = client.get("/learning/recommendations/test_user")
        assert response.status_code == 200
        data = response.json()
        print(f"    推奨事項数: {len(data.get('recommendations', []))}")
        
        # 満足度スコア更新エンドポイント
        print("  - 満足度スコア更新エンドポイントをテスト中...")
        satisfaction_data = {
            "interaction_id": "2024-01-01T00:00:00",
            "score": 4.5,
            "feedback": "テストフィードバック"
        }
        response = client.post("/learning/satisfaction", json=satisfaction_data)
        assert response.status_code == 200
        data = response.json()
        print(f"    ステータス: {data['status']}")
        
        print("学習システムFastAPIエンドポイントテストが成功しました！")
        return True
        
    except Exception as e:
        print(f"学習システムFastAPIエンドポイントエラー: {e}")
        traceback.print_exc()
        return False

def main():
    """メインテスト"""
    print("エコシステム学習システムテスト開始")
    print("=" * 60)
    
    # テストを実行
    tests = [
        ("エコシステム学習システムテスト", test_ecosystem_learning_system),
        ("学習機能付きチャットボットテスト", test_enhanced_chatbot_with_learning),
        ("学習システムFastAPIエンドポイントテスト", test_fastapi_learning_endpoints)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}を実行中...")
        result = test_func()
        results.append((test_name, result))
    
    # 結果を表示
    print("\n" + "=" * 60)
    print("テスト結果:")
    for test_name, result in results:
        status = "成功" if result else "失敗"
        print(f"   {test_name}: {status}")
    
    # 全体の結果
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\nすべてのテストが成功しました！")
        print("エコシステム学習システムが完了しました。")
        print("\n実装された機能:")
        print("  - ユーザーインタラクション記録")
        print("  - パターン分析と学習")
        print("  - 知識ギャップ検出")
        print("  - 学習インサイト生成")
        print("  - 個人化された推奨事項")
        print("  - 満足度スコア管理")
        print("  - 継続的な改善システム")
        print("\nエコシステム学習の特徴:")
        print("  - リアルタイム学習")
        print("  - ユーザー行動分析")
        print("  - 自動的な知識強化")
        print("  - パーソナライゼーション")
        print("  - 継続的な改善")
    else:
        print("\n一部のテストが失敗しました。")
        print("エラーを修正してから再試行してください。")

if __name__ == "__main__":
    main()
