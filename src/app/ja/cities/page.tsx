import type { Metadata } from "next";
import Link from "next/link";
import {
  REGIONS,
  getAllCountriesWithShops,
  getCitiesByRegion,
  worldCitiesMeta,
} from "@/lib/world-cities";

export const metadata: Metadata = {
  title: "世界の外貨両替所マップ — 185都市以上のレート比較 | MoneySpot",
  description:
    "世界185都市以上、80カ国の両替所をまとめて検索。東京・ロンドン・バンコク・ドバイ・パリなどの両替レートを比較。",
  alternates: {
    canonical: "/ja/cities",
    languages: {
      en: "/cities",
      ja: "/ja/cities",
      "x-default": "/cities",
    },
  },
  openGraph: {
    title: "世界の外貨両替所マップ | MoneySpot",
    description: "世界185都市以上、80カ国の両替所をまとめて検索。",
    url: "/ja/cities",
    siteName: "MoneySpot",
    type: "website",
    locale: "ja_JP",
  },
};

export default function CitiesIndexJaPage() {
  const countries = getAllCountriesWithShops();
  const totalShops = worldCitiesMeta.assigned_shops;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">
            ← MoneySpot
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            世界の外貨両替所マップ
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
            <strong>{countries.length}カ国以上</strong>、<strong>185都市以上</strong>
            の両替所をまとめて検索。地域・国別に{totalShops.toLocaleString()}件以上の両替所から最寄りの店舗を見つけられます。
          </p>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            English page is{" "}
            <Link href="/cities" className="font-semibold text-blue-700 underline">
              here
            </Link>
            .
          </p>
        </div>
      </section>

      {REGIONS.map((region) => {
        const cities = getCitiesByRegion(region.id);
        if (cities.length === 0) return null;
        return (
          <section key={region.id} className="border-b border-gray-100">
            <div className="mx-auto max-w-6xl px-5 py-8">
              <h2 className="text-2xl font-black text-gray-950">{region.name_ja}</h2>
              <p className="mt-1 text-sm text-gray-500">{region.name_en}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/ja/cities/${city.slug}`}
                    className="group rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        {city.country}
                      </p>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                        {city.shop_count}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-black text-gray-950 group-hover:text-blue-700">
                      {city.name_en}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <h2 className="text-xl font-black text-gray-950">国別一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            {countries.length}カ国を掲載
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span aria-hidden>{c.flag}</span>
                  {c.name_ja}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {c.shop_count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
