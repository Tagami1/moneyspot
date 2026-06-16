import data from "./guides.generated.json";
import { getCountryByCode } from "./countries";
import { CURRENCY_TO_CITY_SLUGS, getCurrencyMeta } from "./currencies-data";

export type GuideSection = { heading: string; body: string };
export type CountryGuide = {
  code: string;
  country_en: string;
  currency_code: string;
  intro: string;
  sections: GuideSection[];
  quick_tips: string[];
};

export const guides: CountryGuide[] = data as CountryGuide[];

export function guideSlug(g: CountryGuide): string {
  return g.country_en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getGuideBySlug(slug: string): CountryGuide | undefined {
  return guides.find((g) => guideSlug(g) === slug);
}

export function guideCityLinks(g: CountryGuide): { slug: string }[] {
  return (CURRENCY_TO_CITY_SLUGS[g.currency_code] || []).map((slug) => ({ slug }));
}

export function guideFlag(g: CountryGuide): string {
  return getCountryByCode(g.code)?.flag || "🏳️";
}

export function guideCurrencyName(g: CountryGuide): string {
  return getCurrencyMeta(g.currency_code)?.name_en || g.currency_code;
}
