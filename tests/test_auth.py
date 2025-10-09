"""
Authentication System Tests
認証システムのテスト
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from app.auth import verify_jwt, get_current_user, AuthService, AuthError
import jwt
import os


class TestJWTVerification:
    """JWT検証テスト"""

    @pytest.mark.unit
    def test_verify_jwt_success(self):
        """正常なJWT検証"""
        # Create valid test JWT
        jwt_secret = "test-secret-key"
        payload = {
            "sub": "test-user-123",
            "email": "test@example.com",
            "role": "authenticated",
            "aud": "authenticated"
        }
        token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": jwt_secret}):
            result = verify_jwt(token)

            assert result["user_id"] == "test-user-123"
            assert result["email"] == "test@example.com"
            assert result["role"] == "authenticated"

    @pytest.mark.unit
    def test_verify_jwt_invalid_token(self):
        """無効なトークンでエラー"""
        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": "test-secret"}):
            with pytest.raises(AuthError, match="Invalid token"):
                verify_jwt("invalid.token.here")

    @pytest.mark.unit
    def test_verify_jwt_expired_token(self):
        """期限切れトークンでエラー"""
        jwt_secret = "test-secret-key"
        payload = {
            "sub": "test-user-123",
            "email": "test@example.com",
            "aud": "authenticated",
            "exp": 0  # Expired timestamp
        }
        token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": jwt_secret}):
            with pytest.raises(AuthError, match="Token expired"):
                verify_jwt(token)

    @pytest.mark.unit
    def test_verify_jwt_missing_secret(self):
        """JWT秘密鍵が未設定"""
        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": ""}, clear=True):
            with pytest.raises(ValueError, match="SUPABASE_JWT_SECRET"):
                verify_jwt("any.token.here")


class TestGetCurrentUser:
    """get_current_user依存性注入テスト"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_current_user_success(self, mock_auth_user):
        """正常なユーザー取得"""
        mock_credentials = MagicMock()
        mock_credentials.credentials = "valid.jwt.token"

        with patch("app.auth.verify_jwt", return_value=mock_auth_user):
            result = await get_current_user(mock_credentials)

            assert result["user_id"] == "test-user-123"
            assert result["email"] == "test@example.com"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self):
        """無効なトークンでHTTPException"""
        mock_credentials = MagicMock()
        mock_credentials.credentials = "invalid.token"

        with patch("app.auth.verify_jwt", side_effect=AuthError("Invalid token")):
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(mock_credentials)

            assert exc_info.value.status_code == 401
            assert "Invalid token" in exc_info.value.detail


class TestAuthService:
    """AuthServiceクラステスト"""

    @pytest.fixture
    def mock_supabase_auth(self):
        """Supabase Auth APIのモック"""
        mock_client = MagicMock()
        mock_auth = MagicMock()
        mock_client.auth = mock_auth
        return mock_client, mock_auth

    @pytest.mark.unit
    def test_sign_up_success(self, mock_supabase_auth):
        """ユーザー登録成功"""
        mock_client, mock_auth = mock_supabase_auth

        # Mock successful signup response
        mock_response = MagicMock()
        mock_response.user.id = "new-user-123"
        mock_response.user.email = "newuser@example.com"
        mock_response.session.access_token = "access.token.here"
        mock_response.session.refresh_token = "refresh.token.here"
        mock_auth.sign_up.return_value = mock_response

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            result = auth_service.sign_up(
                email="newuser@example.com",
                password="SecurePass123!",
                metadata={"name": "Test User"}
            )

            assert result["user_id"] == "new-user-123"
            assert result["email"] == "newuser@example.com"
            assert result["access_token"] == "access.token.here"
            assert result["refresh_token"] == "refresh.token.here"

            # Verify sign_up was called correctly
            mock_auth.sign_up.assert_called_once()
            call_args = mock_auth.sign_up.call_args[0][0]
            assert call_args["email"] == "newuser@example.com"
            assert call_args["password"] == "SecurePass123!"

    @pytest.mark.unit
    def test_sign_up_duplicate_email(self, mock_supabase_auth):
        """重複メールアドレスでエラー"""
        mock_client, mock_auth = mock_supabase_auth
        mock_auth.sign_up.side_effect = Exception("User already exists")

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            with pytest.raises(AuthError, match="Signup failed"):
                auth_service.sign_up("existing@example.com", "password")

    @pytest.mark.unit
    def test_sign_in_success(self, mock_supabase_auth):
        """ログイン成功"""
        mock_client, mock_auth = mock_supabase_auth

        mock_response = MagicMock()
        mock_response.user.id = "test-user-123"
        mock_response.user.email = "test@example.com"
        mock_response.session.access_token = "access.token"
        mock_response.session.refresh_token = "refresh.token"
        mock_auth.sign_in_with_password.return_value = mock_response

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            result = auth_service.sign_in("test@example.com", "password")

            assert result["user_id"] == "test-user-123"
            assert result["access_token"] == "access.token"
            assert result["refresh_token"] == "refresh.token"

    @pytest.mark.unit
    def test_sign_in_invalid_credentials(self, mock_supabase_auth):
        """無効な認証情報でエラー"""
        mock_client, mock_auth = mock_supabase_auth
        mock_auth.sign_in_with_password.side_effect = Exception("Invalid credentials")

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            with pytest.raises(AuthError, match="Signin failed"):
                auth_service.sign_in("test@example.com", "wrongpassword")

    @pytest.mark.unit
    def test_refresh_token_success(self, mock_supabase_auth):
        """トークンリフレッシュ成功"""
        mock_client, mock_auth = mock_supabase_auth

        mock_response = MagicMock()
        mock_response.session.access_token = "new.access.token"
        mock_response.session.refresh_token = "new.refresh.token"
        mock_auth.refresh_session.return_value = mock_response

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            result = auth_service.refresh_token("old.refresh.token")

            assert result["access_token"] == "new.access.token"
            assert result["refresh_token"] == "new.refresh.token"

    @pytest.mark.unit
    def test_refresh_token_expired(self, mock_supabase_auth):
        """期限切れリフレッシュトークン"""
        mock_client, mock_auth = mock_supabase_auth
        mock_auth.refresh_session.side_effect = Exception("Invalid refresh token")

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            with pytest.raises(AuthError, match="Token refresh failed"):
                auth_service.refresh_token("expired.token")

    @pytest.mark.unit
    def test_get_user_success(self, mock_supabase_auth):
        """ユーザー情報取得成功"""
        mock_client, mock_auth = mock_supabase_auth

        mock_response = MagicMock()
        mock_response.user.id = "test-user-123"
        mock_response.user.email = "test@example.com"
        mock_response.user.user_metadata = {"name": "Test User"}
        mock_auth.get_user.return_value = mock_response

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            result = auth_service.get_user("valid.access.token")

            assert result["user_id"] == "test-user-123"
            assert result["email"] == "test@example.com"

    @pytest.mark.unit
    def test_sign_out_success(self, mock_supabase_auth):
        """サインアウト成功"""
        mock_client, mock_auth = mock_supabase_auth
        mock_auth.sign_out.return_value = None

        with patch("app.auth.create_client", return_value=mock_client):
            auth_service = AuthService()
            result = auth_service.sign_out("access.token")

            assert result["success"] is True
            mock_auth.sign_out.assert_called_once()


class TestAuthIntegration:
    """認証統合テスト（実際のAPIエンドポイント）"""

    @pytest.mark.integration
    def test_signup_endpoint(self, client, mock_supabase_client):
        """POST /auth/signup エンドポイント"""
        with patch("app.production_main.auth_service.supabase", mock_supabase_client):
            mock_response = MagicMock()
            mock_response.user.id = "new-user-123"
            mock_response.user.email = "newuser@example.com"
            mock_response.session.access_token = "access.token"
            mock_response.session.refresh_token = "refresh.token"

            mock_supabase_client.auth.sign_up.return_value = mock_response

            response = client.post("/auth/signup", json={
                "email": "newuser@example.com",
                "password": "SecurePass123!"
            })

            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["user_id"] == "new-user-123"

    @pytest.mark.integration
    def test_signin_endpoint(self, client, mock_supabase_client):
        """POST /auth/signin エンドポイント"""
        with patch("app.production_main.auth_service.supabase", mock_supabase_client):
            mock_response = MagicMock()
            mock_response.user.id = "test-user-123"
            mock_response.session.access_token = "access.token"
            mock_response.session.refresh_token = "refresh.token"

            mock_supabase_client.auth.sign_in_with_password.return_value = mock_response

            response = client.post("/auth/signin", json={
                "email": "test@example.com",
                "password": "password"
            })

            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data

    @pytest.mark.integration
    def test_protected_endpoint_without_auth(self, client):
        """認証なしで保護されたエンドポイントにアクセス"""
        response = client.post("/financial-dna/update-auth", json={
            "notes_text": "Test",
            "monthly_income": 500000
        })

        assert response.status_code == 403  # Forbidden

    @pytest.mark.integration
    def test_protected_endpoint_with_auth(self, client, mock_verify_jwt, auth_headers):
        """認証ありで保護されたエンドポイントにアクセス"""
        with patch("app.production_main.data_flywheel_engine.update_financial_dna") as mock_update:
            mock_update.return_value = MagicMock(
                user_id="test-user-123",
                monthly_income=500000.0
            )

            response = client.post(
                "/financial-dna/update-auth",
                headers=auth_headers,
                json={
                    "notes_text": "Test notes",
                    "monthly_income": 500000
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert data["user_id"] == "test-user-123"
