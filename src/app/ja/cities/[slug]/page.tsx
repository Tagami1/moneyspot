import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityPageContent } from "@/components/cities/CityPageContent";
import { getCountryByCode } from "@/lib/countries";
import {
  getPrimaryCurrencyForCountry,
  getWorldCity,
  worldCities,
} from "@/lib/world-cities";
import { cityDicts } from "@/lib/cities-i18n";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return worldCities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getWorldCity(slug);
  if (!city) return {};
  const country = getCountryByCode(city.country);
  const currency = getPrimaryCurrencyForCountry(city.country);
  const dict = cityDicts.ja;
  return {
    title: dict.metaTitle(city.name_en, city.shop_count, country?.name_ja ?? city.country),
    description: dict.metaDesc(city.name_en, city.shop_count, country?.name_ja ?? city.country, currency),
    keywords: [
      `${city.name_en} 両替`,
      `${country?.name_ja ?? city.country} 両替所`,
      `${city.name_en} 外貨両替`,
      `${city.name_en} ${currency} 両替`,
      `海外旅行 ${city.name_en} 両替`,
    ],
    alternates: {
      canonical: `/ja/cities/${city.slug}`,
      languages: {
        en: `/cities/${city.slug}`,
        ja: `/ja/cities/${city.slug}`,
        "x-default": `/cities/${city.slug}`,
      },
    },
    openGraph: {
      title: `${dict.pageHeader(city.name_en)} | MoneySpot`,
      description: `${city.name_en}の両替所${city.shop_count}件。`,
      url: `/ja/cities/${city.slug}`,
      siteName: "MoneySpot",
      type: "website",
      locale: "ja_JP",
      alternateLocale: ["en_US"],
    },
  };
}

export default async function CityPageJa({ params }: Props) {
  const { slug } = await params;
  const city = getWorldCity(slug);
  if (!city) notFound();
  return <CityPageContent city={city} dict={cityDicts.ja} locale="ja" />;
}
