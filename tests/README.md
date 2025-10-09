# Faro v2.0 Test Suite

## Overview

本テストスイートは、Faro v2.0の品質を保証するための包括的なテストを提供します。

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Pytest fixtures and configuration
├── test_auth.py             # Authentication system tests
├── test_data_flywheel.py    # Data flywheel engine tests
├── test_api.py              # API endpoint tests
└── README.md                # This file
```

## Test Categories

### 1. Unit Tests (`@pytest.mark.unit`)
- **特徴**: 外部依存なし、高速実行
- **対象**: 個別関数、クラスメソッドのロジック
- **実行**: `pytest -m unit`

### 2. Integration Tests (`@pytest.mark.integration`)
- **特徴**: データベース、外部API使用
- **対象**: エンドポイント、データフロー
- **実行**: `pytest -m integration`

### 3. Slow Tests (`@pytest.mark.slow`)
- **特徴**: 実行時間が長い（>5秒）
- **実行**: `pytest -m "not slow"` (除外)

## Setup

### 1. Install Test Dependencies

```bash
pip install -r requirements_v2.txt
pip install pytest pytest-asyncio pytest-cov pytest-xdist
```

### 2. Configure Test Environment

Create `.env.test` file (optional):

```bash
# Test Database (separate from production!)
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your-test-anon-key
SUPABASE_TEST_SERVICE_KEY=your-test-service-key

# AI APIs (can reuse production keys for tests)
GEMINI_API_KEY=your-gemini-key

# Disable Sentry in tests
SENTRY_DSN=
```

**IMPORTANT**: Use a separate Supabase project for testing to avoid polluting production data!

### 3. Setup Test Database

Run migrations on test database:

```bash
# Connect to test Supabase project
supabase link --project-ref your-test-project-ref

# Run migrations
supabase db push
```

Or manually run SQL migrations:

```sql
-- supabase/migrations/001_initial_schema.sql
-- supabase/migrations/002_data_flywheel_schema.sql
```

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test Category

```bash
# Unit tests only (fast)
pytest -m unit

# Integration tests only
pytest -m integration

# Exclude slow tests
pytest -m "not slow"

# Authentication tests
pytest -m auth

# Data flywheel tests
pytest -m flywheel

# API tests
pytest -m api
```

### Run Specific Test File

```bash
pytest tests/test_auth.py
pytest tests/test_data_flywheel.py
pytest tests/test_api.py
```

### Run Specific Test Function

```bash
pytest tests/test_auth.py::TestJWTVerification::test_verify_jwt_success
pytest tests/test_api.py::TestHealthEndpoint::test_health_check
```

### Verbose Output

```bash
pytest -v
pytest -vv  # Extra verbose
```

### Show Print Statements

```bash
pytest -s
```

### Stop on First Failure

```bash
pytest -x
```

### Run Last Failed Tests

```bash
pytest --lf
```

### Parallel Execution (Fast)

```bash
# Install pytest-xdist first
pip install pytest-xdist

# Run tests in parallel (auto-detect CPU cores)
pytest -n auto
```

## Code Coverage

### Generate Coverage Report

```bash
# Install pytest-cov
pip install pytest-cov

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Open HTML report
start htmlcov/index.html  # Windows
open htmlcov/index.html   # Mac
```

### Coverage Goals

- **Overall**: >80%
- **Critical paths** (auth, data_flywheel): >90%
- **API endpoints**: >85%

## Test Fixtures

### Available Fixtures (conftest.py)

- `client`: FastAPI TestClient
- `supabase_client`: Supabase test client
- `mock_auth_user`: Mock authenticated user
- `mock_jwt_token`: Mock JWT token
- `auth_headers`: Authorization headers
- `mock_verify_jwt`: Mock JWT verification
- `sample_financial_dna`: Sample financial DNA data
- `sample_user_profile`: Sample user profile
- `mock_gemini_response`: Mock Gemini API response
- `mock_data_flywheel_engine`: Mock data flywheel engine
- `clean_test_data`: Auto cleanup after tests
- `mock_supabase_client`: Fully mocked Supabase (no network)
- `disable_auth`: Disable authentication for testing

### Using Fixtures

```python
def test_example(client, mock_auth_user, auth_headers):
    """Example test using fixtures"""
    response = client.post(
        "/some-endpoint",
        headers=auth_headers,
        json={"data": "test"}
    )
    assert response.status_code == 200
```

## Writing New Tests

### Test Structure

```python
import pytest

class TestFeatureName:
    """テストクラス: 機能名"""

    @pytest.mark.unit
    def test_specific_behavior(self, fixture1, fixture2):
        """テスト内容の説明"""
        # Arrange
        input_data = {"key": "value"}

        # Act
        result = function_under_test(input_data)

        # Assert
        assert result == expected_output

    @pytest.mark.integration
    def test_integration_scenario(self, client):
        """統合テストの説明"""
        response = client.post("/endpoint", json={"data": "test"})
        assert response.status_code == 200
```

### Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Clear test names**: `test_<what>_<condition>_<expected>`
4. **Use fixtures** for common setup
5. **Mock external dependencies** (APIs, databases)
6. **Clean up after tests** (use `clean_test_data` fixture)
7. **Mark tests appropriately** (`@pytest.mark.unit`, etc.)

## Continuous Integration (CI)

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements_v2.txt
      - run: pip install pytest pytest-asyncio pytest-cov
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

#### 1. Import Errors

```bash
# Solution: Add project root to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:."  # Linux/Mac
set PYTHONPATH=%PYTHONPATH%;.        # Windows
```

Or use `sys.path.insert(0, ...)` in `conftest.py` (already configured).

#### 2. Database Connection Errors

- **Problem**: Cannot connect to test database
- **Solution**: Check `.env` or `.env.test` configuration
- **Verify**: `SUPABASE_TEST_URL` and `SUPABASE_TEST_SERVICE_KEY` are set

#### 3. Async Test Errors

```bash
# Problem: "RuntimeError: Event loop is closed"
# Solution: Install pytest-asyncio
pip install pytest-asyncio
```

#### 4. Fixture Not Found

- **Problem**: `fixture 'xyz' not found`
- **Solution**: Check `conftest.py` has the fixture defined
- **Verify**: Fixture scope is correct (`session`, `module`, `function`)

#### 5. Tests Polluting Each Other

- **Problem**: Tests pass individually but fail together
- **Solution**: Use `clean_test_data` fixture
- **Verify**: Tests are properly isolated with unique test data

## Performance

### Expected Test Times

- **Unit tests**: <1 second per test
- **Integration tests**: 1-5 seconds per test
- **Full suite**: ~2-5 minutes (without parallel execution)
- **Full suite (parallel)**: ~30-60 seconds

### Optimization Tips

1. **Use mocking** for external APIs (faster than real calls)
2. **Run unit tests first** (fail fast)
3. **Parallel execution** (`pytest -n auto`)
4. **Skip slow tests** in development (`pytest -m "not slow"`)
5. **Use test database caching** (persistent test data for read-only tests)

## Test Data Management

### Creating Test Users

```python
# In conftest.py or test file
@pytest.fixture
def test_user(supabase_client):
    """Create test user"""
    user_id = "test-user-123"

    # Insert test user
    supabase_client.table("user_financial_dna").insert({
        "user_id": user_id,
        "monthly_income": 500000.0,
        ...
    }).execute()

    yield user_id

    # Cleanup
    supabase_client.table("user_financial_dna").delete().eq("user_id", user_id).execute()
```

### Using Factories (Optional)

For complex test data, consider using `factory_boy`:

```bash
pip install factory-boy
```

```python
import factory

class FinancialDNAFactory(factory.Factory):
    class Meta:
        model = dict

    user_id = factory.Sequence(lambda n: f"test-user-{n}")
    monthly_income = 500000.0
    savings_rate = 0.40
```

## Security

### Test Database Security

- **Never use production database** for tests
- **Use separate Supabase project** for testing
- **Row Level Security (RLS)** should be tested
- **API keys** should be test-only keys (not production)

### Sensitive Data in Tests

- **Never commit real credentials** to Git
- **Use environment variables** for secrets
- **Mock sensitive operations** (payments, external APIs)

## Next Steps

1. **Increase coverage**: Aim for >80% overall coverage
2. **Add performance tests**: Use `pytest-benchmark`
3. **Add load tests**: Use `locust` or `k6`
4. **Add E2E tests**: Use `playwright` for frontend
5. **Setup CI/CD**: Automate testing on push/PR

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Supabase Testing](https://supabase.com/docs/guides/testing)
- [Coverage.py](https://coverage.readthedocs.io/)
