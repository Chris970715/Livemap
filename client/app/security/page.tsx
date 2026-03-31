import { Suspense } from "react";
import type { Metadata } from "next";

import { SecurityInteractive } from "./_components/security-interactive";

export const metadata: Metadata = {
  title: "실시간 안보 뉴스 | LiveMap",
  description: "전쟁과 안보 관련 실시간 뉴스를 지도와 함께 확인하세요",
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<div className="py-8 text-center text-gray-400">로딩 중...</div>}>
        <SecurityInteractive />
      </Suspense>
    </div>
  );
}
