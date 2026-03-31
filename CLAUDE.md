# CLAUDE.md

## 프로젝트 개요

Huginn — 실시간 전쟁/안보 뉴스 AI 수집 플랫폼. GDELT 등 다중 소스에서 뉴스를 수집하고, LLM 기반 팩트체크 후 이중언어(한/영) 기사를 생성하여 지도에 표시.

| 항목 | 값 |
| --- | --- |
| 스택 (Backend) | FastAPI, SQLAlchemy async, asyncpg, pgvector, LangGraph, Alembic |
| 스택 (Client) | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Leaflet, Jotai |
| 데이터베이스 | PostgreSQL 16 + pgvector (로컬 Docker) |
| 배포 | 미정 (Fly.io + Vercel 예정) |
| 패키지 매니저 | uv (backend), pnpm (client) |

## 빌드 & 실행

```bash
# Backend
cd backend && docker compose up -d db     # pgvector DB
cd backend && uv run uvicorn app.main:app --reload --port 8010
cd backend && uv run alembic upgrade head  # 마이그레이션
cd backend && uv run pytest                # 테스트

# Client
cd client && pnpm install
cd client && pnpm db:generate              # Prisma 생성
cd client && pnpm dev --port 3010
cd client && pnpm build                    # 빌드 검증
```

## 핵심 규칙

1. **Server Components 기본** — `"use client"`는 인터랙션 필요 시에만
2. **빌드 검증 후 커밋** — `pnpm build` + `uv run pytest` 성공 확인
3. **실제 검증 후 완료** — 빌드 통과 != 버그 수정. UI 변경은 스크린샷 필수
4. **커밋 전 사용자 확인** — 내용 요약 후 "진행할까요?" 질문
5. **커밋 포맷** — Why -> What -> How -> Result

## Git 워크플로우

- **단일 monorepo**: `https://github.com/lofcgi/huginn`
- 브랜치: `feature/*`, `fix/*`, `refactor/*` -> `dev` -> `main`
- 루트에서 `git add`, `git commit` 실행 (client/, backend/ 경로 지정)

## 디렉토리 구조

```
client/                      # Next.js 16 프론트엔드
  app/security/              # 안보 뉴스 메인 페이지 (지도 + 피드)
  lib/hooks/use-feeds.ts     # API 호출 훅
  lib/store/                 # Jotai atoms
  lib/types/feed.ts          # FeedItem 타입

backend/                     # FastAPI 백엔드
  app/agent/                 # AI 에이전트 파이프라인
    scanner.py               # GDELT 스캐너 (15분 주기)
    investigator_v3.py       # 5단계 팩트체크
    bilingual_article_generator.py  # 한/영 기사 생성
    geo_mapper.py            # 국가 -> 좌표 매핑
  app/api/v1/routes/feeds.py # 피드 API (articles 기반)
  app/models/                # SQLAlchemy 모델
  app/services/              # 비즈니스 로직
```

## 파이프라인 흐름

```
GDELT Trigger -> Scanner (15분) -> LLM 분류 -> 팩트체크 Agent
  -> 이중언어 기사 생성 -> Event+Article DB 저장
  -> /api/v1/feeds 엔드포인트 -> Client 지도+피드 표시
```

## 스크린샷 규칙

UI 변경 시 Playwright로 before/after 스크린샷 캡처:
```bash
npx playwright screenshot --browser chromium --viewport-size "1920,1080" --wait-for-timeout 5000 "http://localhost:3010/security" screenshots/filename.png
```

## Hook 규칙

PostToolUse hook 메시지 = 즉시 실행. 배치하거나 건너뛰지 않음.
