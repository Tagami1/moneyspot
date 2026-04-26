"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES, POPULAR_COUNTRY_CODES, type Country } from "@/lib/countries";

type Props = {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  locale: "ja" | "en";
  className?: string;
};

export default function CountrySelect({ value, onChange, placeholder, locale, className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const getName = (c: Country) => locale === "ja" ? c.name_ja : c.name_en;

  const filtered = search.trim()
    ? COUNTRIES.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name_en.toLowerCase().includes(q) ||
          c.name_ja.includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
      })
    : (() => {
        const popular = POPULAR_COUNTRY_CODES
          .map((code) => COUNTRIES.find((c) => c.code === code)!)
          .filter(Boolean);
        const rest = COUNTRIES.filter((c) => !POPULAR_COUNTRY_CODES.includes(c.code));
        return [...popular, ...rest];
      })();

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
      >
        {selected ? (
          <span>{selected.flag} {getName(selected)}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === "ja" ? "国名で検索..." : "Search country..."}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                {locale === "ja" ? "見つかりません" : "No results"}
              </div>
            ) : (
              filtered.map((c, i) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex items-center gap-2 ${
                    c.code === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                  } ${
                    !search.trim() && i === POPULAR_COUNTRY_CODES.length ? "border-t border-gray-100" : ""
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="flex-1 truncate">{getName(c)}</span>
                  <span className="text-gray-400 text-xs">{c.phone}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
