# CLAUDE.md

Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 개발 명령어

```bash
npm run dev              # 개발 서버 시작
npm run build            # 프로덕션 빌드
npm run db:push          # DB 스키마 동기화
npm run db:generate      # Prisma Client 생성
npm run lint:fix         # ESLint + Prettier 자동 수정
```

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, React Compiler
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Auth**: NextAuth v5 + Google/Discord OAuth
- **Database**: Prisma 7 + PostgreSQL
- **Forms**: React Hook Form + Zod
- **Monitoring**: Sentry

---

## 필수 패턴

### 1. 폼 패턴 (Form Pattern)

**모든 폼은 React Hook Form + Zod + formState.isSubmitting 사용**

```typescript
// ✅ 올바른 패턴
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { someSchema, type SomeFormValues } from "@/lib/validations/...";

const form = useForm<SomeFormValues>({
  resolver: zodResolver(someSchema),
  defaultValues: { ... },
});

const onSubmit = async (data: SomeFormValues) => {
  const result = await serverAction(data);
  if (result.error) {
    toast.error(result.error);
  } else {
    toast.success("성공");
  }
};

// 버튼에서 formState.isSubmitting 사용
<Button disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? "처리 중..." : "저장"}
</Button>
```

```typescript
// ❌ 금지 패턴
const [isLoading, setIsLoading] = useState(false); // useState 금지
router.refresh(); // Server Action이 revalidatePath 호출하므로 불필요
```

**참조 파일**: `components/items/item-form.tsx`

### 2. 캐시 무효화 패턴 (Cache Invalidation)

**데이터 변경 시 모든 관련 태그 무효화**

```typescript
// Item 변경 시
updateTag(CACHE_TAGS.ITEMS);
updateTag(CACHE_TAGS.ITEM(id));
updateTag(CACHE_TAGS.USER_ITEMS(ctx.user.id));
```

**참조 파일**: `app/actions/items/mutations.ts`

### 3. Server Action 패턴

**withAuth HOF + ActionResult 타입 + Sentry 에러 처리**

```typescript
export const createItem = withAuth(async (ctx, dto: CreateDto): Promise<ActionResult<Item>> => {
  try {
    // 1. Zod 검증
    const validation = schema.safeParse(dto);
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
    }

    // 2. DB 작업
    const result = await prisma.item.create({ data: dto });

    // 3. 캐시 무효화
    updateTag(CACHE_TAGS.ITEMS);
    revalidatePath("/items");

    return { data: result };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "createItem" } });
    return { error: ERROR_MESSAGES.REQUEST_ERROR };
  }
});
```

**참조 파일**: `app/actions/items/mutations.ts`

### 4. 에러 처리

```typescript
// ❌ 금지
console.error("Error:", error);

// ✅ 필수
Sentry.captureException(error, { tags: { action: "actionName" } });
```

---

## 파일 구조

```
app/
├── actions/              # Server Actions
│   ├── items/            # queries.ts, mutations.ts
│   ├── auth.ts
│   └── index.ts
├── auth/                 # 인증 페이지
├── items/                # 아이템 CRUD 페이지
└── api/auth/             # NextAuth API

lib/
├── auth/                 # NextAuth 설정, withAuth HOF
├── validations/          # Zod 스키마
├── constants/            # 상수 (cache-tags, messages)
├── types/                # ActionResult 등
├── prisma.ts             # Prisma 싱글톤
└── utils.ts              # cn 유틸리티

components/
├── ui/                   # shadcn/ui 컴포넌트
├── auth/                 # OAuth 버튼
└── items/                # 아이템 폼, 카드
```

## 타입 네이밍

| 용도              | 접미사        | 예시                   |
| ----------------- | ------------- | ---------------------- |
| Server Action DTO | `*Dto`        | `UpdateItemDto`        |
| 폼 값             | `*FormValues` | `CreateItemFormValues` |

## 주의사항

1. **Server Components 기본** - "use client"는 필요할 때만
2. **mutations는 Server Actions** - API routes 사용 금지
3. **인증은 layout.tsx에서** - page.tsx에서 하지 않음
4. **router.refresh() 금지** - revalidatePath가 자동 처리
5. **useState(isLoading) 금지** - form.formState.isSubmitting 사용
