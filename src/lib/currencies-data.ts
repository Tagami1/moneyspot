/**
 * Curated currency set for the /convert programmatic-SEO pages.
 * Chosen for travel relevance + search volume. All ordered pairs are generated.
 */

export type CurrencyMeta = {
  code: string;
  name_en: string;
  name_ja: string;
  symbol: string;
  flag: string;
};

export const CONVERT_CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name_en: "US Dollar",        name_ja: "米ドル",         symbol: "$",   flag: "🇺🇸" },
  { code: "EUR", name_en: "Euro",             name_ja: "ユーロ",         symbol: "€",   flag: "🇪🇺" },
  { code: "JPY", name_en: "Japanese Yen",     name_ja: "日本円",         symbol: "¥",   flag: "🇯🇵" },
  { code: "GBP", name_en: "British Pound",    name_ja: "英ポンド",       symbol: "£",   flag: "🇬🇧" },
  { code: "AUD", name_en: "Australian Dollar",name_ja: "豪ドル",         symbol: "A$",  flag: "🇦🇺" },
  { code: "CAD", name_en: "Canadian Dollar",  name_ja: "カナダドル",     symbol: "C$",  flag: "🇨🇦" },
  { code: "CHF", name_en: "Swiss Franc",      name_ja: "スイスフラン",   symbol: "Fr",  flag: "🇨🇭" },
  { code: "CNY", name_en: "Chinese Yuan",     name_ja: "中国元",         symbol: "¥",   flag: "🇨🇳" },
  { code: "HKD", name_en: "Hong Kong Dollar", name_ja: "香港ドル",       symbol: "HK$", flag: "🇭🇰" },
  { code: "SGD", name_en: "Singapore Dollar", name_ja: "シンガポールドル",symbol: "S$",  flag: "🇸🇬" },
  { code: "KRW", name_en: "South Korean Won", name_ja: "韓国ウォン",     symbol: "₩",   flag: "🇰🇷" },
  { code: "THB", name_en: "Thai Baht",        name_ja: "タイバーツ",     symbol: "฿",   flag: "🇹🇭" },
  { code: "INR", name_en: "Indian Rupee",     name_ja: "インドルピー",   symbol: "₹",   flag: "🇮🇳" },
  { code: "IDR", name_en: "Indonesian Rupiah",name_ja: "インドネシアルピア",symbol: "Rp",flag: "🇮🇩" },
  { code: "MYR", name_en: "Malaysian Ringgit",name_ja: "マレーシアリンギット",symbol: "RM",flag: "🇲🇾" },
  { code: "PHP", name_en: "Philippine Peso",  name_ja: "フィリピンペソ", symbol: "₱",   flag: "🇵🇭" },
  { code: "VND", name_en: "Vietnamese Dong",  name_ja: "ベトナムドン",   symbol: "₫",   flag: "🇻🇳" },
  { code: "TWD", name_en: "Taiwan Dollar",    name_ja: "台湾ドル",       symbol: "NT$", flag: "🇹🇼" },
  { code: "NZD", name_en: "New Zealand Dollar",name_ja: "NZドル",        symbol: "NZ$", flag: "🇳🇿" },
  { code: "AED", name_en: "UAE Dirham",       name_ja: "UAEディルハム",  symbol: "د.إ", flag: "🇦🇪" },
  { code: "TRY", name_en: "Turkish Lira",     name_ja: "トルコリラ",     symbol: "₺",   flag: "🇹🇷" },
  { code: "MXN", name_en: "Mexican Peso",     name_ja: "メキシコペソ",   symbol: "$",   flag: "🇲🇽" },
  { code: "BRL", name_en: "Brazilian Real",   name_ja: "ブラジルレアル", symbol: "R$",  flag: "🇧🇷" },
  { code: "ZAR", name_en: "South African Rand",name_ja: "南アフリカランド",symbol: "R", flag: "🇿🇦" },
];

export const CONVERT_CODES = CONVERT_CURRENCIES.map((c) => c.code);

export function getCurrencyMeta(code: string): CurrencyMeta | undefined {
  return CONVERT_CURRENCIES.find((c) => c.code === code.toUpperCase());
}

/** Slug like "usd-to-jpy" → { from:"USD", to:"JPY" } */
export function parsePairSlug(slug: string): { from: string; to: string } | null {
  const m = slug.toLowerCase().match(/^([a-z]{3})-to-([a-z]{3})$/);
  if (!m) return null;
  const from = m[1].toUpperCase();
  const to = m[2].toUpperCase();
  if (from === to) return null;
  if (!CONVERT_CODES.includes(from) || !CONVERT_CODES.includes(to)) return null;
  return { from, to };
}

export function pairSlug(from: string, to: string): string {
  return `${from.toLowerCase()}-to-${to.toLowerCase()}`;
}

/** All ordered pairs (from != to). */
export function allPairs(): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = [];
  for (const a of CONVERT_CODES) {
    for (const b of CONVERT_CODES) {
      if (a !== b) out.push({ from: a, to: b });
    }
  }
  return out;
}

/** Countries (city slugs) where a currency is the local money — for cross-links. */
export const CURRENCY_TO_CITY_SLUGS: Record<string, string[]> = {
  USD: ["new-york", "los-angeles", "miami", "las-vegas", "honolulu"],
  EUR: ["paris", "rome", "barcelona", "amsterdam", "berlin"],
  JPY: ["tokyo", "osaka", "kyoto", "fukuoka", "sapporo"],
  GBP: ["london", "edinburgh", "manchester"],
  AUD: ["sydney", "melbourne", "brisbane", "perth"],
  CAD: ["toronto", "vancouver", "montreal"],
  CHF: ["zurich", "geneva"],
  CNY: ["beijing", "shanghai", "guangzhou", "chengdu", "xian"],
  HKD: ["hong-kong"],
  SGD: ["singapore"],
  KRW: ["seoul", "busan"],
  THB: ["bangkok", "phuket", "chiang-mai", "pattaya", "koh-samui"],
  INR: ["mumbai", "new-delhi", "bangalore", "jaipur", "goa"],
  IDR: ["jakarta", "bali", "surabaya", "yogyakarta"],
  MYR: ["kuala-lumpur", "penang", "malacca", "langkawi"],
  PHP: ["manila", "cebu", "davao"],
  VND: ["ho-chi-minh-city", "hanoi", "da-nang", "hoi-an", "nha-trang"],
  TWD: ["taipei", "kaohsiung"],
  NZD: ["auckland", "wellington"],
  AED: ["dubai", "abu-dhabi", "sharjah"],
  TRY: ["istanbul", "antalya", "bodrum", "ankara"],
  MXN: ["mexico-city", "cancun", "playa-del-carmen", "puerto-vallarta"],
  BRL: ["sao-paulo", "rio-de-janeiro", "brasilia", "fortaleza"],
  ZAR: ["johannesburg", "cape-town"],
};
