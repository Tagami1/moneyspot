import type { ExchangeShop } from "@/lib/database.types";

export type RateAlert = {
  id: string;
  currency: string;
  targetRate: number;
  active: boolean;
  createdAt: string;
};

export type TriggeredRateAlert = RateAlert & {
  shopId: number;
  shopName: string;
  currentRate: number;
};

export function createRateAlertId(currency: string): string {
  return `alert-${currency}`;
}

export function getBestSellRate(shops: ExchangeShop[], currency: string) {
  return shops
    .flatMap((shop) =>
      (shop.exchange_rates || [])
        .filter((rate) => rate.currency_code === currency && rate.sell_rate)
        .map((rate) => ({
          shopId: shop.id,
          shopName: shop.name,
          currentRate: Number(rate.sell_rate),
        }))
    )
    .sort((a, b) => a.currentRate - b.currentRate)[0];
}

export function getTriggeredRateAlerts(
  shops: ExchangeShop[],
  alerts: RateAlert[]
): TriggeredRateAlert[] {
  return alerts
    .filter((alert) => alert.active && Number.isFinite(alert.targetRate) && alert.targetRate > 0)
    .flatMap((alert) => {
      const bestRate = getBestSellRate(shops, alert.currency);
      if (!bestRate || bestRate.currentRate > alert.targetRate) return [];
      return [{ ...alert, ...bestRate }];
    });
}
