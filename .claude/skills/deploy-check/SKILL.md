---
name: deploy-check
description: 배포 전 검증 체크리스트 실행. 빌드, 테스트, 환경변수, 보안 점검.
user-invocable: true
---

# 배포 전 검증

프로덕션 배포 전 필수 체크리스트를 실행한다.

## 자동 검증 항목

### 1. 빌드 검증
```bash
npm run build 2>&1
echo "Exit code: $?"
```
- TypeScript 에러 확인
- 린트 경고/에러 확인

### 2. 테스트
```bash
npm run test 2>&1                           # 유닛 테스트
npx playwright test 2>&1                     # E2E (있는 경우)
```

### 3. 환경변수 확인
```bash
# .env.example과 실제 환경변수 키 비교
comm -23 \
  <(grep -v '^#' .env.example 2>/dev/null | grep '=' | cut -d= -f1 | sort) \
  <(grep -v '^#' .env 2>/dev/null | grep '=' | cut -d= -f1 | sort)
```
누락된 환경변수가 있으면 경고.

### 4. 시크릿 스캔
```bash
# 하드코딩된 시크릿 검사
grep -rn "password\s*=\s*['\"]" src/ --include="*.ts" --include="*.js" -i
grep -rn "Bearer\s\+[A-Za-z0-9]" src/ --include="*.ts" --include="*.js"
```

### 5. 의존성 보안
```bash
npm audit --production 2>&1
```

### 6. 번들 분석
```bash
# Next.js 빌드 출력에서 번들 사이즈 확인
# 큰 페이지(>250kB) 경고
```

## 플랫폼별 추가 체크

### Vercel
```bash
# Vercel CLI로 프리뷰 배포
npx vercel --prod 2>&1  # 프로덕션 배포 시
```
- Edge Runtime 호환성 확인
- Serverless 함수 크기 제한 (50MB)

### Railway / Fly.io
- Dockerfile 존재 확인
- 헬스체크 엔드포인트 확인

## 결과 출력

```
## 배포 전 검증 결과

| 항목 | 상태 | 비고 |
|------|------|------|
| 빌드 | ✅ PASS | 32s |
| 테스트 | ✅ PASS | 15 passed |
| 환경변수 | ⚠️ WARN | NEW_VAR 미설정 |
| 시크릿 | ✅ PASS | 하드코딩 없음 |
| 의존성 | ✅ PASS | 0 vulnerabilities |
| 번들 | ⚠️ WARN | /dashboard 280kB |

종합: 배포 가능 (경고 2건 확인 필요)
```

**하나라도 FAIL 시 배포 비추천 + 수정 가이드 제공**
