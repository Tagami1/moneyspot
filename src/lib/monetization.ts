import type { ExchangeShop } from "./database.types";
import { PROMOTED_SHOPS_ENABLED } from "./flags";

export function isPromotedShop(shop: ExchangeShop): boolean {
  // Promoted-shop monetization is off until the product reaches 100 users.
  if (!PROMOTED_SHOPS_ENABLED) return false;
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
