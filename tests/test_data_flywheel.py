"""
Data Flywheel Engine Tests
データフライホイールエンジンのテスト
"""

import pytest
from unittest.mock import patch, MagicMock
from app.data_flywheel import DataFlywheelEngine, FinancialDNA, SimilarUser, SuccessPattern
from datetime import datetime


class TestDataFlywheelEngine:
    """DataFlywheelEngineクラステスト"""

    @pytest.mark.unit
    def test_engine_initialization(self, mock_supabase_client):
        """エンジン初期化"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            engine = DataFlywheelEngine()
            assert engine.supabase is not None

    @pytest.mark.unit
    def test_update_financial_dna_creates_embedding(self, mock_data_flywheel_engine, mock_supabase_client):
        """財務DNA更新時にEmbedding生成"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            # Mock embedding response
            mock_embedding = MagicMock()
            mock_embedding.values = [0.1] * 768  # 768-dim vector

            with patch.object(mock_data_flywheel_engine.embedding_model, "embed_query", return_value=[0.1] * 768):
                result = mock_data_flywheel_engine.update_financial_dna(
                    user_id="test-user-123",
                    notes_text="副業で月10万円稼いでいます",
                    monthly_income=500000.0
                )

                # Verify supabase insert was called
                mock_supabase_client.table.assert_called()


    @pytest.mark.unit
    def test_calculate_persona_hash(self, mock_data_flywheel_engine):
        """ペルソナハッシュ計算"""
        hash1 = mock_data_flywheel_engine._calculate_persona_hash(
            age_group="30代",
            income_level="500~700万円",
            occupation="会社員",
            goals=["節税", "資産形成"]
        )

        hash2 = mock_data_flywheel_engine._calculate_persona_hash(
            age_group="30代",
            income_level="500~700万円",
            occupation="会社員",
            goals=["節税", "資産形成"]
        )

        # Same inputs should produce same hash
        assert hash1 == hash2

        # Different inputs should produce different hash
        hash3 = mock_data_flywheel_engine._calculate_persona_hash(
            age_group="40代",
            income_level="700~1000万円",
            occupation="フリーランス",
            goals=["起業"]
        )
        assert hash1 != hash3


class TestFinancialDNARetrieval:
    """財務DNA取得テスト"""

    @pytest.mark.integration
    def test_get_financial_dna_existing_user(self, mock_data_flywheel_engine, mock_supabase_client):
        """既存ユーザーの財務DNA取得"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            # Mock database response
            mock_response = MagicMock()
            mock_response.data = [{
                "user_id": "test-user-123",
                "notes_text": "Test notes",
                "monthly_income": 500000.0,
                "monthly_expenses": {"rent": 100000},
                "savings_rate": 0.40,
                "assets": {"cash": 3000000},
                "tax_status": {"filing_type": "給与所得者"},
                "persona_hash": "abc123",
                "age_group": "30代",
                "income_level": "500~700万円",
                "occupation": "会社員",
                "goals": ["節税"],
                "updated_at": datetime.now().isoformat()
            }]

            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

            result = mock_data_flywheel_engine.get_financial_dna("test-user-123")

            assert result is not None
            assert result.user_id == "test-user-123"
            assert result.monthly_income == 500000.0

    @pytest.mark.integration
    def test_get_financial_dna_nonexistent_user(self, mock_data_flywheel_engine, mock_supabase_client):
        """存在しないユーザーの財務DNA取得"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            mock_response = MagicMock()
            mock_response.data = []

            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response

            result = mock_data_flywheel_engine.get_financial_dna("nonexistent-user")

            assert result is None


class TestCollaborativeFiltering:
    """協調フィルタリングテスト"""

    @pytest.mark.integration
    def test_find_similar_users(self, mock_data_flywheel_engine, mock_supabase_client):
        """類似ユーザー検索"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            # Mock RPC response
            mock_response = MagicMock()
            mock_response.data = [
                {
                    "user_id": "similar-user-1",
                    "persona_hash": "abc123",
                    "similarity": 0.85,
                    "age_group": "30代",
                    "income_level": "500~700万円",
                    "occupation": "会社員",
                    "goals": ["節税", "資産形成"]
                },
                {
                    "user_id": "similar-user-2",
                    "persona_hash": "abc123",
                    "similarity": 0.78,
                    "age_group": "30代",
                    "income_level": "500~700万円",
                    "occupation": "会社員",
                    "goals": ["FIRE"]
                }
            ]

            mock_supabase_client.rpc.return_value.execute.return_value = mock_response

            result = mock_data_flywheel_engine.find_similar_users("test-user-123", threshold=0.7, limit=10)

            assert len(result) == 2
            assert result[0].similarity == 0.85
            assert result[0].user_id == "similar-user-1"
            assert result[1].similarity == 0.78

    @pytest.mark.integration
    def test_find_similar_users_no_matches(self, mock_data_flywheel_engine, mock_supabase_client):
        """類似ユーザーが見つからない場合"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            mock_response = MagicMock()
            mock_response.data = []

            mock_supabase_client.rpc.return_value.execute.return_value = mock_response

            result = mock_data_flywheel_engine.find_similar_users("unique-user", threshold=0.7)

            assert len(result) == 0


class TestSuccessPatterns:
    """成功パターン取得テスト"""

    @pytest.mark.integration
    def test_get_success_patterns(self, mock_data_flywheel_engine, mock_supabase_client):
        """ペルソナの成功パターン取得"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            mock_response = MagicMock()
            mock_response.data = [
                {
                    "persona_hash": "abc123",
                    "action": "つみたてNISA開始",
                    "success_count": 50,
                    "total_count": 60,
                    "avg_outcome": 150000.0,
                    "context": {"investment_type": "インデックスファンド"}
                },
                {
                    "persona_hash": "abc123",
                    "action": "ふるさと納税",
                    "success_count": 80,
                    "total_count": 100,
                    "avg_outcome": 30000.0,
                    "context": {"category": "食品"}
                }
            ]

            mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = mock_response

            result = mock_data_flywheel_engine.get_success_patterns("abc123", top_k=10)

            assert len(result) == 2
            assert result[0].action == "つみたてNISA開始"
            assert result[0].success_rate == pytest.approx(50 / 60)
            assert result[1].action == "ふるさと納税"
            assert result[1].success_rate == pytest.approx(80 / 100)


class TestAdviceGeneration:
    """アドバイス生成テスト"""

    @pytest.mark.integration
    def test_generate_advice_with_flywheel(self, mock_data_flywheel_engine, mock_supabase_client, sample_financial_dna):
        """データフライホイールを使ったアドバイス生成"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            # Mock user DNA
            mock_dna_response = MagicMock()
            mock_dna_response.data = [{
                **sample_financial_dna,
                "persona_hash": "abc123",
                "age_group": "30代",
                "income_level": "500~700万円",
                "occupation": "会社員",
                "goals": ["節税", "資産形成"],
                "updated_at": datetime.now().isoformat()
            }]
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_dna_response

            # Mock similar users
            mock_similar_response = MagicMock()
            mock_similar_response.data = [
                {
                    "user_id": "similar-1",
                    "persona_hash": "abc123",
                    "similarity": 0.85,
                    "age_group": "30代",
                    "income_level": "500~700万円",
                    "occupation": "会社員",
                    "goals": ["節税"]
                }
            ]
            mock_supabase_client.rpc.return_value.execute.return_value = mock_similar_response

            # Mock success patterns
            mock_patterns_response = MagicMock()
            mock_patterns_response.data = [
                {
                    "persona_hash": "abc123",
                    "action": "つみたてNISA開始",
                    "success_count": 50,
                    "total_count": 60,
                    "avg_outcome": 150000.0,
                    "context": {}
                }
            ]
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = mock_patterns_response

            # Mock Gemini response
            mock_gemini = MagicMock()
            mock_gemini.text = "あなたと似たユーザーは、つみたてNISAで年間150万円の利益を得ています。"

            with patch.object(mock_data_flywheel_engine.model, "generate_content", return_value=mock_gemini):
                result = mock_data_flywheel_engine.generate_advice(
                    user_id="test-user-123",
                    question="資産形成の方法を教えてください"
                )

                assert "advice" in result
                assert "similar_users_count" in result
                assert "success_patterns_count" in result
                assert result["similar_users_count"] == 1
                assert result["success_patterns_count"] == 1

    @pytest.mark.unit
    def test_build_integrated_prompt(self, mock_data_flywheel_engine, sample_financial_dna):
        """統合プロンプト生成テスト"""
        user_dna = FinancialDNA(
            user_id="test-user-123",
            notes_text="Test notes",
            monthly_income=500000.0,
            monthly_expenses={"rent": 100000},
            savings_rate=0.40,
            assets={"cash": 3000000},
            tax_status={"filing_type": "給与所得者"},
            persona_hash="abc123",
            age_group="30代",
            income_level="500~700万円",
            occupation="会社員",
            goals=["節税"],
            updated_at=datetime.now()
        )

        similar_users = [
            SimilarUser(
                user_id="similar-1",
                persona_hash="abc123",
                similarity=0.85,
                age_group="30代",
                income_level="500~700万円",
                occupation="会社員",
                goals=["節税"]
            )
        ]

        success_patterns = [
            SuccessPattern(
                persona_hash="abc123",
                action="つみたてNISA開始",
                success_count=50,
                total_count=60,
                success_rate=50/60,
                avg_outcome=150000.0,
                context={}
            )
        ]

        prompt = mock_data_flywheel_engine._build_integrated_prompt(
            user_dna=user_dna,
            question="資産形成について教えてください",
            similar_users=similar_users,
            success_patterns=success_patterns
        )

        # Verify prompt contains key information
        assert "30代" in prompt
        assert "500~700万円" in prompt
        assert "つみたてNISA開始" in prompt
        assert "類似ユーザー1人" in prompt
        assert "資産形成について教えてください" in prompt


class TestCollectiveIntelligence:
    """集合知貢献テスト"""

    @pytest.mark.integration
    def test_contribute_to_collective_intelligence(self, mock_data_flywheel_engine, mock_supabase_client):
        """集合知への貢献"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            # Mock user DNA to get persona_hash
            mock_dna_response = MagicMock()
            mock_dna_response.data = [{
                "persona_hash": "abc123"
            }]
            mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_dna_response

            result = mock_data_flywheel_engine.contribute_to_collective_intelligence(
                user_id="test-user-123",
                action="つみたてNISA開始",
                outcome=150000.0,
                success=True
            )

            assert result["contributed"] is True
            assert result["persona_hash"] == "abc123"

            # Verify database operations
            mock_supabase_client.table.assert_called()


class TestBehaviorLogging:
    """行動ログテスト"""

    @pytest.mark.integration
    def test_log_behavior_event(self, mock_data_flywheel_engine, mock_supabase_client):
        """行動イベント記録"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            result = mock_data_flywheel_engine.log_behavior_event(
                user_id="test-user-123",
                event_type="query",
                topic="節税",
                duration_seconds=30,
                scroll_depth=0.8
            )

            assert result["logged"] is True

            # Verify insert was called
            mock_supabase_client.table.assert_called_with("user_behavior_events")

    @pytest.mark.integration
    def test_get_user_behavior_summary(self, mock_data_flywheel_engine, mock_supabase_client):
        """ユーザー行動サマリー取得"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            mock_response = MagicMock()
            mock_response.data = [
                {"event_type": "query", "topic": "節税", "created_at": datetime.now().isoformat()},
                {"event_type": "read", "topic": "NISA", "created_at": datetime.now().isoformat()},
                {"event_type": "query", "topic": "節税", "created_at": datetime.now().isoformat()}
            ]

            mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = mock_response

            summary = mock_data_flywheel_engine.get_user_behavior_summary("test-user-123", days=30)

            assert "top_topics" in summary
            assert "event_counts" in summary
            assert summary["top_topics"][0] == ("節税", 2)  # Most frequent topic


class TestEdgeCases:
    """エッジケーステスト"""

    @pytest.mark.unit
    def test_empty_notes_text(self, mock_data_flywheel_engine, mock_supabase_client):
        """空のノートテキスト"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            with patch.object(mock_data_flywheel_engine.embedding_model, "embed_query", return_value=[0.0] * 768):
                result = mock_data_flywheel_engine.update_financial_dna(
                    user_id="test-user-123",
                    notes_text="",  # Empty
                    monthly_income=500000.0
                )

                # Should still work, just with default embedding
                mock_supabase_client.table.assert_called()

    @pytest.mark.unit
    def test_negative_income(self, mock_data_flywheel_engine, mock_supabase_client):
        """負の収入（検証エラー）"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            with pytest.raises(ValueError):
                mock_data_flywheel_engine.update_financial_dna(
                    user_id="test-user-123",
                    notes_text="Test",
                    monthly_income=-100000.0  # Negative income
                )

    @pytest.mark.unit
    def test_very_long_notes_text(self, mock_data_flywheel_engine, mock_supabase_client):
        """非常に長いノートテキスト"""
        with patch("app.data_flywheel.create_client", return_value=mock_supabase_client):
            with patch.object(mock_data_flywheel_engine.embedding_model, "embed_query", return_value=[0.1] * 768):
                long_text = "あ" * 100000  # 100k characters

                result = mock_data_flywheel_engine.update_financial_dna(
                    user_id="test-user-123",
                    notes_text=long_text,
                    monthly_income=500000.0
                )

                # Should truncate or handle gracefully
                mock_supabase_client.table.assert_called()
