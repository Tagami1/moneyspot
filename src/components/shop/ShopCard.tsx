"use client";

import type { ExchangeShop } from "@/lib/database.types";
import { getOpenStatus, formatRate, formatTimeAgo, getTodayHours } from "@/lib/utils";
import type { TFunction } from "@/i18n/useTranslation";
import PromotedBadge from "@/components/shop/PromotedBadge";

type Props = {
  shop: ExchangeShop;
  selectedCurrency: string;
  locale: string;
  t: TFunction;
  isFavorite: boolean;
  onToggleFavorite: (shopId: number) => void;
  distance: number | null;
  onClick: () => void;
  isBestRate?: boolean;
  marketRates?: Record<string, number>;
  amountInput?: number | null;
};

export default function ShopCard({
  shop,
  selectedCurrency,
  locale,
  t,
  isFavorite,
  onToggleFavorite,
  distance,
  onClick,
  isBestRate,
  marketRates,
  amountInput,
}: Props) {
  const hasBusinessHours = shop.shop_business_hours && shop.shop_business_hours.length > 0;
  const openStatus = hasBusinessHours ? getOpenStatus(shop.shop_business_hours) : null;
  const rate = shop.exchange_rates?.find(
    (r) => r.currency_code === selectedCurrency
  );

  const statusLabel =
    openStatus === null
      ? t("shop.hoursUnknown")
      : openStatus === "closing_soon"
        ? t("shop.closingSoon")
        : openStatus === "open"
          ? t("shop.open")
          : t("shop.closed");

  const statusClass =
    openStatus === null
      ? "bg-gray-100 text-gray-400"
      : openStatus === "closing_soon"
        ? "bg-orange-100 text-orange-700"
        : openStatus === "open"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500";

  // Find the most recent fetched_at from exchange rates
  const latestFetchedAt = shop.exchange_rates?.reduce((latest, r) => {
    if (!latest) return r.fetched_at;
    return new Date(r.fetched_at) > new Date(latest) ? r.fetched_at : latest;
  }, "" as string);

  // Calculate spread from market rate
  const marketRate = marketRates?.[selectedCurrency];
  const sellRateNum = rate?.sell_rate ? Number(rate.sell_rate) : null;
  const spread = sellRateNum !== null && marketRate ? sellRateNum - marketRate : null;

  // Calculate converted amount if amountInput is provided
  const convertedAmount = amountInput && sellRateNum ? (amountInput / sellRateNum) : null;

  return (
    <div className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative">
      {/* Favorite button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(shop.id); }}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center z-10"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <span className={`text-base leading-none ${isFavorite ? "text-red-500" : "text-gray-300 hover:text-red-400 transition-colors"}`}>
          {isFavorite ? "♥" : "♡"}
        </span>
      </button>

      <button onClick={onClick} className="w-full text-left">
        <div className="flex justify-between items-start pr-6">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{shop.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {shop.is_promoted && <PromotedBadge t={t} />}
              {isBestRate && (
                <span className="text-[10px] px-1 py-0.5 rounded font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 whitespace-nowrap flex-shrink-0">
                  {t("bestRate.badge")}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>
            {shop.exchange_chains && (
              <p className="text-xs text-gray-400 mt-0.5">
                {shop.exchange_chains.name}
              </p>
            )}
          </div>

          {rate && (
            <div className="text-right ml-3 flex-shrink-0">
              {amountInput && convertedAmount !== null ? (
                <>
                  <p className="text-xs text-gray-600 font-medium">{selectedCurrency}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {convertedAmount.toFixed(2)} {selectedCurrency}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-600 font-medium">{selectedCurrency} {t("shop.sell")}</p>
                  <p className={`text-lg font-bold ${rate.rate_type === "reference" ? "text-gray-400" : "text-blue-600"}`}>
                    {rate.rate_type === "reference" ? "≈" : ""}¥{formatRate(sellRateNum)}
                  </p>
                  {rate.rate_type === "reference" && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500">
                      {locale === "ja" ? "参考" : "Est."}
                    </span>
                  )}
                </>
              )}
              {/* Spread from market rate */}
              {!amountInput && spread !== null && (
                <p className={`text-xs font-medium ${spread < 0 ? "text-green-600" : "text-orange-500"}`}>
                  {spread < 0 ? `¥${Math.abs(spread).toFixed(2)} ${locale === "ja" ? "お得" : "cheaper"}` : `+¥${spread.toFixed(2)}`}
                </p>
              )}
              {!amountInput && (
                <p className="text-sm text-gray-700 mt-1">
                  {t("shop.buy")} ¥{formatRate(rate.buy_rate ? Number(rate.buy_rate) : null)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {distance !== null && <span>{distance.toFixed(1)}km</span>}
          {(() => {
            if (!hasBusinessHours) {
              return <span>{t("shop.hoursUnknown")}</span>;
            }
            const todayHours = getTodayHours(shop.shop_business_hours);
            return todayHours
              ? <span>{t("shop.todayHours")}: {todayHours}</span>
              : <span>{t("shop.holidayClosed")}</span>;
          })()}
        </div>

        {/* Last updated time */}
        {latestFetchedAt && (
          <p className="text-[10px] text-gray-400 mt-1">
            {t("shop.updatedAgo", { time: formatTimeAgo(latestFetchedAt, locale) })}
          </p>
        )}
      </button>
    </div>
  );
}
