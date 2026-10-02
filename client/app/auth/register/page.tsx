import { redirect } from "next/navigation";

/**
 * 공개 데모 배포에서는 회원가입을 받지 않음 — 데모 계정 로그인으로 안내
 */
export default function RegisterPage() {
  redirect("/auth/signin");
}
