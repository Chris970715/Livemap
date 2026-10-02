"""
Unit tests for the Gemini embedding provider (app/agent/embeddings.py).

Only the Gemini API call (`_embed_batch`) is mocked.
"""

from unittest.mock import patch

import numpy as np
import pytest

from app.agent import embeddings
from app.agent.embeddings import EMBEDDING_DIM, GeminiEmbedder, load_embedder


def _fake_vector(text: str) -> list[float]:
    """Deterministic, non-normalized vector per text."""
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    return (rng.random(EMBEDDING_DIM) * 10 + 1).tolist()


@pytest.fixture
def embedder():
    enc = GeminiEmbedder(api_key="test-key", model="gemini-embedding-001")
    calls: list[list[str]] = []

    def fake_batch(texts):
        calls.append(list(texts))
        return [_fake_vector(t) for t in texts]

    with patch.object(enc, "_embed_batch", side_effect=fake_batch):
        yield enc, calls


class TestGeminiEmbedderEncode:
    def test_should_return_unit_vectors_of_db_dimension(self, embedder):
        enc, _ = embedder
        vectors = enc.encode(["missile strike", "ceasefire talks"])

        assert vectors.shape == (2, EMBEDDING_DIM)
        np.testing.assert_allclose(np.linalg.norm(vectors, axis=1), 1.0, rtol=1e-5)

    def test_should_return_1d_vector_when_given_single_string(self, embedder):
        enc, _ = embedder
        assert enc.encode("missile strike").shape == (EMBEDDING_DIM,)

    def test_should_split_requests_into_batches_of_100(self, embedder):
        enc, calls = embedder
        enc.encode([f"headline {i}" for i in range(250)])

        assert [len(c) for c in calls] == [100, 100, 50]

    def test_should_not_call_api_again_for_cached_texts(self, embedder):
        enc, calls = embedder
        first = enc.encode(["a", "b"])
        second = enc.encode(["b", "a"])

        assert len(calls) == 1
        np.testing.assert_allclose(first[::-1], second)

    def test_should_send_duplicates_once(self, embedder):
        enc, calls = embedder
        enc.encode(["same", "same", "other"])

        assert calls == [["same", "other"]]

    def test_should_return_zero_vector_for_blank_text_without_api_call(self, embedder):
        enc, calls = embedder
        vectors = enc.encode(["", "   "])

        assert calls == []
        assert not vectors.any()

    def test_should_never_return_zero_vectors_when_cache_evicts(self, embedder):
        """Regression: eviction during a call must not drop that call's own results."""
        enc, _ = embedder
        with patch.object(embeddings, "_CACHE_MAX_ENTRIES", 3):
            enc.encode(["a", "b", "c"])  # fill the cache
            vectors = enc.encode(["a", "b", "c", "d", "e", "f", "g"])

        assert np.all(np.linalg.norm(vectors, axis=1) > 0.99)
        assert len(enc._cache) == 3


class TestLoadEmbedder:
    def test_should_reuse_one_gemini_client_per_process(self):
        with (
            patch.object(embeddings.agent_settings, "embedding_provider", "gemini"),
            patch.object(embeddings.agent_settings, "gemini_api_key", "test-key"),
            patch.dict(embeddings._embedders, clear=True),
        ):
            first = load_embedder()
            second = load_embedder()

        assert isinstance(first, GeminiEmbedder)
        assert first is second

    def test_should_return_none_when_gemini_key_missing(self):
        with (
            patch.object(embeddings.agent_settings, "embedding_provider", "gemini"),
            patch.object(embeddings.agent_settings, "gemini_api_key", ""),
            patch.dict(embeddings._embedders, clear=True),
        ):
            assert load_embedder() is None

    def test_should_return_none_when_provider_disabled(self):
        with (
            patch.object(embeddings.agent_settings, "embedding_provider", "none"),
            patch.dict(embeddings._embedders, clear=True),
        ):
            assert load_embedder() is None


class TestGeminiSimilarityThresholds:
    """Gemini embeddings need higher thresholds than bge-m3 (see agent/config.py)."""

    def test_should_use_gemini_thresholds_when_provider_is_gemini(self):
        from app.agent.config import GEMINI_SIMILARITY_THRESHOLDS, AgentSettings

        settings = AgentSettings(_env_file=None, embedding_provider="gemini", gemini_api_key="k")

        for field, value in GEMINI_SIMILARITY_THRESHOLDS.items():
            assert getattr(settings, field) == value

    def test_should_keep_bge_thresholds_when_provider_is_local(self):
        from app.agent.config import AgentSettings

        settings = AgentSettings(_env_file=None, embedding_provider="local")

        assert settings.dedup_duplicate_threshold == 0.75
        assert settings.cross_source_similarity_threshold == 0.70

    def test_should_respect_explicit_threshold_with_gemini(self):
        from app.agent.config import AgentSettings

        settings = AgentSettings(
            _env_file=None,
            embedding_provider="gemini",
            gemini_api_key="k",
            dedup_duplicate_threshold=0.9,
        )

        assert settings.dedup_duplicate_threshold == 0.9
        assert settings.dedup_potential_threshold == 0.83

    def test_should_resolve_auto_to_gemini_without_local_model(self):
        from app.agent.config import AgentSettings

        with patch("importlib.util.find_spec", return_value=None):
            settings = AgentSettings(_env_file=None, embedding_provider="auto", gemini_api_key="k")

        assert settings.resolved_embedding_provider() == "gemini"
        assert settings.dedup_duplicate_threshold == 0.88

    def test_should_resolve_gemini_without_key_to_none_and_keep_bge_thresholds(self):
        from app.agent.config import AgentSettings

        settings = AgentSettings(_env_file=None, embedding_provider="gemini", gemini_api_key="")

        assert settings.resolved_embedding_provider() == "none"
        assert settings.cross_source_similarity_threshold == 0.70
