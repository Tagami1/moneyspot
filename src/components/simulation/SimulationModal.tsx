"use client";

import { useState, useMemo } from "react";
import type { ExchangeShop, Currency } from "@/lib/database.types";
import { formatRate } from "@/lib/utils";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  shops: ExchangeShop[];
  selectedCurrency: string;
  currencies: Currency[];
  t: TFunction;
  onClose: () => void;
};

export default function SimulationModal({
  shops,
  selectedCurrency,
  currencies,
  t,
  onClose,
}: Props) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(selectedCurrency);
  const [direction, setDirection] = useState<"sell" | "buy">("sell");

  const currencyObj = currencies.find((c) => c.code === currency);

  const results = useMemo(() => {
    const num = Number(amount);
    if (!num || num <= 0) return [];

    return shops
      .map((shop) => {
        const rate = shop.exchange_rates?.find((r) => r.currency_code === currency);
        if (!rate) return { shop, result: null, hasRate: false };

        let result: number | null = null;
        if (direction === "sell") {
          // User sells foreign currency, receives JPY
          // buy_rate = how much JPY the shop pays per 1 unit of foreign currency
          if (rate.buy_rate) {
            result = num * Number(rate.buy_rate);
          }
        } else {
          // User buys foreign currency, pays JPY
          // sell_rate = how much JPY the shop charges per 1 unit of foreign currency
          if (rate.sell_rate) {
            result = num / Number(rate.sell_rate);
          }
        }
        return { shop, result, hasRate: true };
      })
      .filter((r) => r.hasRate)
      .sort((a, b) => {
        if (a.result === null) return 1;
        if (b.result === null) return -1;
        // For selling foreign: higher JPY is better
        // For buying foreign: more foreign currency is better
        return b.result - a.result;
      });
  }, [shops, amount, currency, direction]);

  const bestResult = results.length > 0 && results[0].result !== null ? results[0].result : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("simulation.title")}</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">×</button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b space-y-3">
          {/* Direction */}
          <div className="flex gap-2">
            <button
              onClick={() => setDirection("sell")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                direction === "sell"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t("simulation.sellForeign")}
            </button>
            <button
              onClick={() => setDirection("buy")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                direction === "buy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t("simulation.buyForeign")}
            </button>
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              placeholder={direction === "sell" ? "1000" : "100000"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag_emoji} {c.code}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            {direction === "sell"
              ? `${amount || "0"} ${currency} ${t("simulation.sellForeign")}`
              : `${amount || "0"} ${direction === "buy" ? (currencyObj ? "JPY" : currency) : currency} ${t("simulation.buyForeign")}`}
          </p>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-4">
          {Number(amount) > 0 && results.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium text-xs">#</th>
                  <th className="text-left py-2 text-gray-500 font-medium text-xs">{t("simulation.shopName")}</th>
                  <th className="text-right py-2 text-gray-500 font-medium text-xs">{t("simulation.result")}</th>
                  <th className="text-right py-2 text-gray-500 font-medium text-xs">{t("simulation.diff")}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.shop.id} className={`border-b border-gray-50 ${i === 0 ? "bg-yellow-50" : ""}`}>
                    <td className="py-2 pr-2 text-gray-500 font-medium">{i + 1}</td>
                    <td className="py-2 font-medium text-gray-900 truncate max-w-[140px]">{r.shop.name}</td>
                    <td className="py-2 text-right font-bold text-blue-600">
                      {r.result !== null
                        ? direction === "sell"
                          ? `¥${r.result.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`
                          : `${r.result.toFixed(2)} ${currency}`
                        : t("simulation.noRate")}
                    </td>
                    <td className="py-2 text-right text-xs text-gray-500">
                      {r.result !== null && bestResult !== null && i > 0
                        ? direction === "sell"
                          ? `−¥${(bestResult - r.result).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`
                          : `−${(bestResult - r.result).toFixed(2)}`
                        : i === 0 && r.result !== null
                          ? "BEST"
                          : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">
              {t("simulation.inputAmount")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
