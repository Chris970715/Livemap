"use client";

import { useAtom } from "jotai";

import { securityCategoryAtom } from "@/lib/store";

export function SecurityCategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useAtom(securityCategoryAtom);

  const handleCategoryClick = (category: "전쟁" | "안보") => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="flex rounded-lg p-1" style={{ backgroundColor: "#12131a" }}>
        {/* 전쟁 카테고리 */}
        <div
          className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            selectedCategory === "전쟁" ? "text-white" : "text-white hover:bg-gray-700/50"
          }`}
          style={{
            backgroundColor: selectedCategory === "전쟁" ? "#2c2c35" : "#17171c",
          }}
          onClick={() => handleCategoryClick("전쟁")}
        >
          <span className="text-sm font-medium">전쟁</span>
          <div className="ml-2 text-xs text-gray-400">국가간 충돌</div>
        </div>

        {/* 안보 카테고리 */}
        <div
          className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            selectedCategory === "안보" ? "text-white" : "text-white hover:bg-gray-700/50"
          }`}
          style={{
            backgroundColor: selectedCategory === "안보" ? "#2c2c35" : "#17171c",
          }}
          onClick={() => handleCategoryClick("안보")}
        >
          <span className="text-sm font-medium">안보</span>
          <div className="ml-2 text-xs text-gray-400">국가별 안보</div>
        </div>
      </div>
    </div>
  );
}
