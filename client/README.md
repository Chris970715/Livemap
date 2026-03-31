# Next.js Full-Stack Boilerplate

Next.js 16 + React 19 기반의 풀스택 보일러플레이트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router), React 19, React Compiler
- **Styling**: Tailwind CSS v4, shadcn/ui (new-york)
- **Auth**: NextAuth v5 (Google, Discord, Credentials)
- **Database**: Prisma 7 + PostgreSQL (with `@prisma/adapter-pg`)
- **Forms**: React Hook Form + Zod
- **Monitoring**: Sentry
- **Code Quality**: ESLint 9, Prettier, lint-staged, Husky

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값들을 채워주세요:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `AUTH_SECRET`: `openssl rand -base64 32`로 생성
- Google/Discord OAuth 키

### 3. 데이터베이스 설정

```bash
npm run db:push      # 스키마 동기화
npm run db:generate  # Prisma Client 생성
```

### 4. 개발 서버 시작

```bash
npm run dev
```

## 프로젝트 구조

```
├── app/
│   ├── actions/         # Server Actions
│   ├── auth/            # 인증 페이지 (로그인, 회원가입)
│   ├── items/           # 예제 CRUD 페이지
│   └── api/auth/        # NextAuth API 라우트
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── auth/            # OAuth 버튼
│   └── items/           # 아이템 폼, 카드
├── lib/
│   ├── auth/            # NextAuth 설정, withAuth HOF
│   ├── constants/       # 캐시 태그, 메시지 상수
│   ├── types/           # ActionResult 타입
│   ├── validations/     # Zod 스키마
│   └── prisma.ts        # Prisma 싱글톤
└── prisma/
    └── schema.prisma    # DB 스키마
```

## 주요 패턴

### Server Action with withAuth

```typescript
export const createItem = withAuth(async (ctx, dto: CreateDto): Promise<ActionResult<Item>> => {
  // ctx.user.id로 인증된 사용자 접근
  const item = await prisma.item.create({
    data: { ...dto, userId: ctx.user.id },
  });
  return { data: item };
});
```

### 폼 패턴 (React Hook Form + Zod)

```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { title: "" },
});

<Button disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? "처리 중..." : "저장"}
</Button>
```

## Claude + Obsidian 자동화

커밋 시 자동으로 Obsidian에 기록하는 Claude 훅이 포함되어 있습니다.

### 설정 방법

1. **MCP 서버 설치**:

```bash
# Obsidian MCP
claude mcp add obsidian -- npx -y @anthropic/mcp-obsidian ~/Desktop/obsidian

# Playwright MCP (스크린샷용)
claude mcp add playwright -- npx @playwright/mcp@latest
```

2. **환경 변수 설정** (`.env`):

```bash
OBSIDIAN_VAULT_PATH=~/Desktop/obsidian
PROJECT_NAME=my-project
```

3. **Obsidian 폴더 구조 생성**:

```
obsidian/
├── work/
│   ├── projects/
│   │   └── {PROJECT_NAME}/
│   │       ├── commits/      # 커밋 기록
│   │       └── screenshots/  # 스크린샷
│   └── templates/
│       └── commit-log.md     # 커밋 템플릿
└── ...
```

### 커밋 템플릿 예시 (`commit-log.md`)

```markdown
## {{시간}}

### Why

- 왜 이 변경이 필요했는지

### What

- 무엇을 변경했는지

### How

- 어떻게 구현했는지

### Result

- 결과/영향

### Screenshots

![[before.png]]
![[after.png]]
```

## 명령어

| 명령어                | 설명                        |
| --------------------- | --------------------------- |
| `npm run dev`         | 개발 서버 시작              |
| `npm run build`       | 프로덕션 빌드               |
| `npm run lint:fix`    | ESLint + Prettier 자동 수정 |
| `npm run db:push`     | DB 스키마 동기화            |
| `npm run db:generate` | Prisma Client 생성          |
| `npm run db:studio`   | Prisma Studio 실행          |

## OAuth 설정

### Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 OAuth 2.0 클라이언트 ID 생성
2. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`

### Discord

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 앱 생성
2. OAuth2 > Redirects: `http://localhost:3000/api/auth/callback/discord`

## 라이선스

MIT
