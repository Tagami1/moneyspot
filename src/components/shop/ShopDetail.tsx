"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { ExchangeShop } from "@/lib/database.types";
import { getOpenStatus, formatRate, formatTimeAgo } from "@/lib/utils";
import { isPromotedShop } from "@/lib/monetization";
import {
  COMPARISON_JPY_AMOUNT,
  convertJpyToForeign,
  formatForeignAmount,
  formatJpyAmount,
  getRateTrustClasses,
  getRateTrustLabelKey,
  getRateTrustNoteKey,
  getRateTrustScore,
  getRateTrustScoreClasses,
} from "@/lib/rate-display";
import { getShopSlug } from "@/lib/shop-pages";
import type { TFunction } from "@/i18n/useTranslation";
import PromotedBadge from "./PromotedBadge";

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
  const isPromoted = isPromotedShop(shop);
  const [calcAmount, setCalcAmount] = useState("");
  const [calcDirection, setCalcDirection] = useState<"buy" | "sell">("sell");
  const [showRateReport, setShowRateReport] = useState(false);
  const [reportSellRate, setReportSellRate] = useState("");
  const [reportBuyRate, setReportBuyRate] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const selectedRate = shop.exchange_rates?.find(
    (r) => r.currency_code === selectedCurrency
  );
  const selectedTrustScore = selectedRate
    ? getRateTrustScore(selectedRate.rate_type, selectedRate.fetched_at)
    : null;
  const selectedComparisonAmount = convertJpyToForeign(
    COMPARISON_JPY_AMOUNT,
    selectedRate?.sell_rate
  );
  const selectedComparisonText = formatForeignAmount(
    selectedComparisonAmount,
    selectedCurrency,
    locale
  );
  const submitRateReport = () => {
    const sellRate = Number(reportSellRate);
    const buyRate = Number(reportBuyRate);
    const hasValidSell = Number.isFinite(sellRate) && sellRate > 0;
    const hasValidBuy = Number.isFinite(buyRate) && buyRate > 0;
    if (!hasValidSell && !hasValidBuy && reportNote.trim().length === 0) return;

    try {
      const stored = window.localStorage.getItem("moneyspot_rate_reports");
      const reports = stored ? JSON.parse(stored) : [];
      const next = Array.isArray(reports) ? reports : [];
      next.unshift({
        id: `${shop.id}-${selectedCurrency}-${Date.now()}`,
        shopId: shop.id,
        shopName: shop.name,
        currency: selectedCurrency,
        sellRate: hasValidSell ? sellRate : null,
        buyRate: hasValidBuy ? buyRate : null,
        note: reportNote.trim(),
        status: "pending_review",
        rateType: "user_reported",
        source: "user_report",
        reviewedAt: null,
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem("moneyspot_rate_reports", JSON.stringify(next.slice(0, 100)));
    } catch {}

    setReportSubmitted(true);
    setReportSellRate("");
    setReportBuyRate("");
    setReportNote("");
  };

  const shareShop = async () => {
    const url = `${window.location.origin}/shops/${getShopSlug(shop)}`;
    const rateText = selectedRate?.sell_rate
      ? `${selectedCurrency} ${t("shop.sell")}: ¥${formatRate(Number(selectedRate.sell_rate))}`
      : selectedCurrency;
    const text = t("share.message", {
      shop: shop.name,
      rate: rateText,
      comparison: selectedComparisonAmount !== null
        ? t("shop.jpyComparison", {
            amount: formatJpyAmount(COMPARISON_JPY_AMOUNT, locale),
            result: selectedComparisonText,
          })
        : rateText,
    });

    try {
      if (navigator.share) {
        await navigator.share({ title: shop.name, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus(t("share.copied"));
        window.setTimeout(() => setShareStatus(""), 2500);
      }
    } catch {}
  };

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
          {isPromoted && <PromotedBadge t={t} />}
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

        {/* レートの信頼性 */}
        {selectedRate && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{t("shop.rateTrust")}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {t(getRateTrustNoteKey(selectedRate.rate_type))}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border font-bold whitespace-nowrap ${getRateTrustClasses(selectedRate.rate_type)}`}>
                {t(getRateTrustLabelKey(selectedRate.rate_type))}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-[11px] font-semibold text-blue-700">
                  {t("shop.jpyComparisonLabel")}
                </p>
                <p className="mt-1 text-sm font-black text-blue-900">
                  {selectedComparisonAmount !== null
                    ? t("shop.jpyComparison", {
                        amount: formatJpyAmount(COMPARISON_JPY_AMOUNT, locale),
                        result: selectedComparisonText,
                      })
                    : "-"}
                </p>
              </div>
              {selectedTrustScore && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold text-gray-500">
                    {t("shop.trustScoreLabel")}
                  </p>
                  <p className={`mt-1 text-sm font-black ${getRateTrustScoreClasses(selectedTrustScore.level)}`}>
                    {t("shop.trustScore", { score: selectedTrustScore.score })}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-gray-500">
                    {t(selectedTrustScore.labelKey)}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">
                  {t("shop.lastChecked")}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {t("shop.lastCheckedAt", {
                    time: formatTimeAgo(selectedRate.fetched_at, locale),
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setShowRateReport((v) => !v); setReportSubmitted(false); }}
              className="mt-3 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
            >
              {t("report.button")}
            </button>
          </div>
        )}

        {showRateReport && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="font-bold text-gray-800">{t("report.title")}</h3>
            <p className="mt-1 text-xs leading-5 text-gray-500">{t("report.description")}</p>
            {reportSubmitted ? (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-bold text-green-700">
                {t("report.thanks")}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-xs font-bold text-gray-600">{selectedCurrency}</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-medium text-gray-600">
                    {t("report.sellRate")}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={reportSellRate}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d*\.?\d*$/.test(v)) setReportSellRate(v);
                      }}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={selectedRate?.sell_rate ? String(selectedRate.sell_rate) : "150.00"}
                    />
                  </label>
                  <label className="text-xs font-medium text-gray-600">
                    {t("report.buyRate")}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={reportBuyRate}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d*\.?\d*$/.test(v)) setReportBuyRate(v);
                      }}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={selectedRate?.buy_rate ? String(selectedRate.buy_rate) : "149.00"}
                    />
                  </label>
                </div>
                <label className="block text-xs font-medium text-gray-600">
                  {t("report.note")}
                  <textarea
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    className="mt-1 h-20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={t("report.notePlaceholder")}
                  />
                </label>
                <button
                  onClick={submitRateReport}
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {t("report.submit")}
                </button>
              </div>
            )}
          </div>
        )}

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
                                {t("shop.referenceShort")}
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
        <Link
          href={`/shops/${getShopSlug(shop)}`}
          className="block w-full text-center bg-white text-blue-600 py-3 rounded-xl font-bold border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          {t("seo.shopPageLink")}
        </Link>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {t("shop.directions")}
        </a>

        <button
          onClick={shareShop}
          className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          {shareStatus || t("share.button")}
        </button>

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
