"""
TaxHack 統合テスト
システム全体の動作をテストする
"""

import os
import sys
from datetime import datetime
from typing import Dict, Any

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config import config
from app.enhanced_chatbot import enhanced_chatbot
from app.cost_optimized_apis import cost_optimized_api_manager
from app.ecosystem_learning_system import ecosystem_learner

class TestTaxHackIntegration:
    """TaxHack統合テストクラス"""
    
    def setup_method(self):
        """テスト前のセットアップ"""
        os.environ['GOOGLE_API_KEY'] = 'AIzaSyBJ2YlcAIMnH_O1ipi-uAjy7NSGkJtPmg4'
    
    def test_config_loading(self):
        """設定読み込みテスト"""
        assert config.api.google_api_key is not None
        assert config.database.chroma_db_path == "./chroma_db"
        assert config.server.host == "127.0.0.1"
        assert config.server.port == 8000
    
    def test_enhanced_chatbot_initialization(self):
        """高度なチャットボット初期化テスト"""
        assert enhanced_chatbot is not None
        assert enhanced_chatbot.gemini_model is not None
        assert enhanced_chatbot.rag_chain is not None
    
    def test_cost_optimized_apis(self):
        """コスト最適化APIテスト"""
        status = cost_optimized_api_manager.get_api_status()
        assert 'e_gov_api' in status
        assert 'e_stat_api' in status
        assert 'x_api' in status
        assert 'gemini' in status
    
    def test_ecosystem_learning_system(self):
        """エコシステム学習システムテスト"""
        # テスト用インタラクションを記録
        interaction_id = ecosystem_learner.record_interaction(
            user_id="test_user",
            query="テスト質問",
            response="テスト回答",
            response_time=1.5,
            context={"test": True}
        )
        
        assert interaction_id is not None
        
        # 学習サマリーを取得
        summary = ecosystem_learner.get_learning_summary()
        assert summary['total_interactions'] > 0
    
    def test_enhanced_query_processing(self):
        """高度なクエリ処理テスト"""
        result = enhanced_chatbot.process_query("所得税の計算方法について教えてください", "test_user")
        
        assert result is not None
        assert 'answer' in result
        assert 'confidence_score' in result
        assert 'context' in result
        assert len(result['answer']) > 0
        assert 0 <= result['confidence_score'] <= 1
    
    def test_user_recommendations(self):
        """ユーザー推奨事項テスト"""
        recommendations = enhanced_chatbot.get_user_recommendations("test_user")
        
        assert recommendations is not None
        assert 'recommendations' in recommendations
        assert 'user_interests' in recommendations
        assert 'total_queries' in recommendations
    
    def test_api_cost_summary(self):
        """APIコストサマリーテスト"""
        summary = cost_optimized_api_manager.get_cost_summary()
        
        assert summary is not None
        assert 'total_api_calls' in summary
        assert 'total_cost' in summary
        assert summary['total_cost'] >= 0
        assert summary['total_api_calls'] >= 0

def run_integration_tests():
    """統合テストを実行"""
    print("TaxHack 統合テスト開始...")
    
    test_instance = TestTaxHackIntegration()
    test_instance.setup_method()
    
    tests = [
        ("設定読み込みテスト", test_instance.test_config_loading),
        ("高度なチャットボット初期化テスト", test_instance.test_enhanced_chatbot_initialization),
        ("コスト最適化APIテスト", test_instance.test_cost_optimized_apis),
        ("エコシステム学習システムテスト", test_instance.test_ecosystem_learning_system),
        ("高度なクエリ処理テスト", test_instance.test_enhanced_query_processing),
        ("ユーザー推奨事項テスト", test_instance.test_user_recommendations),
        ("APIコストサマリーテスト", test_instance.test_api_cost_summary)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            test_func()
            print(f"[SUCCESS] {test_name}: 成功")
            results.append((test_name, True, None))
        except Exception as e:
            print(f"[FAILED] {test_name}: 失敗 - {e}")
            results.append((test_name, False, str(e)))
    
    # 結果サマリー
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    print(f"\nテスト結果: {passed}/{total} 成功")
    
    if passed == total:
        print("[PASSED] すべての統合テストが成功しました！")
        return True
    else:
        print("[WARNING] 一部のテストが失敗しました。")
        return False

if __name__ == "__main__":
    run_integration_tests()
