"use client";

import { useAtom } from "jotai";

import { securityCategoryAtom } from "@/lib/store";

export function SecurityCategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useAtom(securityCategoryAtom);

  const handleCategoryClick = (category: "WAR" | "SECURITY") => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="flex rounded-lg p-1" style={{ backgroundColor: "#12131a" }}>
        {/* 전쟁 카테고리 */}
        <div
          className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            selectedCategory === "WAR" ? "text-white" : "text-white hover:bg-gray-700/50"
          }`}
          style={{
            backgroundColor: selectedCategory === "WAR" ? "#2c2c35" : "#17171c",
          }}
          onClick={() => handleCategoryClick("WAR")}
        >
          <span className="text-sm font-medium">War</span>
          <div className="ml-2 text-xs text-gray-400">Interstate conflict</div>
        </div>

        {/* 안보 카테고리 */}
        <div
          className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition-all duration-200 ${
            selectedCategory === "SECURITY" ? "text-white" : "text-white hover:bg-gray-700/50"
          }`}
          style={{
            backgroundColor: selectedCategory === "SECURITY" ? "#2c2c35" : "#17171c",
          }}
          onClick={() => handleCategoryClick("SECURITY")}
        >
          <span className="text-sm font-medium">Security</span>
          <div className="ml-2 text-xs text-gray-400">By country</div>
        </div>
      </div>
    </div>
  );
}
