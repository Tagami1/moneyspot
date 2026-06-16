import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cityDicts, CITY_LOCALES, type CityLocale } from "@/lib/cities-i18n";
import { getCountryByCode } from "@/lib/countries";
import {
  REGIONS,
  getAllCountriesWithShops,
  getCitiesByRegion,
  worldCities,
  worldCitiesMeta,
} from "@/lib/world-cities";

type Props = { params: Promise<{ locale: string }> };

const NON_EN_LOCALES = CITY_LOCALES.filter((l) => l !== "en");
const CITY_COUNT = worldCities.filter((c) => c.shop_count > 0).length;

export function generateStaticParams() {
  return NON_EN_LOCALES.map((locale) => ({ locale }));
}

function asLocale(s: string): CityLocale | null {
  return (NON_EN_LOCALES as string[]).includes(s) ? (s as CityLocale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = asLocale(locale);
  if (!l) return {};
  const dict = cityDicts[l];
  const countries = getAllCountriesWithShops();
  return {
    title: `${dict.indexTitle} | MoneySpot`,
    description: dict.indexDesc(countries.length, CITY_COUNT, worldCitiesMeta.assigned_shops),
    alternates: {
      canonical: `/${l}/cities`,
      languages: {
        en: "/cities",
        ja: "/ja/cities",
        zh: "/zh/cities",
        ko: "/ko/cities",
        es: "/es/cities",
        "x-default": "/cities",
      },
    },
    openGraph: {
      title: `${dict.indexTitle} | MoneySpot`,
      description: dict.indexDesc(countries.length, CITY_COUNT, worldCitiesMeta.assigned_shops),
      url: `/${l}/cities`,
      siteName: "MoneySpot",
      type: "website",
      locale: dict.ogLocale,
    },
  };
}

export default async function CitiesIndexLocalePage({ params }: Props) {
  const { locale } = await params;
  const l = asLocale(locale);
  if (!l) notFound();

  const dict = cityDicts[l];
  const countries = getAllCountriesWithShops();
  const cityCount = CITY_COUNT;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">
            ← MoneySpot
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {dict.indexTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
            {dict.indexDesc(countries.length, cityCount, worldCitiesMeta.assigned_shops)}
          </p>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            <Link href="/cities" className="font-semibold text-blue-700 underline">
              English version →
            </Link>
          </p>
        </div>
      </section>

      {REGIONS.map((region) => {
        const cities = getCitiesByRegion(region.id);
        if (cities.length === 0) return null;
        const regionName = l === "ja" ? region.name_ja : region.name_en;
        return (
          <section key={region.id} className="border-b border-gray-100">
            <div className="mx-auto max-w-6xl px-5 py-8">
              <h2 className="text-2xl font-black text-gray-950">{regionName}</h2>
              {l !== "en" && (
                <p className="mt-1 text-sm text-gray-500">{region.name_en}</p>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${l}/cities/${city.slug}`}
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
          <h2 className="text-xl font-black text-gray-950">{dict.byCountry}</h2>
          <p className="mt-1 text-sm text-gray-500">{dict.countriesIndexed(countries.length)}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {countries.map((c) => {
              const country = getCountryByCode(c.code);
              const name = l === "ja" ? country?.name_ja ?? c.name_en : country?.name_en ?? c.name_en;
              return (
                <div
                  key={c.code}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span aria-hidden>{c.flag}</span>
                    {name}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {c.shop_count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
