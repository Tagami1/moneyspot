/**
 * Translations for the /cities pages.
 * Keep this lean and copy-shaped — full UI i18n stays in src/i18n/messages/.
 */

export type CityLocale = "en" | "ja" | "zh" | "ko" | "es";

export const CITY_LOCALES: CityLocale[] = ["en", "ja", "zh", "ko", "es"];

/** URL prefix for a non-default locale ("" for en, "/ja" for ja, etc.) */
export function localePrefix(locale: CityLocale): string {
  return locale === "en" ? "" : `/${locale}`;
}

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
  // Free-product CTA (replaces affiliate CTA until 100 users)
  saveLabel: string;
  saveTitle: (city: string) => string;
  saveBody: string;
  saveCTA: string;
  // Money-saving tips (user value + SEO content)
  tipsTitle: (city: string) => string;
  tips: (city: string, currency: string) => string[];
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
    openMap: "View shops on the map",
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
    saveLabel: "⭐ Free account",
    saveTitle: (city) => `Save your favourite shops in ${city}`,
    saveBody:
      "Create a free account to bookmark exchange shops, get rate alerts, and sync across your devices. No fees, no ads.",
    saveCTA: "Sign up free with email →",
    tipsTitle: (city) => `Tips for exchanging money in ${city}`,
    tips: (city, currency) => [
      `Shops away from the airport and main tourist streets usually offer better ${currency} rates.`,
      "Always compare the buy/sell spread — a low headline rate can hide a wide spread.",
      "Ask if there's a commission on top of the rate; the best shops quote all-in.",
      "Count your cash before leaving the counter and keep the receipt.",
    ],
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
    openMap: "地図で店舗を見る",
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
    saveLabel: "⭐ 無料アカウント",
    saveTitle: (city) => `${city}のお気に入り両替所を保存`,
    saveBody:
      "無料登録でお気に入り店舗をブックマーク、レート通知、端末間で同期。手数料・広告なし。",
    saveCTA: "メールで無料登録 →",
    tipsTitle: (city) => `${city}で両替するときのコツ`,
    tips: (city, currency) => [
      `空港や観光地の中心から離れた店舗のほうが${currency}のレートが良い傾向があります。`,
      "売値・買値のスプレッド（差）を必ず比較。表示レートが良くてもスプレッドが広いことがあります。",
      "レートとは別に手数料がかかるか確認を。良い店は手数料込みで提示します。",
      "カウンターを離れる前に必ず金額を数え、レシートを保管しましょう。",
    ],
  },

  zh: {
    hreflang: "zh",
    ogLocale: "zh_CN",
    back: "← 全部城市",
    worldwide: "全球货币兑换地图",
    metaTitle: (city, shops) =>
      `${city}的货币兑换所 — 比较最佳汇率与${shops}家以上店铺 | MoneySpot`,
    metaDesc: (city, shops, country, currency) =>
      `${country}${city}的货币兑换所。比较${currency}汇率、地图位置、营业时间。已收录${shops}家经核实的店铺。`,
    pageHeader: (city) => `${city}的货币兑换所`,
    pageIntro: () => null,
    openMap: "在地图上查看店铺",
    wiseCTA: (currency) => `使用 Wise 兑换 ${currency} →`,
    wiseCardTitle: (city, currency) =>
      `在线汇款${currency} — 比银行便宜最多8倍`,
    wiseCardBody: (city) =>
      `Wise 使用实际的中间汇率,费用一目了然。比在${city}找店铺更快。`,
    wiseCardLabel: "💸 跳过排队",
    topShopsTitle: (city, n) => `${city}前 ${n} 家兑换店`,
    topShopsSub: "按距市中心距离排序。点击任意店铺在 Google 地图打开。",
    noShops: (city) =>
      `${city}暂未收录已核实的兑换店。我们的 OpenStreetMap 数据每周更新,敬请稍后再查看。`,
    otherCitiesIn: (country) => `${country}的其他城市`,
    statsShops: "已核实店铺",
    statsCurrency: "本地货币",
    statsCountry: "国家",
    indexTitle: "全球货币兑换地图",
    indexDesc: (countries, cities, shops) =>
      `全球${countries}+ 国家、${cities}+ 城市的货币兑换店统一检索。按地区或国家浏览,发现身边的${shops.toLocaleString()}+ 家兑换店。`,
    indexFooterLink: { label: "English version →", href: "/cities" },
    byCountry: "按国家",
    countriesIndexed: (n) => `已收录 ${n} 个国家`,
    saveLabel: "⭐ 免费账户",
    saveTitle: (city) => `收藏${city}的常用兑换店`,
    saveBody:
      "免费注册即可收藏兑换店、设置汇率提醒、多设备同步。无手续费、无广告。",
    saveCTA: "用邮箱免费注册 →",
    tipsTitle: (city) => `在${city}换钱的小贴士`,
    tips: (city, currency) => [
      `远离机场和主要旅游街区的店铺通常${currency}汇率更好。`,
      "务必比较买入/卖出价差,标价好不代表价差小。",
      "确认汇率之外是否还收手续费,优质店铺会报全包价。",
      "离开柜台前一定要数清现金并保留收据。",
    ],
  },

  ko: {
    hreflang: "ko",
    ogLocale: "ko_KR",
    back: "← 전체 도시",
    worldwide: "전세계 환전소 지도",
    metaTitle: (city, shops) =>
      `${city} 환전소 — 최저 환율 비교・${shops}개 이상 | MoneySpot`,
    metaDesc: (city, shops, country, currency) =>
      `${country} ${city}의 환전소 목록. ${currency} 환율 비교, 지도, 영업시간, 주소를 확인. ${shops}개 검증된 매장 수록.`,
    pageHeader: (city) => `${city} 환전소`,
    pageIntro: () => null,
    openMap: "지도에서 매장 보기",
    wiseCTA: (currency) => `Wise로 ${currency} 송금 →`,
    wiseCardTitle: (city, currency) =>
      `${currency} 해외송금 - 은행보다 최대 8배 저렴`,
    wiseCardBody: (city) =>
      `Wise는 실제 중간 환율과 수수료를 먼저 보여줍니다. ${city}에서 매장을 찾는 것보다 빠를 수 있습니다.`,
    wiseCardLabel: "💸 줄 서지 마세요",
    topShopsTitle: (city, n) => `${city} 환전소 상위 ${n}곳`,
    topShopsSub: "도심에서 가까운 순. 매장을 누르면 Google 지도가 열립니다.",
    noShops: (city) =>
      `${city}는 아직 검증된 환전소 데이터가 없습니다. OpenStreetMap 연동으로 매주 업데이트됩니다.`,
    otherCitiesIn: (country) => `${country}의 다른 도시`,
    statsShops: "검증된 매장",
    statsCurrency: "현지 통화",
    statsCountry: "국가",
    indexTitle: "전세계 환전소 지도",
    indexDesc: (countries, cities, shops) =>
      `전세계 ${countries}개국 이상, ${cities}개 도시의 환전소를 통합 검색. 지역별·국가별로 ${shops.toLocaleString()}개 이상의 환전소를 확인.`,
    indexFooterLink: { label: "English version →", href: "/cities" },
    byCountry: "국가별",
    countriesIndexed: (n) => `${n}개국 수록`,
    saveLabel: "⭐ 무료 계정",
    saveTitle: (city) => `${city}의 즐겨찾는 환전소 저장`,
    saveBody:
      "무료 가입으로 환전소를 북마크하고 환율 알림을 받고 여러 기기에서 동기화하세요. 수수료·광고 없음.",
    saveCTA: "이메일로 무료 가입 →",
    tipsTitle: (city) => `${city}에서 환전할 때 팁`,
    tips: (city, currency) => [
      `공항과 주요 관광지에서 떨어진 매장이 보통 ${currency} 환율이 더 좋습니다.`,
      "매수/매도 스프레드를 꼭 비교하세요. 표시 환율이 좋아도 스프레드가 넓을 수 있습니다.",
      "환율 외 수수료가 있는지 확인하세요. 좋은 매장은 수수료 포함으로 안내합니다.",
      "카운터를 떠나기 전에 반드시 금액을 세고 영수증을 보관하세요.",
    ],
  },

  es: {
    hreflang: "es",
    ogLocale: "es_ES",
    back: "← Todas las ciudades",
    worldwide: "Casas de cambio en el mundo",
    metaTitle: (city, shops) =>
      `Casa de cambio en ${city} — Mejores tasas y ${shops}+ tiendas | MoneySpot`,
    metaDesc: (city, shops, country, currency) =>
      `Encuentra casas de cambio en ${city}, ${country}. Compara tasas a ${currency}, ubicaciones, horarios y reseñas. ${shops} tiendas verificadas.`,
    pageHeader: (city) => `Casas de cambio en ${city}`,
    pageIntro: () => null,
    openMap: "Ver en el mapa",
    wiseCTA: (currency) => `Envía ${currency} con Wise →`,
    wiseCardTitle: (city, currency) =>
      `Envía ${currency} en línea — hasta 8× más barato que los bancos`,
    wiseCardBody: (city) =>
      `Wise usa la tasa real del mercado y muestra la comisión por adelantado. Más rápido que ir a una tienda en ${city}.`,
    wiseCardLabel: "💸 Sin colas",
    topShopsTitle: (city, n) => `Top ${n} casas de cambio en ${city}`,
    topShopsSub: "Ordenadas por proximidad al centro. Pulsa para abrir en Google Maps.",
    noShops: (city) =>
      `Aún no hay tiendas verificadas en ${city}. Nuestra base de OpenStreetMap se actualiza semanalmente.`,
    otherCitiesIn: (country) => `Otras ciudades en ${country}`,
    statsShops: "Tiendas verificadas",
    statsCurrency: "Moneda local",
    statsCountry: "País",
    indexTitle: "Casas de cambio en el mundo",
    indexDesc: (countries, cities, shops) =>
      `Encuentra casas de cambio en ${countries}+ países y ${cities}+ ciudades. Explora por región o país y descubre ${shops.toLocaleString()}+ tiendas.`,
    indexFooterLink: { label: "English version →", href: "/cities" },
    byCountry: "Por país",
    countriesIndexed: (n) => `${n} países indexados`,
    saveLabel: "⭐ Cuenta gratis",
    saveTitle: (city) => `Guarda tus casas de cambio favoritas en ${city}`,
    saveBody:
      "Crea una cuenta gratis para guardar casas de cambio, recibir alertas de tasas y sincronizar entre dispositivos. Sin comisiones ni anuncios.",
    saveCTA: "Regístrate gratis con tu email →",
    tipsTitle: (city) => `Consejos para cambiar dinero en ${city}`,
    tips: (city, currency) => [
      `Las casas lejos del aeropuerto y las zonas turísticas suelen dar mejor tasa de ${currency}.`,
      "Compara siempre el diferencial compra/venta; una tasa baja puede ocultar un margen amplio.",
      "Pregunta si hay comisión además de la tasa; las mejores casas la incluyen todo.",
      "Cuenta el efectivo antes de salir del mostrador y guarda el recibo.",
    ],
  },
};
