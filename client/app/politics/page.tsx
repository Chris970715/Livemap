import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "정치 - LiveMap",
  description: "정치 관련 뉴스와 분석",
};

export default function PoliticsPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">정치</h1>
      <p className="text-gray-300">정치 관련 뉴스와 분석이 여기에 표시됩니다.</p>
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">서비스 준비 중입니다...</p>
      </div>
    </div>
  );
}
