---
name: api-endpoint
description: API 라우트 또는 Server Action 생성. Zod 검증 + 에러 핸들링 포함.
user-invocable: true
argument-hint: "<엔드포인트 설명>"
---

# API 엔드포인트 / Server Action 생성

$ARGUMENTS 에 대한 API 엔드포인트 또는 Server Action을 생성한다.

## Step 1: 패턴 분석
1. 프로젝트의 데이터 변경 패턴 확인:
   - Next.js App Router → Server Actions 우선
   - API Route가 필요한 케이스 (외부 webhook, 파일 업로드 등)
2. 기존 유사 엔드포인트/액션 읽어서 패턴 추출

## Step 2: Server Action 생성 (기본)

```typescript
// src/actions/{action-name}.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// 1. Zod 스키마 정의
const schema = z.object({
  // 필드 정의
})

// 2. ActionResult 타입
type ActionResult = {
  success: boolean
  error?: string
  data?: unknown
}

// 3. Server Action
export async function {actionName}(
  formData: FormData
): Promise<ActionResult> {
  try {
    // 입력 검증
    const parsed = schema.safeParse({
      // formData에서 추출
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    // 인증 확인
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' }
    }

    // DB 작업
    const result = await prisma.{model}.{operation}({
      data: parsed.data,
    })

    // 캐시 무효화
    revalidatePath('/{path}')

    return { success: true, data: result }
  } catch (error) {
    // 에러 트래킹 (console.error 대신)
    // Sentry.captureException(error)
    return { success: false, error: 'Something went wrong' }
  }
}
```

## Step 3: API Route 생성 (필요 시)

```typescript
// app/api/{route}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  // 필드 정의
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } },
        { status: 400 }
      )
    }

    // 비즈니스 로직
    const result = await processData(parsed.data)

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}
```

## Step 4: 검증
```bash
npx tsc --noEmit 2>&1          # TypeScript 검증
npm run build 2>&1              # 빌드 검증
```

## 규칙

- **데이터 변경 = Server Action** (Next.js 프로젝트)
- 입력은 항상 Zod로 검증
- 인증 필요 여부 항상 확인
- 에러는 에러 트래킹 서비스로 보고 (console.error 대신)
- 클라이언트에 내부 에러 메시지 노출 금지
