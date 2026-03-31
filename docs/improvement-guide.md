# Huginn 개선 가이드

> 작성일: 2026-03-31
> 여러 세션에서 참조하는 공유 문서. 각 항목은 독립적으로 수정 가능.

## 작업 규칙

1. **코드 수정 전 반드시 대상 파일을 직접 읽고 현재 상태 확인** — 이 문서의 수정 방안은 작성 시점 기준이며, 다른 세션에서 코드가 바뀌었을 수 있음
2. **guide에 적힌 대로 바로 수정하지 말 것** — 매번 코드를 확인하고, 방안이 여전히 유효한지 검증한 뒤에만 실행
3. **수정 후 반드시 실제 테스트로 검증** — 빌드 통과만으로 "완료" 선언 금지. 서버 띄우고 스크린샷/curl로 직접 확인
4. **검증 통과 후에만 커밋**, 커밋 전 사용자 확인 필수
5. **수정 중 발견한 새 이슈는 이 문서에 추가**

---

## 진행 상황

### Phase 0: Git Migration ✅
- [x] `live-map/client-v1` + `live-map/server(livemap-v1)` → `lofcgi/huginn` monorepo (2026-03-31)
- [x] git-filter-repo로 히스토리 보존, --to-subdirectory-filter client/ / backend/

### Phase 1: Claude Code 셋업 ✅
- [x] CLAUDE.md (루트) — 프로젝트 개요, 빌드 명령, 핵심 규칙 (2026-03-31)
- [x] .claude/settings.json — hooks (dangerous-guard, prettier-format, notification)
- [x] .claude/rules/ — backend.md, frontend.md, prisma-rules.md, testing-rules.md, verification-rules.md
- [x] .claude/skills/ — catchup, handoff, component, api-endpoint, e2e, deploy-check, security-scan, simplify, strategic-compact
- [x] .claude/agents/ — doc-researcher, security-reviewer, test-runner

### Phase 2: CORS 수정 ✅
- [x] `backend/app/main.py` — localhost:3010 + 127.0.0.1:3010 추가 (2026-03-31)

### Phase 3: FeedItem 타입 확장 ✅
- [x] `client/lib/types/feed.ts` — ArticleStructure, RelatedSource, credibilityScore, verificationStatus 추가 (2026-03-31)

### Phase 4: Backend 구조화된 기사 ✅
- [x] `backend/app/schemas/feed.py` — ArticleStructureSchema, RelatedSourceSchema 추가 (2026-03-31)
- [x] `backend/app/api/v1/routes/feeds.py` — _article_to_feed_response에서 article 구조 + relatedSources 반환 (2026-03-31)

### Phase 5: 피드 모달 개선 ✅
- [x] `client/app/security/_components/feed-modal.tsx` — 전면 재작성 (2026-03-31)
  - 검증 배지 (verified/partially_verified/unverified/pending + 신뢰도 %)
  - 구조화된 콘텐츠 (lead → nutGraph(왼쪽 보더) → body)
  - 원본 기사 보기 링크
  - 관련 출처 섹션
  - 상단 썸네일 + 그라디언트 오버레이
  - "AI 자동 생성 기사" 표시

### Phase 6: 지도 fitBounds ✅
- [x] `client/app/security/_components/security-map-client.tsx` — FitBoundsUpdater 컴포넌트 추가 (2026-03-31)
  - subCategory === "" (전체) → fitBounds로 모든 마커 표시
  - subCategory !== "" → 기존 MapCenterUpdater 유지

### Phase 7: 썸네일 다양화 (미완료)
- [ ] `backend/app/api/v1/routes/feeds.py` — 제목 hash 기반 이미지 풀 선택
- [ ] 향후: Article 모델에 thumbnail_url 컬럼 → 에이전트에서 OG 이미지 추출

**구현 방안:**
```python
_THUMBNAIL_POOL = {
    "ru-uk": ["url1", "url2", "url3"],
    "is-ir": ["url1", "url2"],
    ...
}

def _get_thumbnail(sub_category: str, title: str) -> str:
    pool = _THUMBNAIL_POOL.get(sub_category, [_DEFAULT_THUMBNAIL])
    return pool[hash(title) % len(pool)]
```

### Phase 8: 스캐너 위치 추출 보완 (미완료)
- [ ] `backend/app/agent/geo_mapper.py` — 텍스트 기반 위치 추출 fallback 함수 추가
- [ ] `backend/app/core/lifespan.py` — country_code 빈 경우 article headline에서 fallback 추출

**구현 방안:**
```python
# geo_mapper.py에 추가
LOCATION_KEYWORDS = {
    "ukraine": (48.38, 31.17, "Ukraine"),
    "kyiv": (50.45, 30.52, "Kyiv, Ukraine"),
    "kharkiv": (49.99, 36.23, "Kharkiv, Ukraine"),
    "donetsk": (48.02, 37.80, "Donetsk, Ukraine"),
    "israel": (31.77, 35.22, "Israel"),
    "gaza": (31.50, 34.47, "Gaza"),
    "lebanon": (33.87, 35.51, "Lebanon"),
    "north korea": (39.02, 125.75, "North Korea"),
    "south korea": (37.57, 126.98, "South Korea"),
    "taiwan": (25.03, 121.57, "Taiwan"),
    "saudi": (24.77, 46.74, "Saudi Arabia"),
    "iran": (35.69, 51.39, "Iran"),
    "syria": (33.51, 36.29, "Syria"),
}

def extract_location_from_text(text: str) -> tuple[float, float, str] | None:
    text_lower = text.lower()
    for keyword, coords in LOCATION_KEYWORDS.items():
        if keyword in text_lower:
            return coords
    return None
```

---

## 추가 개선 항목 (미착수)

### P2: UI/UX
- [ ] **P2-A**: 홈 페이지 — placeholder → 최근 뉴스 타임라인 or 대시보드
- [ ] **P2-B**: 정치/경제/기술 페이지 — placeholder → 실제 구현 (안보 페이지 패턴 복사)
- [ ] **P2-C**: 피드 카드 UI 개선 — 시간 표시 "X시간 전" 가독성, 카테고리 뱃지 추가
- [ ] **P2-D**: 모바일 반응형 — 현재 데스크톱 전용, 모바일 레이아웃 필요
- [ ] **P2-E**: 다크 모드 지도 타일 — OSM 대신 CartoDB dark_matter (선택적)

### P2: Backend
- [ ] **P2-F**: Scanner 자동 location 추출 — GDELT country code가 빈 경우 자동 fallback (Phase 8)
- [ ] **P2-G**: Scanner 주기 설정 — .env로 분 단위 조정 가능 (현재 15분 고정)
- [ ] **P2-H**: 기사 OG 이미지 추출 — article 생성 시 원본 URL에서 og:image 크롤링
- [ ] **P2-I**: diplomacy 카테고리 매핑 — 현재 diplomacy는 SECURITY에도 WAR에도 안 잡힘

### P3: 인프라
- [ ] **P3-A**: 배포 — Fly.io (backend) + Vercel (client) 설정
- [ ] **P3-B**: Sentry 연동 — 에러 모니터링
- [ ] **P3-C**: 테스트 — pytest (backend), pnpm build 검증
- [ ] **P3-D**: CI/CD — GitHub Actions for lint/build/test

---

## 알려진 이슈

### 1. Scanner LLM Classifier 비용
- OpenAI gpt-4o-mini를 LLM classifier로 사용 중 (Deepinfra 설정을 OpenAI로 전환)
- 15분마다 배치 분류 호출 → 비용 발생 (~$0.01/scan)
- 대안: Deepinfra의 무료/저가 모델로 복구, 또는 로컬 BART-MNLI로 대체

### 2. feeds 테이블 미사용
- 구버전의 `feeds` 테이블이 DB에 존재하지만 현재 미사용
- feeds 엔드포인트는 `events` + `articles` JOIN으로 동작
- 추후 feeds 테이블 삭제 또는 활용 방안 결정 필요

### 3. Client Prisma 의존성
- client-v1은 Prisma로 DB 직접 접근 (NextAuth 세션)
- 현재 로컬 PostgreSQL과 연결되어 있으나, NextAuth 테이블이 없을 수 있음
- OAuth 로그인 시 에러 발생 가능 → Prisma push 필요

### 4. diplomacy 카테고리 누락
- Event category "diplomacy"는 CLIENT_TO_CATEGORIES 매핑에 없음
- 해당 카테고리 기사가 WAR에도 SECURITY에도 표시되지 않음
- `geo_mapper.py`의 CLIENT_TO_CATEGORIES에 "diplomacy" → "WAR" 또는 "SECURITY" 추가 필요

### 5. Mock 데이터 잔존
- feeds.py에 `_get_mock_feeds()` 함수가 DB 비어있을 때 fallback으로 동작
- 실제 운영 시 제거 필요 (또는 DEBUG=True일 때만 활성화)

---

## 파일 수정 이력 (세션간 참조용)

### 2026-03-31 Session 1: 복원 + 파이프라인 연결 + 디테일 개선

**Backend 수정:**
| 파일 | 변경 |
|------|------|
| `app/models/event.py` | location_lat/lng/name 필드 추가 |
| `app/agent/geo_mapper.py` | 신규 — 국가코드→좌표, 카테고리 매핑 |
| `app/services/article_service.py` | save_article에 location/sub_category 파라미터 추가 |
| `app/agent/scanner.py` | event에 country 필드 포함 |
| `app/core/lifespan.py` | geo_mapper import, location 추출 + save_article 전달 |
| `app/api/v1/routes/feeds.py` | articles 기반 쿼리, camelCase 응답, 구조화된 article/relatedSources, 썸네일 |
| `app/api/v1/routes/agent.py` | investigate 결과를 DB에 저장 (ArticleService 연동) |
| `app/schemas/feed.py` | camelCase 네이티브, ArticleStructureSchema, RelatedSourceSchema |
| `app/main.py` | CORS에 localhost:3010 추가 |
| `.env` | AGENT_DEEPINFRA → OpenAI API로 전환, LLM_CLASSIFIER_MODEL 설정 |
| Alembic | merge heads + add location fields to events 마이그레이션 |

**Client 수정:**
| 파일 | 변경 |
|------|------|
| `lib/types/feed.ts` | ArticleStructure, RelatedSource, credibilityScore, verificationStatus |
| `lib/utils.ts` | formatTimeAgo: Date \| string 허용 |
| `lib/store/security-atoms.ts` | 기본 subCategory "" (전체) |
| `app/security/_components/security-map-client.tsx` | 커스텀 SVG 마커, FitBoundsUpdater |
| `app/security/_components/security-sub-category-filter.tsx` | "전체" 버튼 추가 |
| `app/security/_components/security-interactive.tsx` | 카테고리 변경 시 기본 전체 |
| `app/security/_components/feed-modal.tsx` | 전면 재작성 — 검증 배지, 구조화 콘텐츠, 원본 링크, 관련 출처 |

**인프라:**
| 항목 | 변경 |
|------|------|
| Git | lofcgi/huginn monorepo (client + backend 히스토리 merge) |
| Claude Code | CLAUDE.md, .claude/{settings, rules, skills, agents} |
| Docker | livemap-db (pgvector/pgvector:pg16) on port 5432 |
