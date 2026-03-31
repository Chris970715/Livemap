---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "e2e/**"
  - "tests/**"
  - "__tests__/**"
---

# 테스트 규칙

## 테스트 전략
- **유닛 테스트**: 비즈니스 로직, 유틸리티 함수, 복잡한 변환 로직
- **통합 테스트**: API 엔드포인트, Server Actions, DB 쿼리
- **E2E 테스트**: 핵심 사용자 플로우 (로그인, 결제, CRUD)
- 새 기능/버그픽스 시 관련 테스트 **필수** 포함

## Mock 최소화 원칙
- 외부 서비스(API, 결제 등)만 mock — 내부 모듈은 실제 구현 사용
- DB는 가능하면 테스트용 실제 DB 사용 (docker-compose 등)
- mock이 3개 이상이면 테스트 설계 재검토
- `jest.mock` / `vi.mock` 은 최후의 수단

## 테스트 구조
```typescript
describe('{대상}', () => {
  // Arrange (공통 셋업)

  it('should {기대 동작} when {조건}', () => {
    // Arrange (개별 셋업)
    // Act
    // Assert
  })
})
```

## 네이밍
- `should {동작} when {조건}` 형태
- 한글 허용 (팀 규칙에 따라)
- 테스트 파일: `{filename}.test.ts` 또는 `{filename}.spec.ts`

## 규칙
- 각 테스트는 **독립적** — 실행 순서에 의존 금지
- 하드코딩된 대기(sleep) 금지 — `waitFor` / `vi.advanceTimersByTime` 사용
- 테스트에서 프로덕션 코드 로직 복제 금지 — 결과만 검증
- snapshot 테스트는 최소화 — 변경 시 무의미한 업데이트 방지
- 커버리지 100% 추구 금지 — 의미 있는 테스트만

## E2E vs 유닛 구분
| 대상 | 테스트 유형 |
|------|-----------|
| 순수 함수, 유틸리티 | 유닛 테스트 |
| Server Action, API Route | 통합 테스트 |
| 핵심 사용자 플로우 | E2E 테스트 |
| UI 컴포넌트 렌더링 | 유닛 (필요 시) |
| 폼 제출 → DB 저장 → 화면 갱신 | E2E |
