import { areaPages, type AreaPage } from "@/lib/areas";
import type { ExchangeShop } from "@/lib/database.types";
import { mockShops } from "@/lib/mock-data";
import { COMPARISON_JPY_AMOUNT, convertJpyToForeign, formatForeignAmount } from "@/lib/rate-display";
import { calcDistance, formatRate } from "@/lib/utils";

export const DEFAULT_SEO_CURRENCY = "USD";

export function slugifyShopName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getShopSlug(shop: ExchangeShop): string {
  const baseName = shop.name_en || shop.name;
  const slug = slugifyShopName(baseName) || "shop";
  return `${shop.id}-${slug}`;
}

export function getShopBySlug(slug: string): ExchangeShop | undefined {
  const id = Number(slug.split("-")[0]);
  if (!Number.isFinite(id)) return undefined;
  return mockShops.find((shop) => shop.id === id);
}

export function getShopPrimaryRate(shop: ExchangeShop, currency = DEFAULT_SEO_CURRENCY) {
  return (
    shop.exchange_rates?.find((rate) => rate.currency_code === currency) ??
    shop.exchange_rates?.find((rate) => rate.sell_rate) ??
    null
  );
}

export function getShopComparisonText(shop: ExchangeShop, currency = DEFAULT_SEO_CURRENCY, locale = "ja") {
  const rate = getShopPrimaryRate(shop, currency);
  const converted = convertJpyToForeign(COMPARISON_JPY_AMOUNT, rate?.sell_rate);
  return formatForeignAmount(converted, rate?.currency_code ?? currency, locale);
}

export function getShopRateSummary(shop: ExchangeShop, currency = DEFAULT_SEO_CURRENCY): string {
  const rate = getShopPrimaryRate(shop, currency);
  if (!rate?.sell_rate) return "レート情報なし";
  return `${rate.currency_code} 販売 ¥${formatRate(Number(rate.sell_rate))}`;
}

export function getAreaRanking(area: AreaPage, currency = DEFAULT_SEO_CURRENCY, limit = 5) {
  const ranked = mockShops
    .map((shop) => ({
      shop,
      distanceKm: calcDistance(area.lat, area.lng, shop.lat, shop.lng),
      rate: getShopPrimaryRate(shop, currency),
    }))
    .filter(({ distanceKm, rate }) => distanceKm <= area.radiusKm && Boolean(rate?.sell_rate))
    .sort((a, b) => {
      const aReference = a.rate?.rate_type === "reference";
      const bReference = b.rate?.rate_type === "reference";
      if (aReference !== bReference) return aReference ? 1 : -1;
      return Number(a.rate?.sell_rate ?? Infinity) - Number(b.rate?.sell_rate ?? Infinity);
    })
    .slice(0, limit);

  if (ranked.length > 0) return ranked;

  return mockShops
    .map((shop) => ({
      shop,
      distanceKm: calcDistance(area.lat, area.lng, shop.lat, shop.lng),
      rate: getShopPrimaryRate(shop, currency),
    }))
    .filter(({ rate }) => Boolean(rate?.sell_rate))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function getAreaCurrencyRanking(area: AreaPage, currency: string, limit = 8) {
  return mockShops
    .map((shop) => ({
      shop,
      distanceKm: calcDistance(area.lat, area.lng, shop.lat, shop.lng),
      rate: shop.exchange_rates?.find((item) => item.currency_code === currency) ?? null,
    }))
    .filter(({ distanceKm, rate }) => distanceKm <= area.radiusKm && Boolean(rate?.sell_rate))
    .sort((a, b) => {
      const aReference = a.rate?.rate_type === "reference";
      const bReference = b.rate?.rate_type === "reference";
      if (aReference !== bReference) return aReference ? 1 : -1;
      return Number(a.rate?.sell_rate ?? Infinity) - Number(b.rate?.sell_rate ?? Infinity);
    })
    .slice(0, limit);
}

export function getNearbyArea(shop: ExchangeShop): AreaPage {
  return [...areaPages].sort(
    (a, b) => calcDistance(a.lat, a.lng, shop.lat, shop.lng) - calcDistance(b.lat, b.lng, shop.lat, shop.lng)
  )[0];
}
