import { getCountryByCode } from "./countries";
import data from "./world-cities.generated.json";

export type WorldShop = {
  id: number;
  name: string | null;
  name_en: string | null;
  address: string | null;
  address_en: string | null;
  lat: number;
  lng: number;
  source: string;
  distance_km: number;
};

export type WorldCity = {
  slug: string;
  name_en: string;
  country: string;
  lat: number;
  lng: number;
  r: number;
  shop_count: number;
  top_shops: WorldShop[];
};

type WorldCitiesPayload = {
  generated_at: string;
  total_shops: number;
  assigned_shops: number;
  cities: WorldCity[];
};

const payload = data as WorldCitiesPayload;

export const worldCities: WorldCity[] = payload.cities;
export const worldCitiesMeta = {
  generated_at: payload.generated_at,
  total_shops: payload.total_shops,
  assigned_shops: payload.assigned_shops,
};

export function getWorldCity(slug: string): WorldCity | undefined {
  return worldCities.find((c) => c.slug === slug);
}

export function getCitiesByCountry(countryCode: string): WorldCity[] {
  return worldCities.filter((c) => c.country === countryCode);
}

export function getAllCountriesWithShops(): { code: string; name_en: string; name_ja: string; flag: string; city_count: number; shop_count: number }[] {
  const map = new Map<string, { city_count: number; shop_count: number }>();
  for (const c of worldCities) {
    if (c.shop_count === 0) continue;
    const cur = map.get(c.country) || { city_count: 0, shop_count: 0 };
    cur.city_count += 1;
    cur.shop_count += c.shop_count;
    map.set(c.country, cur);
  }
  return Array.from(map.entries())
    .map(([code, stats]) => {
      const country = getCountryByCode(code);
      return {
        code,
        name_en: country?.name_en ?? code,
        name_ja: country?.name_ja ?? code,
        flag: country?.flag ?? "🏳️",
        ...stats,
      };
    })
    .sort((a, b) => b.shop_count - a.shop_count);
}

/** Group cities by continent-ish region for nicer index UI. */
const REGION_MAP: Record<string, string> = {
  // East Asia
  JP: "asia-east", KR: "asia-east", CN: "asia-east", HK: "asia-east", MO: "asia-east", TW: "asia-east", MN: "asia-east",
  // SE Asia
  TH: "asia-se", SG: "asia-se", MY: "asia-se", ID: "asia-se", PH: "asia-se", VN: "asia-se", KH: "asia-se", LA: "asia-se", MM: "asia-se", BN: "asia-se",
  // South Asia
  IN: "asia-south", NP: "asia-south", LK: "asia-south", MV: "asia-south", BD: "asia-south", PK: "asia-south", BT: "asia-south",
  // Middle East
  AE: "me", QA: "me", OM: "me", BH: "me", KW: "me", SA: "me", JO: "me", LB: "me", IL: "me", PS: "me", TR: "me", IR: "me", IQ: "me", SY: "me", YE: "me",
  // Caucasus/Central Asia
  GE: "asia-central", AM: "asia-central", AZ: "asia-central", KZ: "asia-central", UZ: "asia-central", KG: "asia-central", TJ: "asia-central", TM: "asia-central", AF: "asia-central",
  // Europe West
  GB: "europe-west", FR: "europe-west", NL: "europe-west", BE: "europe-west", LU: "europe-west", DE: "europe-west", CH: "europe-west", AT: "europe-west", ES: "europe-west", PT: "europe-west", IT: "europe-west", IE: "europe-west", DK: "europe-west", SE: "europe-west", NO: "europe-west", FI: "europe-west", IS: "europe-west",
  // Europe Central/East
  CZ: "europe-east", HU: "europe-east", PL: "europe-east", SK: "europe-east", SI: "europe-east", HR: "europe-east", RS: "europe-east", BG: "europe-east", RO: "europe-east", GR: "europe-east", AL: "europe-east", MK: "europe-east", MD: "europe-east", LT: "europe-east", LV: "europe-east", EE: "europe-east", UA: "europe-east", BY: "europe-east", RU: "europe-east",
  // Americas
  US: "americas", CA: "americas", MX: "americas", CU: "americas", DO: "americas", CR: "americas", PA: "americas",
  CO: "americas", PE: "americas", EC: "americas", CL: "americas", AR: "americas", UY: "americas", BR: "americas", VE: "americas",
  // Africa
  EG: "africa", MA: "africa", TN: "africa", DZ: "africa", NG: "africa", GH: "africa", KE: "africa", UG: "africa", RW: "africa", TZ: "africa", ET: "africa", ZA: "africa", CM: "africa",
  // Oceania
  AU: "oceania", NZ: "oceania",
};

export const REGIONS: { id: string; name_en: string; name_ja: string }[] = [
  { id: "asia-east",      name_en: "East Asia",                name_ja: "東アジア" },
  { id: "asia-se",        name_en: "Southeast Asia",           name_ja: "東南アジア" },
  { id: "asia-south",     name_en: "South Asia",               name_ja: "南アジア" },
  { id: "me",             name_en: "Middle East & Turkey",     name_ja: "中東・トルコ" },
  { id: "asia-central",   name_en: "Central Asia & Caucasus",  name_ja: "中央アジア・コーカサス" },
  { id: "europe-west",    name_en: "Western Europe",           name_ja: "西ヨーロッパ" },
  { id: "europe-east",    name_en: "Central & Eastern Europe", name_ja: "中・東ヨーロッパ" },
  { id: "americas",       name_en: "Americas",                 name_ja: "南北アメリカ" },
  { id: "africa",         name_en: "Africa",                   name_ja: "アフリカ" },
  { id: "oceania",        name_en: "Oceania",                  name_ja: "オセアニア" },
];

export function getRegionForCountry(code: string): string {
  return REGION_MAP[code] || "other";
}

export function getCitiesByRegion(regionId: string): WorldCity[] {
  return worldCities
    .filter((c) => getRegionForCountry(c.country) === regionId)
    .filter((c) => c.shop_count > 0)
    .sort((a, b) => b.shop_count - a.shop_count);
}

/** Heuristic: the country's primary currency. Used for the "compare X to USD" hint on a city page. */
export function getPrimaryCurrencyForCountry(code: string): string {
  const map: Record<string, string> = {
    JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", MO: "MOP", TW: "TWD", SG: "SGD", MY: "MYR",
    TH: "THB", VN: "VND", PH: "PHP", ID: "IDR", KH: "KHR", LA: "LAK", MM: "MMK",
    IN: "INR", NP: "NPR", LK: "LKR", PK: "PKR", BD: "BDT", MV: "MVR",
    AE: "AED", QA: "QAR", OM: "OMR", BH: "BHD", KW: "KWD", SA: "SAR", JO: "JOD", LB: "LBP", IL: "ILS",
    TR: "TRY", IR: "IRR", IQ: "IQD", SY: "SYP", YE: "YER",
    GE: "GEL", AM: "AMD", AZ: "AZN", KZ: "KZT", UZ: "UZS", KG: "KGS", AF: "AFN",
    GB: "GBP", FR: "EUR", NL: "EUR", BE: "EUR", LU: "EUR", DE: "EUR", CH: "CHF", AT: "EUR", ES: "EUR",
    PT: "EUR", IT: "EUR", IE: "EUR", DK: "DKK", SE: "SEK", NO: "NOK", FI: "EUR", IS: "ISK",
    CZ: "CZK", HU: "HUF", PL: "PLN", SK: "EUR", SI: "EUR", HR: "EUR", RS: "RSD", BG: "BGN",
    RO: "RON", GR: "EUR", AL: "ALL", MK: "MKD", MD: "MDL", LT: "EUR", LV: "EUR", EE: "EUR",
    UA: "UAH", BY: "BYN", RU: "RUB",
    US: "USD", CA: "CAD", MX: "MXN", CU: "CUP", DO: "DOP", CR: "CRC", PA: "USD",
    CO: "COP", PE: "PEN", EC: "USD", CL: "CLP", AR: "ARS", UY: "UYU", BR: "BRL", VE: "VES",
    EG: "EGP", MA: "MAD", TN: "TND", DZ: "DZD", NG: "NGN", GH: "GHS", KE: "KES", UG: "UGX",
    RW: "RWF", TZ: "TZS", ET: "ETB", ZA: "ZAR", CM: "XAF",
    AU: "AUD", NZ: "NZD",
  };
  return map[code] || "USD";
}
