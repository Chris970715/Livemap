"""
Embedding provider selection.

The pipeline only needs an object with a SentenceTransformer-style
`.encode(texts, normalize_embeddings=True)` method. Two backends:

- local:  BAAI/bge-m3 via sentence-transformers (needs ~2GB RAM incl. torch;
          install with `uv sync --group ml`)
- gemini: gemini-embedding-001 via API, truncated to EMBEDDING_DIM so vectors
          fit the existing Vector(1024) columns (free tier, fits 512MB hosts)

AGENT_EMBEDDING_PROVIDER=auto picks local when sentence-transformers is
installed, otherwise Gemini when AGENT_GEMINI_API_KEY is set (see
AgentSettings.resolved_embedding_provider, which also picks the thresholds).

`.encode()` is blocking (network or CPU); call it via asyncio.to_thread from
async code.
"""

import logging
import threading
from collections import OrderedDict

import numpy as np
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import agent_settings

logger = logging.getLogger(__name__)

# Matches the Vector(1024) columns on events/feeds (bge-m3 native size)
EMBEDDING_DIM = 1024

# Gemini accepts at most 100 texts per embed request
_GEMINI_BATCH_SIZE = 100
_GEMINI_TIMEOUT_MS = 20_000
_CACHE_MAX_ENTRIES = 2000


class GeminiEmbedder:
    """SentenceTransformer-compatible encoder backed by the Gemini API."""

    def __init__(self, api_key: str, model: str, dim: int = EMBEDDING_DIM):
        from google import genai
        from google.genai import types

        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=_GEMINI_TIMEOUT_MS),
        )
        self.model = model
        self.dim = dim
        # LRU cache: the scanner re-embeds the same headlines across steps and scans
        self._cache: OrderedDict[str, np.ndarray] = OrderedDict()
        self._lock = threading.Lock()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20), reraise=True)
    def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        from google.genai import types

        response = self._client.models.embed_content(
            model=self.model,
            contents=texts,
            config=types.EmbedContentConfig(
                output_dimensionality=self.dim,
                task_type="SEMANTIC_SIMILARITY",
            ),
        )
        return [e.values for e in response.embeddings]

    def encode(
        self,
        sentences: str | list[str],
        normalize_embeddings: bool = True,
        show_progress_bar: bool = False,
        **_: object,
    ) -> np.ndarray:
        single = isinstance(sentences, str)
        texts = [sentences] if single else list(sentences)
        unique = [t for t in dict.fromkeys(texts) if t.strip()]

        # Resolve this call's vectors locally so cache eviction can't drop them
        found: dict[str, np.ndarray] = {}
        with self._lock:
            for text in unique:
                if text in self._cache:
                    self._cache.move_to_end(text)
                    found[text] = self._cache[text]

        pending = [t for t in unique if t not in found]
        for start in range(0, len(pending), _GEMINI_BATCH_SIZE):
            batch = pending[start:start + _GEMINI_BATCH_SIZE]
            for text, values in zip(batch, self._embed_batch(batch)):
                found[text] = np.asarray(values, dtype=np.float32)

        with self._lock:
            for text in pending:
                self._cache[text] = found[text]
            while len(self._cache) > _CACHE_MAX_ENTRIES:
                self._cache.popitem(last=False)

        zero = np.zeros(self.dim, dtype=np.float32)  # blank input
        vectors = np.stack([found.get(t, zero) for t in texts])

        # Gemini only normalizes the full 3072-dim output; truncated ones need it
        if normalize_embeddings:
            norms = np.linalg.norm(vectors, axis=1, keepdims=True)
            vectors = vectors / np.clip(norms, 1e-12, None)

        return vectors[0] if single else vectors


# One encoder per process: a new NewsScanner (with two embedding consumers) is
# built every scan, and bge-m3 alone is ~2GB
_embedders: dict[tuple[str, str], object] = {}
_embedders_lock = threading.Lock()


def load_embedder(local_model: str = "BAAI/bge-m3"):
    """Return the shared encoder for the configured provider, or None (text-similarity fallback)."""
    provider = agent_settings.resolved_embedding_provider()
    key = (provider, local_model)
    with _embedders_lock:
        if key not in _embedders:
            _embedders[key] = _create_embedder(provider, local_model)
        return _embedders[key]


def _create_embedder(provider: str, local_model: str):
    if provider == "local":
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            logger.error("sentence-transformers not installed. Run: uv sync --group ml")
            return None
        logger.info(f"Loading local embedding model ({local_model})...")
        return SentenceTransformer(local_model)

    if provider == "gemini":
        logger.info(
            f"Using Gemini embeddings ({agent_settings.gemini_embedding_model}, {EMBEDDING_DIM} dims)"
        )
        return GeminiEmbedder(
            api_key=agent_settings.gemini_api_key,
            model=agent_settings.gemini_embedding_model,
        )

    if agent_settings.embedding_provider in ("auto", "gemini"):
        logger.warning("No embedding provider available (AGENT_GEMINI_API_KEY is not set)")
    return None
