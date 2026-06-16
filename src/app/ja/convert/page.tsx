import type { Metadata } from "next";
import Link from "next/link";
import { CONVERT_CURRENCIES, pairSlug } from "@/lib/currencies-data";
import { crossRate, formatAmount } from "@/lib/rates";

export const metadata: Metadata = {
  title: "通貨換算ツール｜24通貨のリアルタイム為替レート | MoneySpot",
  description:
    "無料の通貨換算ツール。米ドル・ユーロ・円・ポンド・タイバーツなど24通貨をリアルタイムの中間レートで換算。現金を両替できる場所も探せます。",
  alternates: {
    canonical: "/ja/convert",
    languages: { en: "/convert", ja: "/ja/convert", "x-default": "/convert" },
  },
  openGraph: {
    title: "通貨換算ツール | MoneySpot",
    description: "24通貨のリアルタイム為替レート＋世界の両替所検索。",
    url: "/ja/convert",
    siteName: "MoneySpot",
    type: "website",
    locale: "ja_JP",
  },
};

const POPULAR = [
  ["USD", "JPY"], ["JPY", "USD"], ["EUR", "JPY"], ["JPY", "EUR"], ["GBP", "JPY"],
  ["KRW", "JPY"], ["JPY", "KRW"], ["THB", "JPY"], ["JPY", "THB"], ["TWD", "JPY"],
  ["CNY", "JPY"], ["JPY", "USD"], ["USD", "EUR"], ["AUD", "JPY"], ["HKD", "JPY"],
  ["SGD", "JPY"], ["VND", "JPY"], ["IDR", "JPY"], ["PHP", "JPY"], ["JPY", "TWD"],
];

export default function JaConvertIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">← MoneySpot</Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            通貨換算ツール
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">
            24の主要通貨をリアルタイムの中間レートで換算。早見表で確認でき、現地で現金を両替できる
            世界245都市以上の両替所も探せます。
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/convert" className="font-semibold text-blue-700 underline">English version →</Link>
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">よく使われる換算</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map(([from, to]) => {
              const r = crossRate(from, to);
              return (
                <Link
                  key={`${from}-${to}`}
                  href={`/ja/convert/${pairSlug(from, to)}`}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-black text-gray-950">{from} → {to}</p>
                  {r != null && (
                    <p className="mt-1 text-sm text-gray-500">1 {from} = {formatAmount(r, to)} {to}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <h2 className="text-xl font-black text-gray-950">すべての通貨</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CONVERT_CURRENCIES.map((c) => (
              <Link
                key={c.code}
                href={`/ja/convert/${pairSlug(c.code, c.code === "JPY" ? "USD" : "JPY")}`}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 hover:border-blue-300"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span aria-hidden>{c.flag}</span> {c.code}
                </span>
                <span className="text-xs text-gray-400">{c.name_ja}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
