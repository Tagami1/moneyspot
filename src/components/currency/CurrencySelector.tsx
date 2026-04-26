"use client";

import { useState } from "react";
import type { Currency } from "@/lib/database.types";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  currencies: Currency[];
  selectedCurrency: string;
  locale: string;
  t: TFunction;
  onSelect: (code: string) => void;
  onClose: () => void;
};

const popularCodes = ["USD", "EUR", "GBP", "CNY", "KRW", "TWD", "THB", "AUD"];

export default function CurrencySelector({
  currencies,
  selectedCurrency,
  locale,
  t,
  onSelect,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  const popular = currencies.filter((c) => popularCodes.includes(c.code));
  const filtered = search
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name_en.toLowerCase().includes(search.toLowerCase()) ||
          c.name_ja.includes(search)
      )
    : currencies;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{t("currency.title")}</h2>
            <button onClick={onClose} className="text-gray-400 text-xl">
              ×
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("currency.searchPlaceholder")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 人気の通貨 */}
        {!search && (
          <div className="px-4 py-3 border-b">
            <p className="text-xs text-gray-500 mb-2">{t("currency.popular")}</p>
            <div className="flex flex-wrap gap-2">
              {popular.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    onSelect(c.code);
                    onClose();
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedCurrency === c.code
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {c.flag_emoji} {c.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 全通貨リスト */}
        <div className="overflow-y-auto flex-1">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                onSelect(c.code);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${
                selectedCurrency === c.code ? "bg-blue-50" : ""
              }`}
            >
              <span className="text-2xl">{c.flag_emoji}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{c.code}</p>
                <p className="text-xs text-gray-500">
                  {locale === "ja" ? c.name_ja : c.name_en} / {locale === "ja" ? c.name_en : c.name_ja}
                </p>
              </div>
              {selectedCurrency === c.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
