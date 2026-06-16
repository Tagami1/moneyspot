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
import esData from "./guides-es.generated.json";
import thData from "./guides-th.generated.json";
import viData from "./guides-vi.generated.json";
import idData from "./guides-id.generated.json";

export type LocGuideSection = { heading: string; body: string };
export type LocGuide = {
  code: string;
  country: string; // localized country name
  currency_code: string;
  intro: string;
  sections: LocGuideSection[];
  quick_tips: string[];
};

export type GuideLocale = "zh" | "ko" | "es" | "th" | "vi" | "id";
export const GUIDE_LOCALES: GuideLocale[] = ["zh", "ko", "es", "th", "vi", "id"];

type CountryField = "country_zh" | "country_ko" | "country_es" | "country_th" | "country_vi" | "country_id";

type RawGuide = {
  code: string;
  currency_code: string;
  intro: string;
  sections: LocGuideSection[];
  quick_tips: string[];
} & Partial<Record<CountryField, string>>;

function normalize(raw: RawGuide[], field: CountryField): LocGuide[] {
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
  es: normalize(esData as RawGuide[], "country_es"),
  th: normalize(thData as RawGuide[], "country_th"),
  vi: normalize(viData as RawGuide[], "country_vi"),
  id: normalize(idData as RawGuide[], "country_id"),
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
  es: {
    htmlLang: "es",
    ogLocale: "es_ES",
    indexTitle: "Guías de dinero para viajar por país",
    indexDesc: "Antes de salir: moneda local, efectivo vs tarjeta, dónde cambiar mejor, cajeros, propinas y estafas a evitar.",
    back: "← Todas las guías",
    quickTips: "Consejos rápidos",
    findShops: (c) => `Casas de cambio en ${c}`,
    findShopsSub: "Las tasas online son del mercado medio. Para efectivo, compara casas de cambio locales — MoneySpot lista tiendas en 245+ ciudades.",
    allCities: "Ver todas las ciudades →",
    saveLabel: "⭐ Cuenta gratis",
    saveTitle: "Guarda casas de cambio y recibe alertas de tasas",
    saveBody: "Crea una cuenta gratis para guardar casas de cambio, recibir alertas de tasas y sincronizar entre dispositivos. Sin comisiones ni anuncios.",
    saveCTA: "Regístrate gratis con tu email →",
    otherGuides: "Más guías de dinero",
    rateCta: (cur) => `💱 Ver la tasa de ${cur}`,
    findCta: "Buscar casas de cambio →",
    metaTitle: (c, cur) => `Guía de dinero para viajar a ${c}｜moneda, ${cur}, efectivo y cambio | MoneySpot`,
    metaDesc: (c, cur, code) => `Todo sobre el dinero en ${c}: ${cur} (${code}), efectivo vs tarjeta, mejor cambio, cajeros, propinas y estafas. En español.`,
    pageTitle: (c) => `Guía de dinero para viajar a ${c}`,
    enLabel: "English version →",
  },
  th: {
    htmlLang: "th",
    ogLocale: "th_TH",
    indexTitle: "คู่มือเรื่องเงินเวลาเที่ยว แยกตามประเทศ",
    indexDesc: "ก่อนออกเดินทาง: สกุลเงินท้องถิ่น เงินสดกับบัตร วิธีแลกที่คุ้มที่สุด ตู้ ATM ทิป และกลโกงที่ควรเลี่ยง",
    back: "← คู่มือทั้งหมด",
    quickTips: "เคล็ดลับด่วน",
    findShops: (c) => `หาที่แลกเงินใน${c}`,
    findShopsSub: "อัตราออนไลน์เป็นเรตกลาง สำหรับเงินสดให้เทียบร้านแลกเงินในพื้นที่ — MoneySpot รวบรวมร้านใน 245+ เมืองทั่วโลก",
    allCities: "ดูทุกเมือง →",
    saveLabel: "⭐ บัญชีฟรี",
    saveTitle: "บันทึกร้านแลกเงินและรับการแจ้งเตือนเรต",
    saveBody: "สมัครฟรีเพื่อบันทึกร้าน รับการแจ้งเตือนเรต และซิงค์ข้ามอุปกรณ์ ไม่มีค่าธรรมเนียม ไม่มีโฆษณา",
    saveCTA: "สมัครฟรีด้วยอีเมล →",
    otherGuides: "คู่มือเรื่องเงินอื่น ๆ",
    rateCta: (cur) => `💱 ดูเรต ${cur}`,
    findCta: "หาที่แลกเงิน →",
    metaTitle: (c, cur) => `คู่มือเรื่องเงินเที่ยว${c}｜สกุลเงิน·${cur}·เงินสด·แลกเงิน | MoneySpot`,
    metaDesc: (c, cur, code) => `เรื่องเงินใน${c}ทั้งหมด: ${cur} (${code}), เงินสดกับบัตร, แลกเงินคุ้มสุด, ATM, ทิป, กลโกง อธิบายเป็นภาษาไทย`,
    pageTitle: (c) => `คู่มือเรื่องเงินเที่ยว${c}`,
    enLabel: "English version →",
  },
  vi: {
    htmlLang: "vi",
    ogLocale: "vi_VN",
    indexTitle: "Cẩm nang tiền bạc du lịch theo quốc gia",
    indexDesc: "Trước khi đi: tiền tệ địa phương, tiền mặt và thẻ, cách đổi lợi nhất, ATM, tip và các trò lừa cần tránh.",
    back: "← Tất cả cẩm nang",
    quickTips: "Mẹo nhanh",
    findShops: (c) => `Tìm chỗ đổi tiền ở ${c}`,
    findShopsSub: "Tỷ giá online là tỷ giá giữa. Với tiền mặt hãy so sánh các điểm đổi tại chỗ — MoneySpot có cửa hàng ở hơn 245 thành phố.",
    allCities: "Xem tất cả thành phố →",
    saveLabel: "⭐ Tài khoản miễn phí",
    saveTitle: "Lưu điểm đổi tiền & nhận cảnh báo tỷ giá",
    saveBody: "Tạo tài khoản miễn phí để lưu điểm đổi tiền, nhận cảnh báo tỷ giá và đồng bộ trên các thiết bị. Không phí, không quảng cáo.",
    saveCTA: "Đăng ký miễn phí bằng email →",
    otherGuides: "Cẩm nang tiền bạc khác",
    rateCta: (cur) => `💱 Xem tỷ giá ${cur}`,
    findCta: "Tìm điểm đổi tiền →",
    metaTitle: (c, cur) => `Cẩm nang tiền bạc khi du lịch ${c}｜tiền tệ, ${cur}, tiền mặt, đổi tiền | MoneySpot`,
    metaDesc: (c, cur, code) => `Tất cả về tiền ở ${c}: ${cur} (${code}), tiền mặt và thẻ, đổi tiền lợi nhất, ATM, tip, lừa đảo. Bằng tiếng Việt.`,
    pageTitle: (c) => `Cẩm nang tiền bạc khi du lịch ${c}`,
    enLabel: "English version →",
  },
  id: {
    htmlLang: "id",
    ogLocale: "id_ID",
    indexTitle: "Panduan uang traveling per negara",
    indexDesc: "Sebelum berangkat: mata uang lokal, tunai vs kartu, cara menukar paling untung, ATM, tip, dan penipuan yang harus dihindari.",
    back: "← Semua panduan",
    quickTips: "Tips cepat",
    findShops: (c) => `Cari tempat tukar uang di ${c}`,
    findShopsSub: "Kurs online adalah kurs tengah. Untuk tunai, bandingkan money changer lokal — MoneySpot memuat gerai di 245+ kota.",
    allCities: "Lihat semua kota →",
    saveLabel: "⭐ Akun gratis",
    saveTitle: "Simpan money changer & dapatkan peringatan kurs",
    saveBody: "Buat akun gratis untuk menyimpan gerai, dapatkan peringatan kurs, dan sinkron antarperangkat. Tanpa biaya, tanpa iklan.",
    saveCTA: "Daftar gratis dengan email →",
    otherGuides: "Panduan uang lainnya",
    rateCta: (cur) => `💱 Lihat kurs ${cur}`,
    findCta: "Cari money changer →",
    metaTitle: (c, cur) => `Panduan uang traveling ke ${c}｜mata uang, ${cur}, tunai, tukar uang | MoneySpot`,
    metaDesc: (c, cur, code) => `Semua soal uang di ${c}: ${cur} (${code}), tunai vs kartu, tukar paling untung, ATM, tip, penipuan. Dalam Bahasa Indonesia.`,
    pageTitle: (c) => `Panduan uang traveling ke ${c}`,
    enLabel: "English version →",
  },
};
