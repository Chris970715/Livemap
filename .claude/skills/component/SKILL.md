---
name: component
description: React 컴포넌트 생성. 기존 컴포넌트 2개를 분석하여 실제 패턴 추출 후 생성.
user-invocable: true
argument-hint: "<컴포넌트명> [경로]"
---

# React 컴포넌트 생성

$ARGUMENTS 에 대한 React 컴포넌트를 프로젝트 패턴에 맞게 생성한다.

## Step 1: 패턴 추출 (기존 컴포넌트 2개 분석)
```bash
# 컴포넌트 디렉토리 구조 확인
ls src/components/ 2>/dev/null || ls components/ 2>/dev/null || ls app/ 2>/dev/null
```

기존 컴포넌트 **2개를 반드시 읽어서** 다음을 추출:
- **파일 구조**: 단일 파일 vs 디렉토리(index.ts + component.tsx)
- **Server/Client**: 기본 Server Component 여부, 'use client' 사용 기준
- **Props 정의**: `interface` vs `type`, export 여부, 위치
- **스타일링**: Tailwind / CSS Modules / styled-components
- **네이밍**: PascalCase 파일명, kebab-case 디렉토리 등
- **Import 패턴**: 절대경로(@/), 상대경로, barrel export

## Step 2: 컴포넌트 생성
1. 추출한 패턴에 **정확히** 맞게 컴포넌트 파일 생성
2. Props 타입 정의
3. 기본 구조 작성
4. **Server Component가 기본** — 'use client'는 필요 시에만

```typescript
// 예시 (패턴에 따라 변형)
interface {Name}Props {
  // 추출된 패턴에 맞춤
}

export function {Name}({ ...props }: {Name}Props) {
  return (
    // 추출된 스타일링 패턴에 맞춤
  )
}
```

## Step 3: 검증
```bash
# TypeScript 검증
npx tsc --noEmit 2>&1 | grep -i "error" || echo "No TS errors"

# 빌드 검증
npm run build 2>&1
```

필요 시 스토리/테스트 파일 생성 여부 질문.

## 규칙

- 기존 프로젝트 패턴을 **반드시** 따름 (추측 금지, 실제 코드에서 추출)
- 불필요한 추상화 금지 (단순한 컴포넌트는 단순하게)
- shadcn/ui 사용 프로젝트면 shadcn 컴포넌트 활용
- Props는 interface로 정의, export
- children은 React.ReactNode
- 이벤트 핸들러: `on` + 동사 (onClick, onSubmit)
