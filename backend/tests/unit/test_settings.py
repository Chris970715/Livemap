"""
Unit tests for deployment-related settings (app/core/config.py).
"""

import pytest

from app.core.config import Settings


def _settings(**overrides) -> Settings:
    return Settings(AUTH_SECRET="test-secret", **overrides)


class TestDatabaseUrlNormalization:
    @pytest.mark.parametrize(
        ("raw", "expected"),
        [
            # Neon connection string as copied from the dashboard
            (
                "postgresql://u:p@ep-x.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
                "postgresql+asyncpg://u:p@ep-x.us-east-1.aws.neon.tech/neondb?ssl=require",
            ),
            # Heroku/Render style scheme
            ("postgres://u:p@host:5432/db", "postgresql+asyncpg://u:p@host:5432/db"),
            # Already asyncpg: untouched
            (
                "postgresql+asyncpg://livemap:livemap123@localhost:5432/livemap",
                "postgresql+asyncpg://livemap:livemap123@localhost:5432/livemap",
            ),
        ],
    )
    def test_should_convert_provider_urls_for_asyncpg(self, raw, expected):
        assert _settings(DATABASE_URL=raw).DATABASE_URL == expected

    def test_should_leave_non_postgres_urls_alone(self):
        url = "sqlite+aiosqlite:///./test.db"
        assert _settings(DATABASE_URL=url).DATABASE_URL == url


class TestCorsOrigins:
    def test_should_split_comma_separated_origins_and_strip_trailing_slash(self):
        settings = _settings(FRONTEND_URL="https://huginn.vercel.app/, http://localhost:3010")
        assert settings.cors_origins == ["https://huginn.vercel.app", "http://localhost:3010"]


class TestGroqReasoningKwargs:
    def test_should_lower_reasoning_effort_for_gpt_oss_models(self):
        from app.agent.config import groq_reasoning_kwargs

        assert groq_reasoning_kwargs("openai/gpt-oss-20b") == {"reasoning_effort": "low"}

    def test_should_send_nothing_extra_for_non_reasoning_models(self):
        from app.agent.config import groq_reasoning_kwargs

        assert groq_reasoning_kwargs("qwen/qwen3.8-27b") == {}
        assert groq_reasoning_kwargs("gpt-4o-mini") == {}
