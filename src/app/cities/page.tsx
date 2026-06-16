import type { Metadata } from "next";
import Link from "next/link";
import {
  REGIONS,
  getAllCountriesWithShops,
  getCitiesByRegion,
  worldCitiesMeta,
} from "@/lib/world-cities";

export const metadata: Metadata = {
  title: "Currency Exchange Worldwide — Find the Best Rates in 185+ Cities | MoneySpot",
  description:
    "Compare currency exchange shops in 185+ cities worldwide. Real-time rates, locations, and reviews for Tokyo, London, Bangkok, Dubai, Paris, and more.",
  alternates: { canonical: "/cities" },
  openGraph: {
    title: "Currency Exchange Worldwide | MoneySpot",
    description:
      "Find the best currency exchange rates in 185+ cities across 80+ countries.",
    url: "/cities",
    siteName: "MoneySpot",
    type: "website",
  },
};

export default function CitiesIndexPage() {
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
            Currency Exchange Worldwide
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
            Find the best currency exchange rates and shop locations in <strong>{countries.length}+ countries</strong> and{" "}
            <strong>185+ cities</strong>. Browse by region or country to discover {totalShops.toLocaleString()}+ exchange shops near you.
          </p>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            日本語サイトは{" "}
            <Link href="/areas" className="font-semibold text-blue-700 underline">
              地域別ページ
            </Link>
            { " からどうぞ。"}
          </p>
        </div>
      </section>

      {/* By region */}
      {REGIONS.map((region) => {
        const cities = getCitiesByRegion(region.id);
        if (cities.length === 0) return null;
        return (
          <section key={region.id} className="border-b border-gray-100">
            <div className="mx-auto max-w-6xl px-5 py-8">
              <h2 className="text-2xl font-black text-gray-950">{region.name_en}</h2>
              <p className="mt-1 text-sm text-gray-500">{region.name_ja}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
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

      {/* Countries summary */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <h2 className="text-xl font-black text-gray-950">By country</h2>
          <p className="mt-1 text-sm text-gray-500">
            {countries.length} countries indexed
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span aria-hidden>{c.flag}</span>
                  {c.name_en}
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
