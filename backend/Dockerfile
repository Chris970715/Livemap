# LiveMap Backend — FastAPI + AI news pipeline
#
# Sized for small hosts (Render free: 512MB RAM). The local bge-m3 model
# (torch) is not installed; embeddings come from the Gemini API
# (AGENT_EMBEDDING_PROVIDER=gemini, see app/agent/embeddings.py).

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

COPY --from=ghcr.io/astral-sh/uv:0.10 /uv /usr/local/bin/uv

WORKDIR /app

# Dependencies first for layer caching (no dev / local-embeddings groups)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/logs \
    && chown app /app/logs
USER app

EXPOSE 8000

# Render injects $PORT; migrations are idempotent and run on every boot
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
