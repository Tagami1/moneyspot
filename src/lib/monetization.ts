import type { ExchangeShop } from "./database.types";

export function isPromotedShop(shop: ExchangeShop): boolean {
  if (!shop.is_promoted) return false;
  if (!shop.promoted_until) return true;
  return new Date(shop.promoted_until).getTime() > Date.now();
}

export function comparePromotedShops(a: ExchangeShop, b: ExchangeShop): number {
  const aPromoted = isPromotedShop(a);
  const bPromoted = isPromotedShop(b);
  if (aPromoted !== bPromoted) return aPromoted ? -1 : 1;
  if (!aPromoted || !bPromoted) return 0;
  return (a.promoted_rank ?? 9999) - (b.promoted_rank ?? 9999);
}
