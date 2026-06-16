import type { Metadata } from "next";
import Link from "next/link";
import { jaGuideFlag, jaGuideSlug, jaGuides } from "@/lib/guides-ja";

export const metadata: Metadata = {
  title: "海外旅行のお金ガイド｜国別の両替・通貨・現金事情 | MoneySpot",
  description:
    "国別の「旅行のお金」完全ガイド。現地通貨、現金とカードの使い分け、一番得する両替方法、ATM、チップ、詐欺対策まで。海外旅行前に必読。",
  alternates: {
    canonical: "/ja/guides",
    languages: { en: "/guides", ja: "/ja/guides", "x-default": "/guides" },
  },
  openGraph: {
    title: "海外旅行のお金ガイド（国別） | MoneySpot",
    description: "24カ国の両替・通貨・現金・チップ事情を日本語で解説。",
    url: "/ja/guides",
    siteName: "MoneySpot",
    type: "website",
    locale: "ja_JP",
  },
};

export default function JaGuidesIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">← MoneySpot</Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            海外旅行のお金ガイド
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">
            行く前に知っておきたい「お金のこと」を国別にまとめました。現地通貨、現金とカードの使い分け、
            一番得する両替方法、ATM・チップのコツ、そして避けるべき詐欺まで。
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/guides" className="font-semibold text-blue-700 underline">English version →</Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jaGuides.map((g) => (
            <Link
              key={g.code}
              href={`/ja/guides/${jaGuideSlug(g)}`}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-gray-950">{jaGuideFlag(g)} {g.country_ja}</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{g.currency_code}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{g.intro}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
