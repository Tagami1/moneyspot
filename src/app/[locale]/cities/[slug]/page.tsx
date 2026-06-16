import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPageContent } from "@/components/cities/CityPageContent";
import { cityDicts, CITY_LOCALES, type CityLocale } from "@/lib/cities-i18n";
import { getCountryByCode } from "@/lib/countries";
import {
  getPrimaryCurrencyForCountry,
  getWorldCity,
  worldCities,
} from "@/lib/world-cities";

type Props = { params: Promise<{ locale: string; slug: string }> };

const NON_EN_LOCALES = CITY_LOCALES.filter((l) => l !== "en");

export function generateStaticParams() {
  return NON_EN_LOCALES.flatMap((locale) =>
    worldCities.map((c) => ({ locale, slug: c.slug }))
  );
}

function asLocale(s: string): CityLocale | null {
  return (NON_EN_LOCALES as string[]).includes(s) ? (s as CityLocale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  if (!l) return {};
  const city = getWorldCity(slug);
  if (!city) return {};
  const country = getCountryByCode(city.country);
  const currency = getPrimaryCurrencyForCountry(city.country);
  const dict = cityDicts[l];
  const countryName =
    l === "ja" ? country?.name_ja : country?.name_en;
  return {
    title: dict.metaTitle(city.name_en, city.shop_count, countryName ?? city.country),
    description: dict.metaDesc(
      city.name_en,
      city.shop_count,
      countryName ?? city.country,
      currency
    ),
    alternates: {
      canonical: `/${l}/cities/${city.slug}`,
      languages: {
        en: `/cities/${city.slug}`,
        ja: `/ja/cities/${city.slug}`,
        zh: `/zh/cities/${city.slug}`,
        ko: `/ko/cities/${city.slug}`,
        es: `/es/cities/${city.slug}`,
        "x-default": `/cities/${city.slug}`,
      },
    },
    openGraph: {
      title: `${dict.pageHeader(city.name_en)} | MoneySpot`,
      description: dict.metaDesc(
        city.name_en,
        city.shop_count,
        countryName ?? city.country,
        currency
      ),
      url: `/${l}/cities/${city.slug}`,
      siteName: "MoneySpot",
      type: "website",
      locale: dict.ogLocale,
    },
  };
}

export default async function CityPageLocale({ params }: Props) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  if (!l) notFound();
  const city = getWorldCity(slug);
  if (!city) notFound();
  return <CityPageContent city={city} dict={cityDicts[l]} locale={l} />;
}
