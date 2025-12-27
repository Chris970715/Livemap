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
- **Auth**: NextAuth v5 + Google/Discord/Kakao OAuth
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

**계층적 데이터 변경 시 모든 관련 태그 무효화**

```typescript
// Item 변경 시 (관련된 모든 태그)
updateTag(CACHE_TAGS.ITEMS);
updateTag(CACHE_TAGS.ITEM(id));
updateTag(CACHE_TAGS.USER_ITEMS(ctx.user.id));

// 부모-자식 관계가 있는 경우 (예: Course > Section > Lecture)
// 자식 변경 시 부모 태그도 무효화
updateTag(CACHE_TAGS.LECTURES(sectionId));
updateTag(CACHE_TAGS.SECTIONS(courseId));
updateTag(CACHE_TAGS.COURSE(courseId));
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

---

## Hook 규칙

**Git commit 후 PostToolUse hook이 실행되면 반드시 즉시 따를 것**

1. **Hook 메시지 = 즉시 실행** - "나중에 한 번에" 금지
2. 커밋 완료 → Obsidian 기록 작성 → 다음 작업 진행 순서 엄수
3. 여러 커밋이 있어도 각 커밋마다 기록 완료 후 다음 진행
4. "효율성"을 이유로 hook 지시를 건너뛰지 않음

## 커밋 규칙

**각 커밋 전에 반드시 사용자 확인을 받을 것**

1. 커밋 내용 요약 후 "진행할까요?" 질문
2. 사용자 승인 후에만 커밋 실행
3. 연속 커밋이라도 매번 확인 필요

## 스크린샷 규칙

**UI 변경 작업 시 Playwright MCP로 자동 캡처**

### 플로우

1. **작업 시작 전** (코드 수정 전):
   - Playwright로 해당 페이지 이동
   - `mcp__playwright__browser_take_screenshot`으로 before 캡처
   - 저장 후 코드 수정 시작

2. **코드 수정 완료 후** (커밋 전):
   - 같은 페이지에서 after 캡처
   - "커밋할까요?" 질문

3. **커밋 후**:
   - Obsidian 커밋 로그에 스크린샷 경로 포함

### 설정

- **저장 경로**: `{OBSIDIAN_PATH}/screenshots/`
- **파일명**: `YYYY-MM-DD-HHMM-{page}-before.png`, `YYYY-MM-DD-HHMM-{page}-after.png`
- **로그인 필요 시**: OAuth로 한 번 로그인하면 대화 중 세션 유지

### 예외 (스크린샷 불필요)

- **새 페이지 생성**: before 없음, after만 캡처
- **페이지 불명확**: 먼저 사용자에게 질문
- **스크린샷 불필요**: API, 설정, 유틸리티 파일만 변경 시

### 예외 아님 (반드시 스크린샷 필요)

다음 핑계는 인정하지 않음:

- ❌ "데이터 의존적" → 테스트 데이터가 있는 상태에서 캡처
- ❌ "추후 확인 필요" → 지금 당장 확인
- ❌ "모바일 뷰 확인 필요" → 브라우저 리사이즈로 즉시 확인

### 커밋 전 체크리스트 (UI 변경 시)

```
커밋 전 필수 확인:
1. [ ] 개발 서버에서 해당 페이지 열기
2. [ ] before 스크린샷 캡처 (첫 커밋이면 생략)
3. [ ] after 스크린샷 캡처
4. [ ] 사용자에게 "커밋할까요?" 확인
5. [ ] 커밋 후 Obsidian 로그에 스크린샷 경로 포함
```

**Obsidian 커밋 기록:**

- 기록: `{OBSIDIAN_PATH}/commits/YYYY-MM-DD.md`
- 형식: Why(왜) → What(무엇을) → How(어떻게) → Result(결과)
