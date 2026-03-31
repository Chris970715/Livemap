---
name: security-scan
description: OWASP 기반 보안 점검. 구체적 grep 패턴으로 취약점 스캔.
user-invocable: true
---

# 보안 스캔

OWASP Top 10 기반으로 코드베이스의 보안 취약점을 점검한다.

## 점검 항목 및 스캔 패턴

### 1. 인젝션 (A03:2021)
```bash
# XSS: dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.jsx"

# Command 인젝션
grep -rn "exec(\|spawn(\|execSync(" src/ --include="*.ts" --include="*.js"

# SQL 인젝션 (Prisma raw query)
grep -rn '\$queryRaw\|Prisma\.sql' src/ --include="*.ts"

# eval 사용
grep -rn "eval(\|new Function(" src/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 2. 인증 결함 (A07:2021)
```bash
# 하드코딩된 시크릿
grep -rn "password\s*=\s*['\"].\+['\"]" src/ --include="*.ts" --include="*.js"
grep -rn "secret\s*=\s*['\"].\+['\"]" src/ --include="*.ts" --include="*.js"
grep -rn "api[_-]key\s*=\s*['\"].\+['\"]" src/ --include="*.ts" --include="*.js" -i

# 미보호 API 엔드포인트 (인증 미들웨어 누락)
# app/api/ 디렉토리의 route.ts에서 auth/session 체크 여부 확인
```

### 3. 민감 데이터 노출 (A02:2021)
```bash
# .env가 .gitignore에 포함되었는지
grep ".env" .gitignore

# 클라이언트 번들에 서버 시크릿 노출 (NEXT_PUBLIC_ 아닌 env 사용)
grep -rn "process\.env\." src/ --include="*.tsx" --include="*.jsx" | grep -v "NEXT_PUBLIC_"

# 로그에 민감 정보
grep -rn "console\.log.*password\|console\.log.*token\|console\.log.*secret" src/ -i
```

### 4. 접근 제어 (A01:2021)
```bash
# IDOR: URL 파라미터로 직접 데이터 접근
grep -rn "params\.\(id\|userId\)" src/app/ --include="*.ts" --include="*.tsx"
# → 소유권 검증 로직이 있는지 수동 확인 필요
```

### 5. 의존성 (A06:2021)
```bash
npm audit 2>&1
# 또는
pnpm audit 2>&1
```

## 실행 방법

1. 위 패턴들을 Grep 도구로 순서대로 실행
2. 발견된 이슈를 심각도별 분류:
   - **Critical**: 즉시 수정 필요 (인젝션, 시크릿 노출)
   - **High**: 배포 전 수정 권장 (인증 누락, IDOR)
   - **Medium**: 계획적 수정 (의존성 취약점)
   - **Low**: 개선 권장 (불필요한 console.log)

## 출력 포맷

```
## 보안 스캔 결과

| 심각도 | 항목 | 파일:라인 | 설명 |
|--------|------|-----------|------|
| Critical | XSS | src/page.tsx:42 | dangerouslySetInnerHTML 사용 |
| High | 인증 | api/route.ts:10 | 인증 미들웨어 누락 |

총 {N}개 이슈 발견 (Critical: {n}, High: {n}, Medium: {n}, Low: {n})
```

수정 가능한 이슈는 "수정할까요?" 질문 후 자동 수정 제안.
