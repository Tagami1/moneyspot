"use client";

import type { Locale } from "@/i18n/config";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  viewMode: "map" | "list";
  onViewModeChange: (mode: "map" | "list") => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onMyPageOpen: () => void;
  t: TFunction;
};

export default function Header({
  viewMode,
  onViewModeChange,
  locale,
  onLocaleChange,
  onMyPageOpen,
  t,
}: Props) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between z-50 relative">
      {/* ロゴ */}
      <div className="flex items-center gap-0 flex-shrink-0">
        <svg viewBox="0 0 60 72" width="22" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1">
          <path d="M30 4C15.6 4 4 15.2 4 29c0 19 26 41 26 41s26-22 26-41C56 15.2 44.4 4 30 4z" fill="#2563eb"/>
          <circle cx="30" cy="27" r="14" fill="white"/>
          <text x="30" y="33" textAnchor="middle" fontFamily="Outfit, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#2563eb">MS</text>
        </svg>
        <span className="text-lg font-black text-blue-600" style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif" }}>Money</span>
        <span className="text-lg font-black text-gray-800" style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif" }}>Spot</span>
      </div>

      {/* マップ/リスト切替 */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => onViewModeChange("map")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "map"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          {t("header.map")}
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "list"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          {t("header.list")}
        </button>
      </div>

      {/* マイページ */}
      <button
        onClick={onMyPageOpen}
        className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 hover:bg-gray-50 flex items-center gap-1"
      >
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
          <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z"/>
        </svg>
        {t("mypage.title")}
      </button>
    </header>
  );
}
