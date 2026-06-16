import type { Metadata } from "next";
import Link from "next/link";
import { CONVERT_CURRENCIES, pairSlug } from "@/lib/currencies-data";
import { crossRate, formatAmount } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Currency Converter — Live Exchange Rates for 24 Currencies | MoneySpot",
  description:
    "Free currency converter with live mid-market rates. Convert USD, EUR, JPY, GBP, THB and 20+ currencies, and find where to exchange cash near you.",
  alternates: { canonical: "/convert" },
  openGraph: {
    title: "Currency Converter | MoneySpot",
    description: "Live exchange rates for 24 currencies + where to exchange cash worldwide.",
    url: "/convert",
    siteName: "MoneySpot",
    type: "website",
  },
};

const POPULAR = [
  ["USD", "JPY"], ["USD", "EUR"], ["EUR", "USD"], ["USD", "GBP"], ["GBP", "USD"],
  ["USD", "THB"], ["USD", "KRW"], ["JPY", "USD"], ["USD", "CNY"], ["EUR", "JPY"],
  ["USD", "PHP"], ["USD", "INR"], ["AUD", "USD"], ["USD", "IDR"], ["USD", "VND"],
  ["USD", "SGD"], ["USD", "MYR"], ["USD", "TWD"], ["USD", "HKD"], ["USD", "MXN"],
];

export default function ConvertIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">← MoneySpot</Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Currency Converter
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">
            Live mid-market exchange rates for 24 major currencies. Convert, see rate tables, and
            find verified exchange shops near you in 245+ cities.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">Popular conversions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map(([from, to]) => {
              const r = crossRate(from, to);
              return (
                <Link
                  key={`${from}-${to}`}
                  href={`/convert/${pairSlug(from, to)}`}
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
          <h2 className="text-xl font-black text-gray-950">All currencies</h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CONVERT_CURRENCIES.map((c) => (
              <Link
                key={c.code}
                href={`/convert/${pairSlug(c.code, c.code === "USD" ? "JPY" : "USD")}`}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 hover:border-blue-300"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span aria-hidden>{c.flag}</span> {c.code}
                </span>
                <span className="text-xs text-gray-400">{c.name_en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
