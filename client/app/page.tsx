import { redirect } from "next/navigation";

/**
 * 메인 기능(안보 지도 + 피드)으로 바로 이동
 */
export default function HomePage() {
  redirect("/security");
}
