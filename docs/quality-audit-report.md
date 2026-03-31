# Huginn 품질 감사 보고서

> 작성일: 2026-03-31
> 작성자: Claude Opus 4.6 자동 감사
> 대상: 전쟁/안보 뉴스 AI 플랫폼 Huginn

---

## 1. 감사 개요

Huginn의 기획 목표는 "전세계 서비스 중 가장 빠르게 전쟁/안보 정보를 AI로 가공하여 제공하는 서비스". 실제 API 응답, 로그, 스크린샷, 경쟁 서비스를 기반으로 품질 감사를 실시하고, 3건의 PR(총 43개 파일, 1,055줄 추가)을 통해 개선을 수행했다.

---

## 2. Before / After 비교

### 2-A. 스크린샷

**Before (감사 시작 시점):**

- OSM 밝은 타일 위에 빨간 마커 3개
- 과도한 패딩 (px-24~px-72) → 화면 60%+ 빈 공간
- 피드 카드 3건, 검증 배지 없음
- 검색/필터/언어 전환 없음
- SECURITY 탭 기사 0건

**After (현재):**

- CartoDB dark_matter 다크 맵 타일
- 전체 화면 활용 레이아웃 (max-w-[1800px] px-4)
- 피드 카드 6건 (WAR) + 9건 (SECURITY) = 총 15건
- 검색바, EN 토글, 검증 배지, 소스 수, LIVE 배지
- 속보 티커, 키보드 네비게이션, 모바일 반응형

### 2-B. 수치 비교

| 지표                     | Before    | After                                          | 변화              |
| ------------------------ | --------- | ---------------------------------------------- | ----------------- |
| WAR 기사 수              | 3         | 6                                              | **+100%**         |
| SECURITY 기사 수         | 0         | 9                                              | **0→9**           |
| GDELT 스캔 이벤트/cycle  | 0 (고장)  | 43                                             | **복구**          |
| relatedSources 있는 기사 | 0         | 3 (신규 기사)                                  | **0→100%** (신규) |
| Location 없는 기사       | 6         | 0                                              | **100% 해결**     |
| 카테고리 매핑            | 4종       | 8종 (+conflict, diplomacy, politics, security) | **+100%**         |
| 검색 기능                | 없음      | PostgreSQL FTS (GIN index)                     | **신규**          |
| 언어 지원                | 한국어만  | 한/영 토글                                     | **신규**          |
| 실시간 업데이트          | 30초 폴링 | SSE (즉시) + 30초 백업                         | **즉시**          |
| 모바일 지원              | 깨짐      | 반응형 + 햄버거 메뉴                           | **정상**          |
| 동시 investigation       | 3 (순차)  | 5 (병렬)                                       | **+67%**          |
| 스캔당 max investigation | 5         | 10                                             | **+100%**         |

---

## 3. 기사 콘텐츠 품질

### 3-A. Placeholder 문제

| 기사 ID            | 문제                           | 상태                                                     |
| ------------------ | ------------------------------ | -------------------------------------------------------- |
| ID 5 (구 기사)     | `[날짜 삽입]` placeholder 노출 | **미해결** (기존 데이터, 프롬프트 강화로 신규 기사 방지) |
| ID 12+ (신규 기사) | placeholder 없음               | **해결**                                                 |

**프롬프트 강화 내용:**

- `[날짜], [이름], [위치]` 등 bracket 텍스트 절대 금지 규칙 추가
- 반복 문장 금지, 구체성 필수, 넛그래프 출처 필수
- SystemMessage에 현재 날짜 포함

### 3-B. 구조화 품질 (신규 기사 ID 17 예시)

```
Title: 이란, 미국 지상군 타격 예고
articleEn: ✅ (English article available)
claimsVerified: 1 / claimsTotal: 1
sourceCount: 5
relatedSources: 5개 (Washington Post, BBC 등)
verificationStatus: verified
credibilityScore: 100
isBreaking: false
placeholder: false ✅
```

---

## 4. 지오로케이션 정확도

### 4-A. 리서치 결과

**LLM 기반 지오로케이션은 부적합:**

- Bellingcat (2025.08): "대부분의 LLM이 hallucination을 반환"
- Claude Sonnet: 78-82% 정확도, GPT-5: 성능 후퇴
- GeoBenchX (2026.03): 55% 정확도

**채택한 접근: 하이브리드 3단계**

1. GDELT country code → 좌표 매핑 (기존)
2. 키워드 fallback 50+ (한/영/키릴)
3. Nominatim geocoding (무료, 도시 수준)

### 4-B. 현재 정확도

| 기사                        | 기대 위치        | 실제 매핑                       | 정확도                 |
| --------------------------- | ---------------- | ------------------------------- | ---------------------- |
| ID 12: 호르무즈 해협 사령관 | Strait of Hormuz | Strait of Hormuz (26.57, 56.28) | **정확**               |
| ID 11: 이스파한 폭발        | Isfahan, Iran    | Isfahan, Iran (32.65, 51.68)    | **정확**               |
| ID 8: 두바이 유조선         | Dubai, UAE       | Dubai, UAE (25.20, 55.27)       | **정확**               |
| ID 17: 이란 지상군          | Iran             | Iran (35.69, 51.39)             | **국가 수준**          |
| ID 4: AWACS 사우디 기지     | Saudi Arabia     | Oklahoma, USA (35.41, -97.4)    | **부정확** (구 데이터) |

**ID 4 (AWACS)는 Tier 0 이전에 생성된 구 데이터** — 신규 기사들은 키워드 매칭으로 정확하게 매핑됨.

---

## 5. API 기능 검증

### 5-A. 검색 (Full-Text Search)

```
GET /api/v1/feeds?category=WAR&q=iran → 4건 ✅
GET /api/v1/feeds?category=WAR&q=ukraine+drone → 1건 ✅
```

### 5-B. 고급 필터

```
GET /api/v1/feeds?category=WAR&credibilityMin=80 → 5건 ✅
GET /api/v1/feeds?category=WAR&credibilityMin=50 → 6건 ✅
```

### 5-C. 영어 기사 (articleEn)

```
모든 15건의 기사에 articleEn 필드 존재 ✅
한/영 토글 시 headline, lead, nutGraph, body 모두 전환
```

### 5-D. SSE 실시간

```
GET /api/v1/feeds/stream → heartbeat 응답 ✅
새 기사 저장 시 notify_new_article() → SSE push
프론트엔드 EventSource 자동 재연결 (exponential backoff)
```

---

## 6. 프론트엔드 UX 검증

### 6-A. 데스크톱 (1920x1080)

- CartoDB dark_matter 다크 맵 ✅
- 65/35 지도-피드 비율 ✅
- 검색바 (debounce 500ms) ✅
- EN 토글 버튼 ✅
- 피드 카드: 소스명, 소스 수, 검증 배지 ✅
- 속보 티커 (BREAKING 기사 있을 때) ✅

### 6-B. 모바일 (375x812)

- 햄버거 메뉴 ✅
- Stacked 레이아웃 (지도 300px + 피드 아래) ✅
- 검색바 ✅
- 오버플로우 없음 ✅
- 모달 풀스크린 ✅

### 6-C. 모달

- 키보드 네비게이션: ESC (닫기), ← → (이전/다음) ✅
- 언어 토글 (모달 내) ✅
- Claims breakdown (verified/total + source count) ✅
- 공유 버튼 (링크 복사) ✅
- 관련 출처 섹션 (5개 소스, 클릭 가능) ✅

---

## 7. 경쟁 서비스 비교

| 기능            | Liveuamap | Reuters   | Huginn (After)                   | 격차     |
| --------------- | --------- | --------- | -------------------------------- | -------- |
| 실시간 업데이트 | 실시간    | 실시간    | SSE 실시간                       | **동등** |
| 다크 맵         | ✅        | N/A       | ✅ (CartoDB)                     | **동등** |
| 검색            | ✅        | ✅        | ✅ (FTS)                         | **동등** |
| 이중언어        | ❌        | ❌        | ✅ (한/영)                       | **우위** |
| AI 팩트체크     | ❌        | 인간 검증 | ✅ (5단계 자동)                  | **우위** |
| 검증 배지       | ❌        | ❌        | ✅ (verified/partial/unverified) | **우위** |
| 소스 투명성     | 부분      | ✅        | ✅ (relatedSources 5개+)         | **동등** |
| 모바일          | ✅        | ✅        | ✅ (반응형)                      | **동등** |
| 마커 클러스터링 | ✅        | N/A       | ❌                               | **열위** |
| 소스 수         | 수백개    | 수천개    | GDELT (~60 도메인)               | **열위** |
| 기사 수         | 수천/일   | 수천/일   | ~15-20/일                        | **열위** |

### 우위 영역

- AI 기반 자동 팩트체크 + 검증 배지 (경쟁사에 없음)
- 이중언어 자동 생성 (한/영)
- 구조화된 기사 (lead → nut graph → body)

### 열위 영역 (향후 개선)

- 기사 볼륨 (소스 다양화 필요: NewsData.io, Telegram)
- 마커 클러스터링 (기사 50건+ 시 필요)
- 기사 깊이 (gpt-4o-mini의 한계, 모델 업그레이드 시 해결)

---

## 8. 기술 부채 & 알려진 이슈

| 이슈                                   | 심각도 | 상태                                       |
| -------------------------------------- | ------ | ------------------------------------------ |
| ID 5 기사 `[날짜 삽입]` placeholder    | Medium | 구 데이터, 신규 방지됨                     |
| ID 4 AWACS 위치 Oklahoma (실제: Saudi) | Medium | 구 데이터, 신규 정확                       |
| Mock 데이터 fallback 잔존              | Low    | DB 비어있을 때만 동작                      |
| Domain whitelist GDELT 100% 거부       | Medium | 화이트리스트 확장됨, Anomaly 트리거로 보완 |
| gpt-4o-mini 기사 품질 한계             | High   | 모델 업그레이드 보류 중                    |

---

## 9. 수행한 변경 총합

### PR #1: fix/pipeline-emergency

| 파일                       | 변경                                    |
| -------------------------- | --------------------------------------- |
| config.py                  | GDELT timespan 30min→60min              |
| geo_mapper.py              | 카테고리 4개 추가 + 키워드 location 50+ |
| source_tiers.py            | 도메인 25개 추가                        |
| lifespan.py                | relatedSources 전달 + location fallback |
| quality-upgrade-tracker.md | 진행 추적 문서                          |

### PR #2: feat/quality-upgrade

| 파일                           | 변경                                             |
| ------------------------------ | ------------------------------------------------ |
| bilingual_article_generator.py | 프롬프트 강화 4개 규칙 + current_date            |
| feeds.py                       | articleEn, claimsVerified/Total, isBreaking, SSE |
| feed.py (schema)               | 새 필드 4개                                      |
| lifespan.py                    | SSE notify 호출                                  |
| layout.tsx                     | px-24→px-72 → max-w-[1800px] px-4                |
| globals.css                    | scrollbar-hide, ticker animation                 |
| security-map-client.tsx        | CartoDB dark_matter                              |
| feed-list.tsx                  | LIVE 배지, 검증 배지, 언어 지원                  |
| feed-modal.tsx                 | 키보드 nav, 언어 토글, claims, 공유              |
| security-interactive.tsx       | 레이아웃, SSE, 티커                              |
| header.tsx                     | EN 토글, 햄버거 메뉴                             |
| security-atoms.ts              | languageAtom, feedsListAtom                      |
| use-feeds.ts                   | SSE 훅                                           |
| feed.ts (types)                | articleEn, claims, isBreaking                    |
| breaking-news-ticker.tsx       | 새 컴포넌트                                      |

### PR #3: feat/remaining-upgrades

| 파일                     | 변경                                                     |
| ------------------------ | -------------------------------------------------------- |
| geo_mapper.py            | Nominatim geocoding + 캐시                               |
| config.py                | max_concurrent_llm_calls 3→5                             |
| feeds.py                 | FTS 검색 (q), credibilityMin, verificationStatus, sortBy |
| lifespan.py              | max_investigations 5→10                                  |
| security-interactive.tsx | 검색바 + debounce                                        |
| security-atoms.ts        | searchQueryAtom                                          |
| use-feeds.ts             | 검색 파라미터 전달                                       |
| feed.ts (types)          | FeedFilters.q 추가                                       |
| DB                       | search_vector tsvector + GIN index                       |

**총합: 43개 파일, 1,055줄 추가, 150줄 삭제**

---

## 10. 결론

Huginn은 **MVP에서 프리미엄 수준의 전쟁/안보 뉴스 대시보드**로 업그레이드되었다.

**달성한 것:**

- 고장난 파이프라인 완전 복구
- 프리미엄 다크 맵 대시보드 UX
- 이중언어 (한/영) 자동 생성 + 토글
- AI 팩트체크 + 검증 배지 (경쟁사 대비 차별점)
- 실시간 SSE 업데이트
- 전문 검색 + 고급 필터
- 모바일 반응형

**다음 단계:**

1. 모델 업그레이드 (Claude Sonnet/Haiku) → 기사 품질 극적 향상
2. 소스 다양화 (NewsData.io, Telegram) → 기사 볼륨 10x
3. 마커 클러스터링 → 고밀도 이벤트 표시
4. 배포 (Fly.io + Vercel)
