/**
 * Multi-locale travel-money guides for zh / ko (and future locales).
 * en lives in guides.ts, ja in guides-ja.ts (dedicated routes already exist).
 * This module powers the dynamic /[locale]/guides routes for the rest.
 */
import { getCountryByCode } from "./countries";
import { CURRENCY_TO_CITY_SLUGS, getCurrencyMeta } from "./currencies-data";
import { guides as enGuides, guideSlug as enGuideSlug } from "./guides";
import zhData from "./guides-zh.generated.json";
import koData from "./guides-ko.generated.json";

export type LocGuideSection = { heading: string; body: string };
export type LocGuide = {
  code: string;
  country: string; // localized country name
  currency_code: string;
  intro: string;
  sections: LocGuideSection[];
  quick_tips: string[];
};

export type GuideLocale = "zh" | "ko";
export const GUIDE_LOCALES: GuideLocale[] = ["zh", "ko"];

type RawGuide = {
  code: string;
  currency_code: string;
  intro: string;
  sections: LocGuideSection[];
  quick_tips: string[];
  country_zh?: string;
  country_ko?: string;
};

function normalize(raw: RawGuide[], field: "country_zh" | "country_ko"): LocGuide[] {
  return raw.map((g) => ({
    code: g.code,
    country: (g[field] as string) || g.code,
    currency_code: g.currency_code,
    intro: g.intro,
    sections: g.sections,
    quick_tips: g.quick_tips,
  }));
}

const DATA: Record<GuideLocale, LocGuide[]> = {
  zh: normalize(zhData as RawGuide[], "country_zh"),
  ko: normalize(koData as RawGuide[], "country_ko"),
};

export function getLocGuides(locale: GuideLocale): LocGuide[] {
  return DATA[locale] || [];
}

/** Slug mirrors the English guide (by country code) so URLs line up across locales. */
export function locGuideSlug(g: { code: string; country: string }): string {
  const en = enGuides.find((e) => e.code === g.code);
  return en ? enGuideSlug(en) : g.country.toLowerCase();
}

export function getLocGuide(locale: GuideLocale, slug: string): LocGuide | undefined {
  return getLocGuides(locale).find((g) => locGuideSlug(g) === slug);
}

export function locGuideFlag(g: LocGuide): string {
  return getCountryByCode(g.code)?.flag || "🏳️";
}

export function locGuideCities(g: LocGuide): string[] {
  return CURRENCY_TO_CITY_SLUGS[g.currency_code] || [];
}

export function locCurrencyName(_locale: GuideLocale, g: LocGuide): string {
  const meta = getCurrencyMeta(g.currency_code);
  if (!meta) return g.currency_code;
  // zh/ko: use the English currency name (we don't have zh/ko currency names);
  // it reads fine inline (e.g. "Thai Baht").
  return meta.name_en;
}

/** Per-locale UI chrome for the guide pages. */
export const GUIDE_UI: Record<GuideLocale, {
  htmlLang: string;
  ogLocale: string;
  indexTitle: string;
  indexDesc: string;
  back: string;
  quickTips: string;
  findShops: (c: string) => string;
  findShopsSub: string;
  allCities: string;
  saveLabel: string;
  saveTitle: string;
  saveBody: string;
  saveCTA: string;
  otherGuides: string;
  rateCta: (cur: string) => string;
  findCta: string;
  metaTitle: (c: string, cur: string) => string;
  metaDesc: (c: string, cur: string, code: string) => string;
  pageTitle: (c: string) => string;
  enLabel: string;
}> = {
  zh: {
    htmlLang: "zh",
    ogLocale: "zh_CN",
    indexTitle: "各国旅行用钱指南",
    indexDesc: "出发前必看：各国货币、现金与刷卡、最划算的换汇方式、ATM、小费与防骗，一站看清。",
    back: "← 全部指南",
    quickTips: "快速贴士",
    findShops: (c) => `在${c}找换钱的地方`,
    findShopsSub: "线上汇率为中间价。换现金请比较当地换汇店——MoneySpot 收录全球 245+ 城市的店铺。",
    allCities: "浏览全部城市 →",
    saveLabel: "⭐ 免费账户",
    saveTitle: "收藏换汇店并获取汇率提醒",
    saveBody: "免费注册即可收藏换汇店、设置汇率提醒、多设备同步。无手续费、无广告。",
    saveCTA: "用邮箱免费注册 →",
    otherGuides: "更多旅行用钱指南",
    rateCta: (cur) => `💱 查看${cur}汇率`,
    findCta: "查找换钱店 →",
    metaTitle: (c, cur) => `${c}旅行用钱指南｜货币·${cur}·现金·换汇 | MoneySpot`,
    metaDesc: (c, cur, code) => `${c}用钱全攻略：${cur}（${code}）、现金与刷卡、最划算换汇、ATM、小费、防骗，中文详解。`,
    pageTitle: (c) => `${c}旅行用钱指南`,
    enLabel: "English version →",
  },
  ko: {
    htmlLang: "ko",
    ogLocale: "ko_KR",
    indexTitle: "나라별 여행 돈 가이드",
    indexDesc: "출발 전 필독: 현지 통화, 현금과 카드, 가장 이득인 환전 방법, ATM, 팁, 사기 대비까지.",
    back: "← 전체 가이드",
    quickTips: "빠른 팁",
    findShops: (c) => `${c}에서 환전소 찾기`,
    findShopsSub: "온라인 환율은 중간 환율입니다. 현금은 현지 환전소를 비교하세요 — MoneySpot은 전 세계 245개 이상 도시의 매장을 수록합니다.",
    allCities: "모든 도시 보기 →",
    saveLabel: "⭐ 무료 계정",
    saveTitle: "환전소 저장 & 환율 알림 받기",
    saveBody: "무료 가입으로 환전소를 저장하고 환율 알림을 받고 여러 기기에서 동기화하세요. 수수료·광고 없음.",
    saveCTA: "이메일로 무료 가입 →",
    otherGuides: "다른 나라 가이드",
    rateCta: (cur) => `💱 ${cur} 환율 보기`,
    findCta: "환전소 찾기 →",
    metaTitle: (c, cur) => `${c} 여행 돈 가이드｜통화·${cur}·현금·환전 | MoneySpot`,
    metaDesc: (c, cur, code) => `${c} 여행 돈 완전 가이드: ${cur}(${code}), 현금과 카드, 가장 이득인 환전, ATM, 팁, 사기 대비를 한국어로.`,
    pageTitle: (c) => `${c} 여행 돈 가이드`,
    enLabel: "English version →",
  },
};
