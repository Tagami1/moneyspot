import data from "./guides-ja.generated.json";
import { getCountryByCode } from "./countries";
import { CURRENCY_TO_CITY_SLUGS, getCurrencyMeta } from "./currencies-data";
import { guides as enGuides, guideSlug as enGuideSlug, type CountryGuide } from "./guides";

export type JaGuideSection = { heading: string; body: string };
export type JaCountryGuide = {
  code: string;
  country_ja: string;
  currency_code: string;
  intro: string;
  sections: JaGuideSection[];
  quick_tips: string[];
};

export const jaGuides: JaCountryGuide[] = data as JaCountryGuide[];

/** Use the SAME slug as the English guide (by country code) so /ja/guides/<slug> mirrors /guides/<slug>. */
export function jaGuideSlug(g: JaCountryGuide): string {
  const en = enGuides.find((e) => e.code === g.code);
  return en ? enGuideSlug(en) : g.country_ja.toLowerCase();
}

export function getJaGuideBySlug(slug: string): JaCountryGuide | undefined {
  return jaGuides.find((g) => jaGuideSlug(g) === slug);
}

export function jaGuideFlag(g: JaCountryGuide): string {
  return getCountryByCode(g.code)?.flag || "🏳️";
}

export function jaGuideCities(g: JaCountryGuide): string[] {
  return CURRENCY_TO_CITY_SLUGS[g.currency_code] || [];
}

export function jaCurrencyNameJa(g: JaCountryGuide): string {
  return getCurrencyMeta(g.currency_code)?.name_ja || g.currency_code;
}

export type { CountryGuide };
