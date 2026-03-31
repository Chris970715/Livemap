---
paths:
  - "client/**/*.tsx"
  - "client/**/*.ts"
  - "app/**/*.ts"
  - "components/**/*.tsx"
---

# Next.js 규칙

## 컴포넌트
- **Server Components 기본** — 'use client'는 useState, useEffect, 이벤트 핸들러 등 클라이언트 기능 필요 시에만
- Server Component에서 async/await로 직접 데이터 페칭
- Client Component는 최소 범위로 분리 (잎 노드에 배치)
- Server/Client 경계에서 직렬화 가능한 props만 전달 (함수, Date 객체 등 금지)

## 데이터 페칭
- **병렬 페칭 우선** — Sequential waterfall 방지
  ```typescript
  // Good: 병렬
  const [users, posts] = await Promise.all([getUsers(), getPosts()])

  // Bad: Sequential
  const users = await getUsers()
  const posts = await getPosts()  // users 완료까지 대기
  ```
- `unstable_cache` 또는 `fetch` cache 옵션으로 캐싱 전략 설정
- `revalidateTag` / `revalidatePath`로 세밀한 캐시 무효화

## 데이터 변경
- **데이터 변경 = Server Actions** — API Route 사용 금지
- Server Action에서 `revalidatePath` / `revalidateTag`로 캐시 무효화
- 폼은 `<form action={serverAction}>` + progressive enhancement
- useFormStatus / useActionState로 로딩 상태 관리

## 라우팅
- App Router 규칙: layout.tsx, page.tsx, loading.tsx, error.tsx
- 인증은 layout 또는 middleware에서 처리
- `router.refresh()` 금지 — revalidation으로 대체
- 동적 라우트 파라미터: `generateStaticParams`로 정적 생성 가능 여부 확인

## 에러 처리
- **에러 바운더리 계층**: layout > page > component 단위 error.tsx
- Server Action: try-catch + ActionResult 타입 반환
- 에러 트래킹 서비스(Sentry 등)로 보고
- `console.error` 대신 에러 트래킹 사용
- `notFound()` / `redirect()`는 try-catch 밖에서 호출

## 성능
- `next/image`로 이미지 최적화 (width, height 필수)
- `next/font`로 폰트 최적화 (layout.tsx에서 로드)
- dynamic import로 클라이언트 번들 최소화
- Suspense boundary로 스트리밍 렌더링
- `loading.tsx`로 즉시 로딩 UI 제공
