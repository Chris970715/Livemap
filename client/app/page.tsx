import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LiveMap - 실시간 안보 정보",
  description: "실시간 안보 정보와 지도를 제공하는 서비스",
};

export default function HomePage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">홈</h1>
      <p className="text-gray-300">메인 페이지 콘텐츠가 여기에 표시됩니다.</p>
    </div>
  );
}
