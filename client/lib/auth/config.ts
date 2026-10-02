import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";

import prisma from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/client";

// OAuth 공급자는 키가 설정된 경우에만 활성화 (데모 배포는 Credentials만 사용)
const oauthProviders = [
  process.env.GOOGLE_CLIENT_ID &&
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  process.env.DISCORD_CLIENT_ID &&
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  process.env.KAKAO_CLIENT_ID &&
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
].filter((provider) => !!provider);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...oauthProviders,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 이메일 또는 비밀번호가 필요합니다.
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // 사용자가 존재하지 않거나 비밀번호가 없는 경우
        if (!user || !user.hashedPassword) {
          throw new Error("Invalid email or password.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        // 비밀번호가 일치하지 않는 경우
        if (!isPasswordValid) {
          throw new Error("Invalid email or password.");
        }

        // 사용자 정보 반환
        return {
          id: user.id, // 사용자 ID
          email: user.email, // 사용자 이메일
          name: user.name, // 사용자 이름
          image: user.image, // 사용자 프로필 이미지
          role: user.role, // 사용자 역할
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
          // 기본값은 USER
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
