/**
 * Translations for the /cities pages.
 * Keep this lean and copy-shaped — full UI i18n stays in src/i18n/messages/.
 */

export type CityLocale = "en" | "ja";

export const CITY_LOCALES: CityLocale[] = ["en", "ja"];

export type CityDict = {
  hreflang: string;
  ogLocale: string;
  back: string;
  worldwide: string;
  /** Page title pattern. Substitute %CITY%, %SHOPS%, %COUNTRY%. */
  metaTitle: (city: string, shops: number, country: string) => string;
  metaDesc: (city: string, shops: number, country: string, currency: string) => string;
  pageHeader: (city: string) => string;
  pageIntro: (shops: number, city: string, currency: string) => React.ReactNode;
  openMap: string;
  wiseCTA: (currency: string) => string;
  wiseCardTitle: (city: string, currency: string) => string;
  wiseCardBody: (city: string) => string;
  wiseCardLabel: string;
  topShopsTitle: (city: string, n: number) => string;
  topShopsSub: string;
  noShops: (city: string) => string;
  otherCitiesIn: (country: string) => string;
  statsShops: string;
  statsCurrency: string;
  statsCountry: string;
  indexTitle: string;
  indexDesc: (countries: number, cities: number, shops: number) => string;
  indexFooterLink: { label: string; href: string };
  byCountry: string;
  countriesIndexed: (n: number) => string;
};

export const cityDicts: Record<CityLocale, CityDict> = {
  en: {
    hreflang: "en",
    ogLocale: "en_US",
    back: "← All cities",
    worldwide: "Currency Exchange Worldwide",
    metaTitle: (city, shops, country) =>
      `Currency Exchange in ${city} — Best Rates & ${shops}+ Shops | MoneySpot`,
    metaDesc: (city, shops, country, currency) =>
      `Find currency exchange shops in ${city}, ${country}. Compare rates to ${currency}, see locations, opening hours, and reviews. ${shops} verified shops listed.`,
    pageHeader: (city) => `Currency Exchange in ${city}`,
    pageIntro: () => null,
    openMap: "Open in Google Maps",
    wiseCTA: (currency) => `Send money to ${currency} with Wise →`,
    wiseCardTitle: (city, currency) =>
      `Send ${currency} online from anywhere — up to 8× cheaper than banks`,
    wiseCardBody: (city) =>
      `Wise uses the real mid-market rate and shows the fee upfront. Faster than visiting a shop in ${city}.`,
    wiseCardLabel: "💸 Skip the queue",
    topShopsTitle: (city, n) => `Top ${n} Exchange Shops in ${city}`,
    topShopsSub: "Sorted by proximity to city centre. Tap any shop to open it in Google Maps.",
    noShops: (city) =>
      `No verified shops indexed yet for ${city}. Check back soon — our OpenStreetMap importer updates weekly.`,
    otherCitiesIn: (country) => `Other cities in ${country}`,
    statsShops: "Verified shops",
    statsCurrency: "Local currency",
    statsCountry: "Country",
    indexTitle: "Currency Exchange Worldwide",
    indexDesc: (countries, cities, shops) =>
      `Find the best currency exchange rates and shop locations in ${countries}+ countries and ${cities}+ cities. Browse by region or country to discover ${shops.toLocaleString()}+ exchange shops near you.`,
    indexFooterLink: { label: "日本のページはこちら →", href: "/ja/cities" },
    byCountry: "By country",
    countriesIndexed: (n) => `${n} countries indexed`,
  },

  ja: {
    hreflang: "ja",
    ogLocale: "ja_JP",
    back: "← 都市一覧",
    worldwide: "世界の両替所マップ",
    metaTitle: (city, shops) =>
      `${city}の両替所 — 最安レート比較・${shops}件以上 | MoneySpot`,
    metaDesc: (city, shops, country, currency) =>
      `${country}・${city}の両替所一覧。${currency}との両替レートを比較し、地図・営業時間・住所を確認できます。${shops}件の検証済み店舗を掲載。`,
    pageHeader: (city) => `${city}の外貨両替所`,
    pageIntro: () => null,
    openMap: "Googleマップで開く",
    wiseCTA: (currency) => `Wiseで${currency}を送金 →`,
    wiseCardTitle: (city, currency) =>
      `${currency}の海外送金は銀行より最大8倍安い`,
    wiseCardBody: (city) =>
      `Wiseは実際の中間レートと手数料を最初に表示。${city}まで店舗に出向くより速い場合も。`,
    wiseCardLabel: "💸 行列をスキップ",
    topShopsTitle: (city, n) => `${city}の両替所トップ${n}件`,
    topShopsSub: "市の中心からの距離順。タップでGoogleマップが開きます。",
    noShops: (city) =>
      `${city}は現在検証済みの両替所データがありません。OpenStreetMap連携で毎週更新中です。`,
    otherCitiesIn: (country) => `${country}の他の都市`,
    statsShops: "検証済み店舗数",
    statsCurrency: "現地通貨",
    statsCountry: "国",
    indexTitle: "世界の両替所マップ",
    indexDesc: (countries, cities, shops) =>
      `世界${countries}カ国以上、主要${cities}都市の外貨両替所をまとめて検索。地域・国別に${shops.toLocaleString()}件以上の両替所を確認できます。`,
    indexFooterLink: { label: "English version →", href: "/cities" },
    byCountry: "国別",
    countriesIndexed: (n) => `${n}カ国を掲載`,
  },
};
