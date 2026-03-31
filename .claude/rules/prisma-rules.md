---
paths:
  - "client/prisma/**"
  - "client/lib/prisma*"
  - "lib/db*"
  - "lib/prisma*"
---

# Prisma 규칙

## 스키마
- 모델명: PascalCase 단수형 (User, Post, Comment)
- 필드명: camelCase
- 관계 필드: 관련 모델명 소문자 (user, posts)
- `@updatedAt` 자동 타임스탬프 활용
- enum은 대문자 스네이크: `ACTIVE`, `PENDING`

## 쿼리
- `select`로 필요한 필드만 조회 (과도한 데이터 페칭 방지)
- 관계 데이터: `include` 또는 `select` 내 중첩
- 리스트: `take` + `skip`으로 페이지네이션
- **N+1 방지**: 루프 내 쿼리 금지, `include`로 미리 로드
  ```typescript
  // Bad: N+1
  const users = await prisma.user.findMany()
  for (const user of users) {
    const posts = await prisma.post.findMany({ where: { userId: user.id } })
  }

  // Good: include
  const users = await prisma.user.findMany({ include: { posts: true } })
  ```

## Connection Pooling
- 싱글턴 패턴으로 Prisma Client 인스턴스 관리
  ```typescript
  // lib/prisma.ts
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- Edge Runtime 사용 시 Prisma Accelerate 또는 Data Proxy 필수

## 마이그레이션
- 마이그레이션 이름은 설명적: `add_user_avatar`, `create_comment_table`
- 프로덕션 DB 직접 `db push` 금지 — 반드시 `migrate deploy`
- 컬럼 삭제 전 데이터 백업 확인

## 타입 안전성
- Prisma Client 자동 생성 타입 활용
- `Prisma.UserCreateInput` 등 input 타입 사용
- 커스텀 타입은 Prisma 타입 기반으로 확장

## 트랜잭션
- 여러 쓰기 작업은 `prisma.$transaction()` 사용
- interactive transaction 우선 (sequential보다)
- 트랜잭션 내 외부 API 호출 금지 (타임아웃 위험)

## 인덱스
- 자주 WHERE 절에 사용되는 필드에 `@@index` 추가
- 복합 인덱스: 쿼리 패턴에 맞게 필드 순서 결정
- unique 제약: `@@unique` 활용
