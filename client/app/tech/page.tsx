import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기술/IT - LiveMap",
  description: "기술 트렌드와 IT 뉴스",
};

export default function TechPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">기술/IT</h1>
      <p className="text-gray-300">기술 트렌드와 IT 뉴스가 여기에 표시됩니다.</p>
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">서비스 준비 중입니다...</p>
      </div>
    </div>
  );
}
