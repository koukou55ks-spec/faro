"""
Pytest Configuration and Fixtures
テスト用共通設定とフィクスチャ
"""

import pytest
import os
from fastapi.testclient import TestClient
from supabase import create_client, Client
from unittest.mock import MagicMock, patch
from typing import Generator
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.production_main import app
from app.data_flywheel import DataFlywheelEngine
from app.auth import AuthService


@pytest.fixture(scope="session")
def test_env():
    """
    テスト環境変数設定
    本番データベースを汚染しないよう、テスト用の環境変数を設定
    """
    os.environ["ENVIRONMENT"] = "test"
    os.environ["SUPABASE_URL"] = os.getenv("SUPABASE_TEST_URL", os.getenv("SUPABASE_URL"))
    os.environ["SUPABASE_ANON_KEY"] = os.getenv("SUPABASE_TEST_ANON_KEY", os.getenv("SUPABASE_ANON_KEY"))
    os.environ["SUPABASE_SERVICE_KEY"] = os.getenv("SUPABASE_TEST_SERVICE_KEY", os.getenv("SUPABASE_SERVICE_KEY"))
    os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "test_key")
    os.environ["SENTRY_DSN"] = ""  # Disable Sentry in tests

    yield

    # Cleanup after all tests
    os.environ["ENVIRONMENT"] = "development"


@pytest.fixture
def client(test_env) -> Generator[TestClient, None, None]:
    """
    FastAPI TestClient
    APIエンドポイントのテスト用
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def supabase_client(test_env) -> Client:
    """
    Supabaseクライアント（テスト用）
    """
    url = os.getenv("SUPABASE_TEST_URL", os.getenv("SUPABASE_URL"))
    key = os.getenv("SUPABASE_TEST_SERVICE_KEY", os.getenv("SUPABASE_SERVICE_KEY"))
    return create_client(url, key)


@pytest.fixture
def mock_auth_user():
    """
    モック認証ユーザー
    JWT検証をスキップして認証済みユーザーをシミュレート
    """
    return {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "role": "authenticated"
    }


@pytest.fixture
def mock_jwt_token():
    """
    モックJWTトークン
    """
    return "mock.jwt.token"


@pytest.fixture
def auth_headers(mock_jwt_token):
    """
    認証ヘッダー
    """
    return {
        "Authorization": f"Bearer {mock_jwt_token}",
        "Content-Type": "application/json"
    }


@pytest.fixture
def mock_verify_jwt(mock_auth_user):
    """
    verify_jwt関数のモック
    テスト中は実際のJWT検証をスキップ
    """
    with patch("app.auth.verify_jwt") as mock:
        mock.return_value = mock_auth_user
        yield mock


@pytest.fixture
def sample_financial_dna():
    """
    サンプル財務DNAデータ
    """
    return {
        "user_id": "test-user-123",
        "notes_text": "副業で月10万円の収入あり。NISAで月3万円積立中。",
        "monthly_income": 500000.00,
        "monthly_expenses": {
            "rent": 100000,
            "food": 50000,
            "utilities": 20000,
            "entertainment": 30000
        },
        "savings_rate": 0.40,
        "assets": {
            "cash": 3000000,
            "stocks": 1500000,
            "real_estate": 0
        },
        "tax_status": {
            "filing_type": "給与所得者",
            "deductions": ["社会保険料控除", "生命保険料控除"]
        }
    }


@pytest.fixture
def sample_user_profile():
    """
    サンプルユーザープロファイル
    """
    return {
        "age_group": "30代",
        "occupation": "会社員（エンジニア）",
        "income_level": "500~700万円",
        "goals": ["節税", "資産形成", "FIRE"],
        "interests": ["インデックス投資", "副業", "不動産投資"]
    }


@pytest.fixture
def mock_gemini_response():
    """
    Gemini APIレスポンスのモック
    """
    mock_response = MagicMock()
    mock_response.text = "これはテスト用のGemini APIレスポンスです。"
    return mock_response


@pytest.fixture
def mock_data_flywheel_engine(mock_gemini_response):
    """
    DataFlywheelEngineのモック
    外部API呼び出しをスキップしてテストを高速化
    """
    with patch("app.data_flywheel.genai.GenerativeModel") as mock_model:
        mock_model.return_value.generate_content.return_value = mock_gemini_response
        engine = DataFlywheelEngine()
        yield engine


@pytest.fixture(scope="function")
def clean_test_data(supabase_client):
    """
    テストデータのクリーンアップ
    各テスト実行後にテストユーザーのデータを削除
    """
    yield

    # クリーンアップ: テストユーザーのデータを削除
    try:
        test_user_ids = ["test-user-123", "test-user-456", "test-user-789"]

        for user_id in test_user_ids:
            # user_financial_dna
            supabase_client.table("user_financial_dna").delete().eq("user_id", user_id).execute()

            # user_behavior_events
            supabase_client.table("user_behavior_events").delete().eq("user_id", user_id).execute()

            # aggregated_patterns (persona_hash based)
            # Note: Don't delete aggregated patterns as they're shared
    except Exception as e:
        print(f"Cleanup warning: {e}")


@pytest.fixture
def mock_supabase_client():
    """
    完全モックのSupabaseクライアント
    ネットワーク呼び出しを一切行わない（高速テスト用）
    """
    mock_client = MagicMock(spec=Client)

    # Mock table operations
    mock_table = MagicMock()
    mock_table.select.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.update.return_value = mock_table
    mock_table.delete.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.execute.return_value = MagicMock(data=[])

    mock_client.table.return_value = mock_table

    # Mock RPC
    mock_client.rpc.return_value = MagicMock(execute=lambda: MagicMock(data=[]))

    return mock_client


@pytest.fixture
def disable_auth():
    """
    認証を完全に無効化するフィクスチャ
    統合テストで認証をスキップしたい場合に使用
    """
    with patch("app.auth.get_current_user") as mock_get_current_user:
        mock_get_current_user.return_value = {
            "user_id": "test-user-123",
            "email": "test@example.com"
        }
        yield


# Pytest configuration
def pytest_configure(config):
    """
    Pytest起動時の設定
    """
    config.addinivalue_line(
        "markers", "integration: mark test as integration test (requires real DB)"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test (no external dependencies)"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
