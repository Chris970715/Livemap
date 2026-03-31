---
paths:
  - "backend/**/*.py"
  - "src/actions/**/*.ts"
  - "actions/**/*.ts"
---

# API 라우트 & Server Action 규칙

## Server Action 패턴 (기본)
```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({ /* ... */ })

type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

export async function myAction(formData: FormData): Promise<ActionResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  // 인증 확인
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 비즈니스 로직
  try {
    await prisma.model.create({ data: parsed.data })
    revalidatePath('/path')
    return { success: true }
  } catch (error) {
    // Sentry.captureException(error)
    return { success: false, error: 'Something went wrong' }
  }
}
```

## API Route 구조
- HTTP 메서드별 named export: `export async function GET/POST/PUT/DELETE`
- 입력 검증: Zod 스키마 필수
- 인증: 보호 필요 엔드포인트는 세션 확인 필수

## 응답 포맷
```typescript
// 성공
return NextResponse.json({ data: result })

// 에러
return NextResponse.json(
  { error: { code: "NOT_FOUND", message: "Resource not found" } },
  { status: 404 }
)
```

## HTTP 상태 코드
- 200: 성공 (GET, PUT)
- 201: 생성 성공 (POST)
- 204: 삭제 성공 (DELETE)
- 400: 잘못된 요청 (검증 실패)
- 401: 인증 필요
- 403: 권한 없음
- 404: 리소스 없음
- 429: Rate limit 초과
- 500: 서버 에러

## Rate Limiting
- 공개 API 엔드포인트에 rate limiting 적용
- IP 기반 또는 사용자 기반 제한
- 429 응답 시 Retry-After 헤더 포함

## 금지사항
- try-catch 없는 DB 쿼리
- 인증 체크 없는 보호 엔드포인트
- 하드코딩된 시크릿
- console.log로 민감 데이터 출력
- 클라이언트에 내부 에러 메시지/스택 트레이스 노출
