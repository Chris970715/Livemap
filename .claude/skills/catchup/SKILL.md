---
name: catchup
description: 새 세션에서 프로젝트 맥락을 빠르게 파악. Git 상태 + HANDOFF + 코드 + docs + 메모리 종합 브리핑.
user-invocable: true
argument-hint: "[집중할 영역]"
---

# 세션 캐치업

새 세션 시작 시 프로젝트 맥락을 빠르게 파악하여 구조화된 브리핑을 제공한다.

## 라이브 상태 수집

!`git branch --show-current && git status --short`

!`git log --oneline -10`

!`git diff --stat 2>/dev/null`

!`gh pr list --state open --limit 5 2>/dev/null || echo "(no gh or no PRs)"`

## 절차

### 1. HANDOFF.md 읽기

프로젝트 루트의 HANDOFF.md가 가장 중요한 맥락 소스:
- 존재하면 → 내용을 읽고 세션 브리핑의 핵심으로 활용
- 없으면 → git 기반으로 브리핑 구성 (Step 2로)

### 2. 코드베이스 직접 탐색

**CLAUDE.md의 프로젝트 개요에만 의존하지 말 것.** 실제 코드를 읽어서 현재 상태를 파악한다.

#### 필수 읽기 파일
- `package.json` (또는 `pyproject.toml`, `Cargo.toml` 등) — 의존성, 스크립트
- 메인 엔트리포인트 파일 (예: `src/app/layout.tsx`, `app/main.py`, `src/main.rs`)
- 라우트/API 정의 파일 — 기능 전체 목록 파악

#### 구조 파악 (Glob/ls)
- 소스 디렉토리 구조 → 페이지/모듈/기능 목록
- 모델/스키마 디렉토리 → 데이터 구조 파악

#### docs 확인
- `docs/` 디렉토리 (있으면) — 아키텍처, 설계 문서
- `README.md` — 프로젝트 소개 (단, 코드로 직접 검증)
- `CLAUDE.md` — 개발 규칙 (단, 개요는 코드로 직접 검증)

### 3. 메모리 파일 읽기

메모리 디렉토리의 모든 파일 확인:
- `project` 타입 메모리 (진행 상황, 설계 결정)
- `feedback` 타입 메모리 (작업 방식 가이드)
- `user` 타입 메모리 (사용자 선호도)
- `reference` 타입 메모리 (외부 리소스 포인터)

### 4. 구조화된 브리핑 출력

```markdown
## Session Briefing

### Project
{코드에서 직접 파악한 프로젝트 설명 — CLAUDE.md가 아닌 실제 코드 기반}

### Where we left off
{HANDOFF.md 기반 — 마지막 세션 요약}
{HANDOFF.md 없으면 최근 커밋 기반 추정}

### Current state
- **Branch**: {현재 브랜치}
- **Uncommitted changes**: {git status 요약}
- **Active PRs**: {열린 PR 목록}
- **Recent commits**: {최근 5개}

### Codebase snapshot
- **주요 모듈/페이지**: {디렉토리 구조 기반 요약}
- **데이터 모델**: {모델/스키마 요약}
- **주요 변경 감지**: {docs나 코드에서 발견한 최근 아키텍처 변경}

### Pending next steps
{HANDOFF.md의 Next steps 체크리스트}
{없으면 "No handoff found — check git log for context"}

### Relevant memories
{모든 타입 메모리 요약}
```

### 5. HANDOFF.md 소비 후 처리

브리핑 출력 후:
- "HANDOFF.md를 삭제할까요?" 질문
- 사용자 승인 시 삭제 (일회성 파일이므로)

### 6. 집중 영역 (선택)

$ARGUMENTS가 있으면 해당 영역에 집중하여 브리핑:
- `backend` → 백엔드 관련 커밋, 파일, PR만 필터
- `frontend` → 프론트엔드 관련만 필터
- 특정 기능명 → 관련 브랜치, 커밋, 파일 집중 분석

## 규칙

- **읽기 전용** — 이 스킬은 어떤 파일도 수정하지 않음 (HANDOFF.md 삭제 제안만)
- HANDOFF.md가 없어도 git + 코드 기반 브리핑은 항상 제공
- **CLAUDE.md 개요를 그대로 복사하지 말 것** — 실제 코드를 읽고 현재 상태 기반으로 설명
- 브리핑은 간결하게 — 세부 사항은 사용자가 물어보면 제공
