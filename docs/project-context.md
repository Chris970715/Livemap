# Huginn 프로젝트 컨텍스트

> 작성일: 2026-03-31
> 여러 세션에서 참조하는 프로젝트 배경/아키텍처 문서.

## 프로젝트 히스토리

### 원래 프로젝트: Livemap (2025.02 ~ 2026.02)
- 실시간 전쟁/안보 뉴스 수집 AI 플랫폼
- GDELT 등 다중 소스에서 뉴스 수집 → LLM 팩트체크 → 이중언어(한/영) 기사 생성 → 지도 표시
- 2026.02에 Grapoll(여론조사 플랫폼)로 리팩토링됨

### Grapoll 리팩토링 (2026.02.11)
- PR #25 (backend)에서 agent/mcp/news 코드 213파일 삭제, poll 시스템으로 교체
- 프론트엔드도 client-v1 → 새 client로 완전 교체
- Grapoll은 현재 `/Users/iyeonsang/Desktop/project/letsgugu/`에서 별도 운영

### Huginn 복원 (2026.03.31)
- 구버전 Livemap이 다시 필요해져서 git history에서 복원
- Backend: `live-map/server` repo의 commit `2bba1ee` (PR #24 merge, Grapoll 직전)
- Client: `live-map/client-v1` repo 전체
- monorepo로 통합: `https://github.com/lofcgi/huginn`
- Claude Code 셋업: letsgugu 방법론 그대로 적용

## 아키텍처

### 파이프라인 흐름
```
[수집] GDELT Trigger (15분 주기)
  ↓
[필터] LLM Classifier (gpt-4o-mini via OpenAI) — 뉴스 여부/카테고리/중요도 판단
  ↓
[검증] ClaimVerificationAgent v3 — 5단계 팩트체크
  ├── Stage 1: Claim Extraction (VeriScore 방식)
  ├── Stage 1.5: Deduplication (hash + semantic via pgvector)
  ├── Stage 2: Evidence Retrieval (GDELT, DDG, Tavily)
  ├── Stage 3: QA-Based Verification (per-claim LLM)
  └── Stage 4: Verdict Aggregation
  ↓
[생성] Bilingual Article Generator — AP Style 한/영 기사 생성
  ↓
[저장] ArticleService → Event + Article 테이블 (PostgreSQL + pgvector)
  ↓
[표시] /api/v1/feeds → Client 지도 + 피드 카드 + 모달
```

### 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | FastAPI 0.115+, SQLAlchemy async, asyncpg, pgvector, LangGraph |
| Client | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Leaflet, Jotai |
| DB | PostgreSQL 16 + pgvector (로컬 Docker `livemap-db`) |
| AI | LangGraph agent, gpt-4o-mini (OpenAI), BAAI/bge-m3 (embeddings) |
| LLM Classifier | gpt-4o-mini (OpenAI API, Deepinfra 설정을 OpenAI로 전환) |

### 데이터 모델 (핵심)

| 모델 | 테이블 | 역할 |
|------|--------|------|
| Event | events | 뉴스 이벤트 (dedup용 hash + embedding, location, category) |
| Article | articles | 이중언어 기사 (headline/lead/nut_graph/body EN+KO, verification 메타) |
| Feed | feeds | 구버전 raw trigger data (현재 미사용, articles로 대체) |

### API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/v1/feeds?category=WAR&subCategory=ru-uk` | 피드 목록 (articles 기반) |
| `GET /api/v1/feeds/{id}` | 피드 상세 |
| `POST /api/v1/agent/investigate` | 수동 investigation 트리거 (DB 저장 포함) |
| `GET /api/v1/agent/status/{id}` | investigation 상태 |
| `POST /api/v1/agent/scan` | 수동 스캔 트리거 |
| `GET /health` | 헬스체크 |

### 클라이언트 페이지

| 경로 | 상태 | 설명 |
|------|------|------|
| `/security` | ✅ 동작 | 메인 페이지 — 지도 + 피드 + 모달 |
| `/politics` | placeholder | 정치 뉴스 |
| `/economy` | placeholder | 경제 뉴스 |
| `/tech` | placeholder | 기술 뉴스 |
| `/auth/signin` | 존재 | NextAuth 로그인 |

## 환경 설정

### 서버 포트
| 서비스 | Huginn | Letsgugu (Grapoll) |
|--------|--------|-------------------|
| Backend | 8010 | 8000 |
| Client | 3010 | 3000 |
| DB | 5432 (Docker) | Neon (원격) |

### 필수 환경변수 (backend/.env)
```
DATABASE_URL=postgresql+asyncpg://livemap:livemap123@localhost:5432/livemap
AUTH_SECRET=...
FRONTEND_URL=http://localhost:3010
AGENT_OPENAI_API_KEY=...
AGENT_LLM_MODEL=gpt-4o-mini
AGENT_TAVILY_API_KEY=...
AGENT_DEEPINFRA_API_KEY=... (OpenAI 키로 대체)
AGENT_DEEPINFRA_BASE_URL=https://api.openai.com/v1
AGENT_LLM_CLASSIFIER_MODEL=gpt-4o-mini
```

### 실행 방법
```bash
# DB
cd backend && docker compose up -d db

# Backend
cd backend && uv run alembic upgrade head
cd backend && uv run uvicorn app.main:app --reload --port 8010

# Client
cd client && pnpm install && pnpm db:generate
cd client && pnpm dev --port 3010
```
