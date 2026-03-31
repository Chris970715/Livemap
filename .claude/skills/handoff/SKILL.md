---
name: handoff
description: 세션 종료 전 현재 작업 상태를 HANDOFF.md에 기록. 다음 세션에 맥락 전달.
user-invocable: true
argument-hint: "[메모 또는 블로커]"
---

# 세션 핸드오프

세션 종료 전 현재 작업 상태를 HANDOFF.md에 기록하여 다음 세션에 맥락을 전달한다.

## 절차

### 1. 상태 수집

아래 명령으로 현재 프로젝트 상태를 수집:

```bash
git branch --show-current
# 브랜치 전체 커밋 수집 (고정값 금지)
git log --oneline main..HEAD 2>/dev/null || git log --oneline -30
git diff --stat main..HEAD 2>/dev/null || git diff --stat
git diff --stat
git status --short
gh pr list --state open --limit 5 2>/dev/null || true
```

### 2. 세션 요약

**세션 범위 판단 (우선순위):**

1. 이전 HANDOFF.md 존재 → 그 타임스탬프 이후 커밋 전부
2. 이전 HANDOFF.md 없음 → **대화 컨텍스트에서 세션 시작점 판단** (프로젝트 초기화부터일 수도 있음)
3. 대화 컨텍스트 불확실 → `git log main..HEAD --oneline` 전체 (브랜치 생성 이후 전부)
4. main 브랜치인 경우 → 마지막 태그 또는 전체 커밋 분석

**절대 고정값(5개, 10개)으로 세션 범위를 제한하지 않는다.**

대화 컨텍스트에서 이번 세션에 수행한 작업 전체를 파악하고, git log와 교차 검증하여 누락 없이 기록한다.

### 3. HANDOFF.md 작성

프로젝트 루트에 HANDOFF.md를 **덮어쓰기**로 작성:

```markdown
# Handoff — {YYYY-MM-DD} {HH:MM}

## Branch

{현재 브랜치} (main에서 분기, N개 커밋)

## What was done

- {이번 세션에서 수행한 작업 요약 — 세션 전체 범위}

## Current state

- **Uncommitted changes**: {git diff --stat 요약 또는 "none"}
- **Active PR**: {PR 번호 + 제목 또는 "none"}
- **Build status**: {알고 있으면 기록, 모르면 "not checked"}

## Next steps

- [ ] {다음 해야 할 작업 1}
- [ ] {다음 해야 할 작업 2}
- [ ] {다음 해야 할 작업 3}

## Blockers / Gotchas

{$ARGUMENTS 내용 포함. 없으면 "none"}

## Key files touched (이번 세션 전체)

- {이번 세션에서 수정한 주요 파일 경로}
```

### 4. 메모리 제안

아래 항목을 **능동적으로** 점검:

- 이번 세션에서 실수하고 수정한 것이 있는가?
- 사용자가 접근 방식을 교정한 적이 있는가?
- 새로운 설계 결정이나 패턴이 확립되었는가?
- 예상과 다르게 동작한 것이 있는가?

하나라도 해당되면 구체적 메모리 내용을 제안한다 (사용자에게 "없었습니다" 대신 발견한 항목을 나열).

### 5. 확인

작성된 HANDOFF.md 내용을 표시하고 세션 종료 준비 완료를 알림.

## 규칙

- HANDOFF.md는 항상 **덮어쓰기** (이전 내용 대체)
- 빌드 출력, 로그 등 대용량 내용 포함 금지
- HANDOFF.md는 **자동 커밋하지 않음** (임시 파일)
- .gitignore에 HANDOFF.md가 없으면 추가 제안
