"use client";

import { useState, type ReactNode } from "react";
import type { ExchangeShop } from "@/lib/database.types";
import { getOpenStatus, formatRate, formatTimeAgo } from "@/lib/utils";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  shop: ExchangeShop;
  selectedCurrency: string;
  marketRates: Record<string, number>;
  locale: string;
  t: TFunction;
  isFavorite: boolean;
  onToggleFavorite: (shopId: number) => void;
  onClose: () => void;
  isBestRate?: boolean;
  wiseAffiliateBanner?: ReactNode;
};

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

export default function ShopDetail({ shop, selectedCurrency, marketRates, locale, t, isFavorite, onToggleFavorite, onClose, isBestRate, wiseAffiliateBanner }: Props) {
  const hasBusinessHours = shop.shop_business_hours && shop.shop_business_hours.length > 0;
  const openStatus = hasBusinessHours ? getOpenStatus(shop.shop_business_hours) : null;
  const [calcAmount, setCalcAmount] = useState("");
  const [calcDirection, setCalcDirection] = useState<"buy" | "sell">("sell");
  const selectedRate = shop.exchange_rates?.find(
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

  return (
    <div className="bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <button onClick={onClose} className="text-blue-600 text-sm font-medium py-1 px-2 -ml-2 rounded-lg active:bg-blue-50">
          {t("common.back")}
        </button>
        <div className="flex items-center gap-2 mx-4 min-w-0">
          <h2 className="font-bold text-gray-900 truncate">{shop.name}</h2>
          {isBestRate && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap flex-shrink-0 bg-yellow-100 text-yellow-700 border border-yellow-300">
              {t("bestRate.badge")}
            </span>
          )}
        </div>
        <button
          onClick={() => onToggleFavorite(shop.id)}
          className="w-10 h-10 flex items-center justify-center"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className={`text-xl leading-none ${isFavorite ? "text-red-500" : "text-gray-300 hover:text-red-400 transition-colors"}`}>
            {isFavorite ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Wise affiliate banner */}
        {wiseAffiliateBanner}

        {/* 営業状態 */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
          {shop.exchange_chains && (
            <span className="text-sm text-gray-500">
              {shop.exchange_chains.name}
            </span>
          )}
        </div>

        {/* レート一覧 */}
        {shop.exchange_rates && shop.exchange_rates.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">{t("shop.exchangeRates")}</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-gray-700 font-bold">{t("shop.currencyLabel")}</th>
                    <th className="text-right p-3 text-gray-700 font-bold">{t("shop.buyRate")}</th>
                    <th className="text-right p-3 text-gray-700 font-bold">{t("shop.sellRate")}</th>
                    <th className="text-right p-3 text-gray-400 font-medium text-xs">{t("shop.referenceRate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.exchange_rates.map((rate) => {
                    const isSelected = rate.currency_code === selectedCurrency;
                    const isReference = rate.rate_type === "reference";
                    const market = marketRates[rate.currency_code];
                    return (
                      <tr
                        key={rate.currency_code}
                        className={`border-b border-gray-100 last:border-0 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className={`p-3 font-bold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                          <div className="flex items-center gap-1">
                            {rate.currency_code}
                            {isReference && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-normal">
                                {locale === "ja" ? "参考" : "Est."}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            {formatTimeAgo(rate.fetched_at, locale)}
                          </div>
                        </td>
                        <td className={`p-3 text-right font-medium ${isReference ? "text-gray-400" : isSelected ? "text-blue-700" : "text-gray-800"}`}>
                          {isReference ? "≈" : ""}¥{formatRate(rate.buy_rate ? Number(rate.buy_rate) : null)}
                        </td>
                        <td className={`p-3 text-right font-bold ${isReference ? "text-gray-400" : "text-blue-600"}`}>
                          {isReference ? "≈" : ""}¥{formatRate(rate.sell_rate ? Number(rate.sell_rate) : null)}
                        </td>
                        <td className="p-3 text-right text-xs text-gray-400">
                          {market ? `¥${market.toFixed(2)}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {Object.keys(marketRates).length > 0 && (
                <p className="text-xs text-gray-400 px-3 py-2 border-t border-gray-100">
                  {t("shop.referenceRateNote")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* かんたん計算 */}
        {selectedRate && (
          <div>
            <h3 className="font-bold text-gray-800 mb-2">{t("calculator.title")}</h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setCalcDirection("sell")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                    calcDirection === "sell"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {t("calculator.jpyTo", { currency: selectedCurrency })}
                </button>
                <button
                  onClick={() => setCalcDirection("buy")}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                    calcDirection === "buy"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {t("calculator.toJpy", { currency: selectedCurrency })}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 font-medium block mb-1">
                    {calcDirection === "sell"
                      ? `${t("calculator.youPay")}${locale === "ja" ? "（円）" : " (JPY)"}`
                      : `${t("calculator.youPay")}${locale === "ja" ? `（${selectedCurrency}）` : ` (${selectedCurrency})`}`}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={calcAmount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d*$/.test(v)) setCalcAmount(v);
                    }}
                    placeholder={calcDirection === "sell" ? "10000" : "100"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-gray-400 text-xl mt-5">→</div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 font-medium block mb-1">
                    {calcDirection === "sell"
                      ? `${t("calculator.youGet")}${locale === "ja" ? `（${selectedCurrency}）` : ` (${selectedCurrency})`}`
                      : `${t("calculator.youGet")}${locale === "ja" ? "（円）" : " (JPY)"}`}
                  </label>
                  <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-lg font-bold text-blue-600 min-h-[44px]">
                    {calcAmount && Number(calcAmount) > 0
                      ? calcDirection === "sell"
                        ? selectedRate.sell_rate
                          ? (Number(calcAmount) / Number(selectedRate.sell_rate)).toFixed(2)
                          : "-"
                        : selectedRate.buy_rate
                          ? (Number(calcAmount) * Number(selectedRate.buy_rate)).toLocaleString("ja-JP", { maximumFractionDigits: 0 })
                          : "-"
                      : "-"}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {calcDirection === "sell"
                  ? t("calculator.sellRateLabel", { rate: formatRate(selectedRate.sell_rate ? Number(selectedRate.sell_rate) : null), currency: selectedCurrency })
                  : t("calculator.buyRateLabel", { rate: formatRate(selectedRate.buy_rate ? Number(selectedRate.buy_rate) : null), currency: selectedCurrency })}
              </p>
              {selectedRate.rate_type === "reference" && (
                <p className="text-xs text-orange-500 text-center font-medium mt-1">
                  {t("shop.estimatedRate")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 営業時間 */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">{t("shop.businessHours")}</h3>
          {hasBusinessHours ? (
            <div className="space-y-1">
              {shop.shop_business_hours
                .sort((a, b) => a.day_of_week - b.day_of_week)
                .map((h) => (
                  <div
                    key={h.day_of_week}
                    className={`flex justify-between text-sm py-1 ${
                      h.day_of_week === new Date().getDay()
                        ? "font-bold text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    <span>{dayNames[h.day_of_week]}</span>
                    <span>
                      {h.is_closed
                        ? t("shop.holidayClosed")
                        : `${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("shop.hoursUnknown")}</p>
          )}
        </div>

        {/* 基本情報 */}
        <div>
          <h3 className="font-bold text-gray-800 mb-2">{t("shop.basicInfo")}</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">{t("shop.address")}</p>
              <p className="text-gray-800">{shop.address}</p>
            </div>
            {shop.phone && (
              <div>
                <p className="text-gray-500">{t("shop.phone")}</p>
                <a href={`tel:${shop.phone}`} className="text-blue-600">
                  {shop.phone}
                </a>
              </div>
            )}
            {shop.website_url && (
              <div>
                <p className="text-gray-500">{t("shop.website")}</p>
                <a
                  href={shop.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-all"
                >
                  {shop.website_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ルート案内ボタン */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {t("shop.directions")}
        </a>

        {/* 下部の閉じるボタン */}
        <button
          onClick={onClose}
          className="block w-full text-center text-gray-500 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {t("common.close")}
        </button>
      </div>
    </div>
  );
}
