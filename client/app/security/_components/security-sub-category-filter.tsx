"use client";

import "flag-icons/css/flag-icons.min.css";
import { useAtom, useAtomValue } from "jotai";

import { securityCategoryAtom, securitySubCategoryAtom, mapCenterAtom } from "@/lib/store";

const warSubCategories = [
  {
    id: "ru-uk",
    name: "russia-ukraine",
    label: "Russia - Ukraine",
    countries: ["RU", "UA"],
    center: [50.0, 30.0] as [number, number],
  },
  {
    id: "is-ir",
    name: "israel-iran",
    label: "Israel - Iran",
    countries: ["IL", "IR"],
    center: [32.0, 53.0] as [number, number],
  },
];

const securitySubCategories = [
  {
    id: "KOREA",
    name: "korea",
    label: "Korea",
    countries: ["KR"],
    center: [36.5, 127.5] as [number, number],
  },
  {
    id: "US",
    name: "us",
    label: "US",
    countries: ["US"],
    center: [39.0, -98.0] as [number, number],
  },
  {
    id: "CHINA",
    name: "china",
    label: "China",
    countries: ["CN"],
    center: [35.0, 105.0] as [number, number],
  },
  {
    id: "JAPAN",
    name: "japan",
    label: "Japan",
    countries: ["JP"],
    center: [36.0, 138.0] as [number, number],
  },
];

export function SecuritySubCategoryFilter() {
  const [selectedSubCategory, setSelectedSubCategory] = useAtom(securitySubCategoryAtom);
  const [, setCenter] = useAtom(mapCenterAtom);
  const securityCategory = useAtomValue(securityCategoryAtom);

  const handleSubCategoryClick = (subCategory: string, center?: [number, number]) => {
    setSelectedSubCategory(subCategory);
    if (center) {
      setCenter(center);
    }
  };

  const subCategories = securityCategory === "WAR" ? warSubCategories : securitySubCategories;

  const allCenter: [number, number] = securityCategory === "WAR" ? [30.0, 40.0] : [30.0, 100.0];

  return (
    <div className="flex justify-start mb-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 snap-x">
        {/* 전체 보기 */}
        <div
          className={`px-3 py-1 rounded-full cursor-pointer transition-all duration-200 text-xs ${
            selectedSubCategory === "" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
          style={{
            border: "1px solid #374151",
            backgroundColor: selectedSubCategory === "" ? "#374151" : "transparent",
          }}
          onClick={() => handleSubCategoryClick("", allCenter)}
        >
          All
        </div>
        {subCategories.map((subCategory) => (
          <div
            key={subCategory.id}
            className={`px-3 py-1 rounded-full cursor-pointer transition-all duration-200 text-xs ${
              selectedSubCategory === subCategory.id
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={{
              border: "1px solid #374151",
              backgroundColor: selectedSubCategory === subCategory.id ? "#374151" : "transparent",
            }}
            onClick={() => handleSubCategoryClick(subCategory.id, subCategory.center)}
          >
            <div className="flex items-center gap-1">
              {securityCategory === "WAR" ? (
                (() => {
                  const [left, right] = subCategory.label.split(" - ");
                  return (
                    <>
                      <span className={`fi fi-${subCategory.countries[0].toLowerCase()}`} />
                      <span>{left}</span>
                      <span className="mx-1">-</span>
                      <span className={`fi fi-${subCategory.countries[1].toLowerCase()}`} />
                      <span>{right}</span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span className={`fi fi-${subCategory.countries[0].toLowerCase()}`} />
                  <span>{subCategory.label}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
