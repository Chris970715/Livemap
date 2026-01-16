# Frontend Authentication Implementation

## Overview

This document explains how authentication is implemented in the frontend using **NextAuth.js v5 (Auth.js)** with **Next.js 16**. The implementation supports multiple OAuth providers (Google, Discord, Kakao) and credentials-based authentication (email/password).

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [File Structure](#file-structure)
4. [Implementation Details](#implementation-details)
   - [NextAuth Configuration](#nextauth-configuration)
   - [Prisma Schema](#prisma-schema)
   - [Server Actions](#server-actions)
   - [Validation Schemas](#validation-schemas)
   - [Auth HOF Wrapper](#auth-hof-wrapper)
5. [JWT Token Flow](#jwt-token-flow)
6. [API Integration](#api-integration)
7. [References](#references)

---

## Technology Stack

| Technology      | Version  | Purpose                         |
| --------------- | -------- | ------------------------------- |
| Next.js         | 16       | React framework with App Router |
| NextAuth.js     | 5 (beta) | Authentication library          |
| Prisma          | 7        | Database ORM                    |
| PostgreSQL      | -        | Database (Supabase)             |
| bcryptjs        | 3.0.3    | Password hashing                |
| Zod             | 4.2.1    | Schema validation               |
| React Hook Form | 7.71     | Form state management           |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   UI Layer   │───▶│Server Actions│───▶│   NextAuth   │       │
│  │ (Components) │    │  (actions/)  │    │  (lib/auth)  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                 │                 │
│                                                 ▼                 │
│                                          ┌──────────────┐        │
│                                          │PrismaAdapter │        │
│                                          └──────────────┘        │
│                                                 │                 │
└─────────────────────────────────────────────────┼─────────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  PostgreSQL  │
                                          │  (Supabase)  │
                                          └──────────────┘
```

---

## File Structure

```
client/
├── app/
│   ├── actions/
│   │   └── auth.ts              # Server Actions for auth
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # NextAuth API route handler
│   └── auth/
│       ├── signin/
│       │   └── page.tsx         # Sign in page
│       └── register/
│           └── page.tsx         # Registration page
├── lib/
│   ├── auth/
│   │   ├── config.ts            # NextAuth configuration
│   │   ├── with-auth.ts         # Auth HOF wrapper
│   │   ├── ownership.ts         # Ownership verification utils
│   │   └── index.ts             # Public exports
│   ├── validations/
│   │   └── auth.ts              # Zod validation schemas
│   └── prisma.ts                # Prisma client singleton
├── components/
│   └── auth/
│       ├── signin-form.tsx      # Sign in form component
│       ├── register-form.tsx    # Registration form component
│       └── oauth-buttons.tsx    # OAuth provider buttons
└── prisma/
    └── schema.prisma            # Database schema
```

---

## Implementation Details

### NextAuth Configuration

**File: `lib/auth/config.ts`**

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

import prisma from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/client";
```

#### Line-by-Line Explanation:

**Lines 1-9: Imports**

- `PrismaAdapter`: Connects NextAuth to Prisma for database operations (storing users, sessions, accounts)
- `bcrypt`: Used for secure password hashing and comparison
- `NextAuth`: The main NextAuth.js function that creates the auth configuration
- `Credentials`: Provider for email/password authentication
- `Discord`, `Google`, `Kakao`: OAuth providers for social login

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
```

**Line 12-13: NextAuth Initialization**

- `handlers`: HTTP handlers for `/api/auth/*` routes
- `auth`: Function to get current session in Server Components
- `signIn`, `signOut`: Functions for programmatic sign in/out
- `adapter: PrismaAdapter(prisma)`: Tells NextAuth to use Prisma for storing user data

```typescript
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
```

**Lines 14-26: OAuth Providers**

- Each provider requires `clientId` and `clientSecret` from their developer console
- Google: https://console.cloud.google.com/apis/credentials
- Discord: https://discord.com/developers/applications
- Kakao: https://developers.kakao.com/console/app

```typescript
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
```

**Lines 27-63: Credentials Provider**

- `name: "credentials"`: Internal name for this provider
- `credentials`: Defines the form fields for the sign-in page
- `authorize`: The function that validates credentials
  1. Check if email and password are provided
  2. Look up user by email in database
  3. Verify user exists and has a password (OAuth users don't have passwords)
  4. Compare provided password with stored hash using bcrypt
  5. Return user object if valid, `null` if invalid

```typescript
  session: {
    strategy: "jwt",
  },
```

**Lines 64-66: Session Strategy**

- `strategy: "jwt"`: Uses JSON Web Tokens instead of database sessions
- JWTs are stateless and don't require database lookups on each request
- The JWT is encrypted and stored in a cookie

```typescript
  callbacks: {
    async jwt({ token, user }) {
      // 초기 로그인 시 user 객체에서 role 저장
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      // OAuth 사용자는 DB에서 role 조회 (role이 없는 경우)
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
```

**Lines 68-85: JWT Callback**

- Called whenever a JWT is created or updated
- **Initial Login**: When `user` object exists (first sign-in), store `id` and `role` in token
- **OAuth Users**: If token has no role (OAuth providers don't include role), fetch from database
- This callback customizes what data is stored in the JWT

```typescript
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
```

**Lines 86-93: Session Callback**

- Called whenever session is checked (e.g., `auth()` or `useSession()`)
- Transfers data from JWT token to the session object
- Makes `id` and `role` available in `session.user` throughout the app

```typescript
  pages: {
    signIn: "/auth/signin",
  },
});
```

**Lines 94-97: Custom Pages**

- Overrides default NextAuth pages with custom routes
- When authentication is required, users are redirected to `/auth/signin`

---

### Prisma Schema

**File: `prisma/schema.prisma`**

```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime? @map("email_verified")
  hashedPassword String?   @map("hashed_password")
  image          String?
  role           Role      @default(USER)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]
  items    Item[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

#### Field Explanations:

| Field            | Type      | Description                                   |
| ---------------- | --------- | --------------------------------------------- |
| `id`             | String    | CUID auto-generated unique identifier         |
| `name`           | String?   | User's display name (optional)                |
| `email`          | String?   | Unique email address                          |
| `emailVerified`  | DateTime? | When email was verified (null = unverified)   |
| `hashedPassword` | String?   | bcrypt hashed password (null for OAuth users) |
| `image`          | String?   | Profile image URL                             |
| `role`           | Role      | User role (USER or ADMIN)                     |
| `createdAt`      | DateTime  | Account creation timestamp                    |
| `updatedAt`      | DateTime  | Last update timestamp                         |

---

### Server Actions

**File: `app/actions/auth.ts`**

```typescript
"use server";

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { registerSchema, signInSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
```

**Line 1: `"use server"`**

- Marks this file as Server Actions
- Functions can only run on the server
- Can be called directly from client components

```typescript
export async function signInWithCredentials(formData: FormData) {
  const validation = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await signIn("credentials", {
      email: validation.data.email,
      password: validation.data.password,
      redirectTo: "/items",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Authentication error" };
      }
    }
    throw error;
  }
}
```

**signInWithCredentials Flow:**

1. Extract email and password from FormData
2. Validate with Zod schema
3. Call NextAuth's `signIn` function with credentials
4. Handle errors appropriately
5. Redirect to `/items` on success

```typescript
export async function register(formData: FormData) {
  const validation = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = validation.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already registered" };
  }

  // Hash password with bcrypt (12 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  // Auto sign in after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/items",
  });
}
```

**register Flow:**

1. Validate all form fields with Zod
2. Check for duplicate email
3. Hash password with bcrypt (12 salt rounds for security)
4. Create user in database
5. Automatically sign in the new user

---

### Validation Schemas

**File: `lib/validations/auth.ts`**

```typescript
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
```

**Schema Validation Rules:**

- `signInSchema`: Basic email format and non-empty password
- `registerSchema`:
  - Name: minimum 2 characters
  - Email: valid email format
  - Password: minimum 8 characters, must contain uppercase, lowercase, and number
  - confirmPassword: must match password (using `.refine()`)

---

### Auth HOF Wrapper

**File: `lib/auth/with-auth.ts`**

```typescript
import { auth } from "@/lib/auth";
import type { ActionResult, AuthContext } from "@/lib/types";
import * as Sentry from "@sentry/nextjs";

export function withAuth<TArgs extends unknown[], TResult>(
  fn: (ctx: AuthContext, ...args: TArgs) => Promise<ActionResult<TResult>>
) {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Authentication required" };
    }

    const ctx: AuthContext = {
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        role: session.user.role,
      },
    };

    try {
      return await fn(ctx, ...args);
    } catch (error) {
      Sentry.captureException(error);
      return { error: "An unexpected error occurred" };
    }
  };
}
```

**withAuth Pattern:**

- Higher-Order Function (HOF) for protecting Server Actions
- Automatically checks authentication before running the action
- Injects `AuthContext` with user info into the wrapped function
- Catches and reports errors to Sentry

---

## JWT Token Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JWT Token Flow                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User Login                                                        │
│     ┌────────┐                ┌──────────┐                           │
│     │ Client │──credentials──▶│ NextAuth │                           │
│     └────────┘                └──────────┘                           │
│                                    │                                  │
│  2. JWT Creation                   ▼                                  │
│                              ┌──────────┐                             │
│                              │  jwt()   │ callback                    │
│                              │ callback │                             │
│                              └──────────┘                             │
│                                    │                                  │
│                                    ▼ adds id, role                    │
│                              ┌──────────┐                             │
│                              │   JWT    │ encrypted with AUTH_SECRET  │
│                              │  Token   │                             │
│                              └──────────┘                             │
│                                    │                                  │
│  3. Cookie Storage                 ▼                                  │
│     ┌────────┐                ┌──────────┐                           │
│     │ Cookie │◀──────────────│  Set-    │                            │
│     │ Store  │               │  Cookie  │                            │
│     └────────┘               └──────────┘                             │
│                                                                       │
│  4. Subsequent Requests                                               │
│     ┌────────┐                ┌──────────┐                           │
│     │ Client │──cookie────────▶│ Backend │                           │
│     └────────┘                └──────────┘                           │
│                                    │                                  │
│                                    ▼ decrypt with AUTH_SECRET         │
│                              ┌──────────┐                             │
│                              │ Validate │                             │
│                              │   JWT    │                             │
│                              └──────────┘                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### JWT Token Contents

The JWT token created by NextAuth contains:

```json
{
  "id": "clxyz123...", // User ID (added in jwt callback)
  "email": "user@example.com", // User email
  "name": "John Doe", // User name
  "role": "USER", // User role (added in jwt callback)
  "exp": 1234567890, // Expiration timestamp
  "iat": 1234567800, // Issued at timestamp
  "jti": "unique-token-id" // JWT ID
}
```

### Cookie Names

| Environment        | Cookie Name                     |
| ------------------ | ------------------------------- |
| Production (HTTPS) | `__Secure-authjs.session-token` |
| Development (HTTP) | `authjs.session-token`          |

---

## API Integration

To send authenticated requests to the backend:

### Option 1: Using Cookies (Automatic)

```typescript
// Frontend API call - cookies are sent automatically
const response = await fetch("http://localhost:8000/api/v1/users/me", {
  credentials: "include", // Important: include cookies
});
```

### Option 2: Using Authorization Header

```typescript
import { auth } from "@/lib/auth";

async function fetchUserFromBackend() {
  const session = await auth();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("http://localhost:8000/api/v1/users/me", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  return response.json();
}
```

---

## References

### Official Documentation

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Next.js 14+ Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Prisma Adapter for Auth.js](https://authjs.dev/getting-started/adapters/prisma)

### Security Best Practices

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Salt Rounds Recommendation](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### Libraries

- [NextAuth.js GitHub](https://github.com/nextauthjs/next-auth)
- [bcryptjs npm](https://www.npmjs.com/package/bcryptjs)
- [Zod Documentation](https://zod.dev/)
