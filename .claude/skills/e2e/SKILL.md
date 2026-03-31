---
name: e2e
description: E2E 테스트 작성. Playwright 기반. MCP 연동 시 스크린샷 비교 지원.
user-invocable: true
argument-hint: "<테스트 대상 페이지/기능>"
---

# E2E 테스트 작성

$ARGUMENTS 에 대한 Playwright E2E 테스트를 작성한다.

## Step 1: 환경 확인
```bash
# Playwright 설치 확인
npx playwright --version 2>&1

# 설정 파일 확인
cat playwright.config.ts 2>/dev/null || cat playwright.config.js 2>/dev/null
```

## Step 2: 패턴 분석
1. 기존 E2E 테스트 파일 확인:
   ```bash
   find e2e/ tests/ -name "*.spec.ts" -o -name "*.test.ts" 2>/dev/null | head -5
   ```
2. 기존 테스트 1-2개 읽어서 패턴 파악:
   - 인증 fixture 사용 여부
   - 페이지 객체 패턴 사용 여부
   - 데이터 셋업 방식

## Step 3: 테스트 작성

```typescript
import { test, expect } from '@playwright/test'

test.describe('{테스트 대상}', () => {
  test('{시나리오 설명}', async ({ page }) => {
    // Arrange
    await page.goto('/{path}')

    // Act
    await page.getByRole('button', { name: '{버튼}' }).click()

    // Assert
    await expect(page.getByText('{기대 텍스트}')).toBeVisible()
  })
})
```

**로케이터 우선순위:**
1. `getByRole` — 접근성 기반 (최우선)
2. `getByText` — 텍스트 기반
3. `getByLabel` — 폼 요소
4. `getByPlaceholder` — 입력 필드
5. `getByTestId` — 최후의 수단

## Step 4: Playwright MCP 연동 (설정된 경우)
Playwright MCP가 활성화되어 있으면:
- 브라우저를 실제로 열어서 테스트 실행
- 스크린샷 캡처로 시각적 검증
- 네트워크 요청 모니터링

## Step 5: 실행 및 검증
```bash
# 단일 파일 실행
npx playwright test {file} --reporter=list 2>&1

# 실패 시 디버깅
npx playwright test {file} --headed 2>&1         # 브라우저 표시
npx playwright test {file} --ui 2>&1              # UI 모드
npx playwright show-report 2>&1                   # HTML 리포트
```

## 에러 복구

| 에러 | 대응 |
|------|------|
| 브라우저 미설치 | `npx playwright install` |
| 타임아웃 | `test.setTimeout(30000)` 또는 `waitFor` 사용 |
| 요소 못 찾음 | 로케이터 변경, `page.waitForSelector` 추가 |
| 인증 필요 | `storageState` fixture 설정 |

## 규칙

- 테스트 간 상태 공유 금지 (각 테스트 독립적)
- 하드코딩된 대기(sleep) 대신 `waitFor` 사용
- 인증 필요 테스트는 fixture 활용
- 네트워크 요청 mock은 최소화 — 실제 서버 사용 권장
- data-testid는 최후의 수단
