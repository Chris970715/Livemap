# Huginn Quality Upgrade Tracker

> 여러 Claude Code 세션에서 동시작업하기 위한 진행 추적 문서.
> 작업 시작 전 이 문서를 반드시 확인하고, 완료 후 상태를 업데이트할 것.

## 브랜치 전략

```
main (배포용)
  └── dev (통합 브랜치)
        ├── fix/scanner-gdelt        ← Tier 0-1
        ├── fix/related-sources      ← Tier 0-2
        ├── fix/category-mapping     ← Tier 0-3
        ├── feat/model-upgrade       ← Tier 1
        ├── feat/geolocation         ← Tier 1
        ├── feat/frontend-redesign   ← Tier 2
        └── feat/realtime-sse        ← Tier 2
```

각 브랜치 완료 시 → `dev`로 PR → 머지 후 다음 작업

---

## 작업 현황

### Tier 0: 긴급 수리 (파이프라인 복구)

| #   | 작업                            | 브랜치                   | 상태    | 담당 세션 |
| --- | ------------------------------- | ------------------------ | ------- | --------- |
| 0-1 | GDELT timespan 수정 + 스캔 복구 | `fix/pipeline-emergency` | 🟢 완료 | 세션 A    |
| 0-2 | relatedSources API 연결         | `fix/pipeline-emergency` | 🟢 완료 | 세션 A    |
| 0-3 | diplomacy 카테고리 매핑         | `fix/pipeline-emergency` | 🟢 완료 | 세션 A    |

### Tier 1: 품질 기반

| #   | 작업                               | 브랜치                 | 상태                       | 담당 세션 |
| --- | ---------------------------------- | ---------------------- | -------------------------- | --------- |
| 1-1 | 기사 생성 모델 → Claude Sonnet 4.6 | `feat/model-upgrade`   | 🟡 보류 (gpt-4o-mini 유지) | -         |
| 1-2 | 분류 모델 → Claude Haiku 4.5       | `feat/model-upgrade`   | 🟡 보류 (gpt-4o-mini 유지) | -         |
| 1-3 | 프롬프트 강화 (placeholder 방지)   | `feat/quality-upgrade` | 🟢 완료                    | 세션 A    |
| 1-4 | LLM 기반 지오로케이션              | `feat/geolocation`     | 🔴 미시작                  | -         |

### Tier 2: 차별화

| #   | 작업                        | 브랜치                 | 상태               | 담당 세션 |
| --- | --------------------------- | ---------------------- | ------------------ | --------- |
| 2-1 | NewsData.io 소스 추가       | `feat/multi-source`    | 🔴 미시작          | -         |
| 2-2 | 프론트엔드 레이아웃 재설계  | `feat/quality-upgrade` | 🟢 완료            | 세션 A    |
| 2-3 | SSE 실시간 업데이트         | `feat/quality-upgrade` | 🟢 완료            | 세션 A    |
| 2-4 | 한/영 토글                  | `feat/quality-upgrade` | 🟢 완료            | 세션 A    |
| 2-5 | 지도 클러스터링 + 다크 타일 | `feat/quality-upgrade` | 🟢 완료 (다크타일) | 세션 A    |

### Tier 3: 압도적 우위

| #   | 작업                   | 브랜치                   | 상태      | 담당 세션 |
| --- | ---------------------- | ------------------------ | --------- | --------- |
| 3-1 | Telegram 채널 모니터링 | `feat/telegram-source`   | 🔴 미시작 | -         |
| 3-2 | 고급 필터 + 검색       | `feat/frontend-redesign` | 🔴 미시작 | -         |
| 3-3 | 모바일 반응형          | `feat/quality-upgrade`   | 🟢 완료   | 세션 A    |
| 3-4 | 병렬 파이프라인        | `feat/parallel-pipeline` | 🔴 미시작 | -         |
| 3-5 | 기사 모달 검증 시각화  | `feat/quality-upgrade`   | 🟢 완료   | 세션 A    |

---

## 멀티세션 프롬프트

아래 프롬프트를 새 Claude Code 세션에 붙여넣으면 해당 작업을 바로 시작할 수 있다.

### 세션 A: Tier 0 긴급 수리 (백엔드)

```
docs/quality-upgrade-tracker.md 읽고 Tier 0 작업을 진행해줘.

현재 상태:
- GDELT 스캐너가 "Timespan is too short" 에러로 고장남
- relatedSources가 빈 배열로 반환됨
- diplomacy 카테고리가 CLIENT_TO_CATEGORIES에 없어서 SECURITY 기사 0건

작업:
1. fix/scanner-gdelt 브랜치에서: backend/app/agent/config.py의 gdelt_timespan을 "60min"으로 변경 + backend/app/agent/triggers/gdelt.py에서 타임아웃 증가
2. fix/related-sources 브랜치에서: backend/app/api/v1/routes/feeds.py의 _article_to_feed_response에서 article.related_sources_json을 relatedSources로 매핑
3. fix/category-mapping 브랜치에서: backend/app/agent/geo_mapper.py의 CLIENT_TO_CATEGORIES에 "diplomacy" 추가

각 작업 완료 후 dev로 PR. 서버 재시작 후 curl로 검증.
```

### 세션 B: 모델 업그레이드 (백엔드)

```
docs/quality-upgrade-tracker.md 읽고 Tier 1 모델 업그레이드를 진행해줘.

현재 상태:
- gpt-4o-mini가 [날짜 삽입] placeholder를 남기고 모호한 기사 생성
- Meta-Llama-3.1-8B가 시위를 전쟁으로 잘못 분류
- Anthropic API 키 필요 (사용자에게 확인)

작업 (feat/model-upgrade 브랜치):
1. langchain-anthropic 패키지 설치 (uv add langchain-anthropic)
2. backend/app/agent/config.py에 anthropic_api_key 추가
3. backend/app/agent/bilingual_article_generator.py에서 ChatOpenAI → ChatAnthropic으로 교체, 모델 claude-sonnet-4-6
4. backend/app/agent/llm_classifier.py에서 분류 모델을 Claude Haiku 4.5로 교체
5. backend/app/agent/investigator_v3.py에서 팩트체크 모델을 Claude Sonnet 4.6으로 교체
6. 프롬프트 강화: placeholder 금지, 구체성 강제, 반복 금지 규칙 추가

완료 후 dev로 PR. 기사 생성 테스트로 품질 검증.
```

### 세션 C: 프론트엔드 리뉴얼

```
docs/quality-upgrade-tracker.md 읽고 Tier 2 프론트엔드 작업을 진행해줘.

현재 상태:
- px-24~px-72 과도한 패딩으로 콘텐츠 영역 협소
- 모바일 완전히 깨짐
- 실시간 업데이트 없음 (30초 폴링)
- 한/영 전환 없음

작업 (feat/frontend-redesign 브랜치):
1. client/app/layout.tsx: 패딩 수정 px-4 sm:px-6 + max-w-[1800px] 컨테이너
2. client/app/security/_components/: 3패널 레이아웃 (속보 티커 + 지도 60% + 피드 40%)
3. 한/영 토글: Jotai atom + 헤더 버튼 + API 응답의 EN/KO 데이터 활용
4. 지도: leaflet.markercluster 설치 + CartoDB dark_matter 타일
5. 모바일: 햄버거 메뉴 + 지도/리스트 탭 전환

완료 후 dev로 PR. Playwright 스크린샷으로 before/after 검증.
```

### 세션 D: 지오로케이션 재구축

```
docs/quality-upgrade-tracker.md 읽고 Tier 1 지오로케이션 작업을 진행해줘.

현재 상태:
- AWACS 기사(사우디 공군기지 공격)가 Oklahoma로 매핑됨
- 국가 수준 좌표만 지원 (도시/기지 수준 불가)
- 하드코딩 64개국 FIPS 코드

작업 (feat/geolocation 브랜치):
1. backend/app/agent/geo_mapper.py 전면 재작성
2. LLM으로 기사 headline+body에서 정확한 위치 추출 (도시, 기지, 랜드마크 수준)
3. Nominatim API로 geocoding (무료, OpenStreetMap 기반)
4. Fallback chain: LLM 추출 → GDELT country code → 기존 하드코딩
5. 테스트: "이란이 사우디 프린스 술탄 공군기지를 공격" → lat:24.06, lng:47.58 확인

완료 후 dev로 PR.
```

---

## 참조

- 전체 계획: `.claude/plans/warm-chasing-thacker.md`
- 프로젝트 컨텍스트: `docs/project-context.md`
- 개선 가이드: `docs/improvement-guide.md`
- CLAUDE.md: 프로젝트 규칙
