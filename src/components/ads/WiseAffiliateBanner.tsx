"use client";

import { useState } from "react";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  locale: string;
  t: TFunction;
  selectedCurrency: string;
  marketRate?: number;
  shopRate?: number;
};

// TODO: Replace with real Wise affiliate link
const WISE_AFFILIATE_URL = "https://wise.com/invite/a/PLACEHOLDER";

export default function WiseAffiliateBanner({ locale, t, selectedCurrency, marketRate, shopRate }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const spread = marketRate && shopRate ? Math.abs(shopRate - marketRate) : null;

  return (
    <div className="relative rounded-xl overflow-hidden mb-4">
      {/* Blue gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white text-sm"
          aria-label={locale === "ja" ? "閉じる" : "Close"}
        >
          x
        </button>

        <a
          href={`${WISE_AFFILIATE_URL}&currency=${selectedCurrency}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <p className="text-white font-bold text-sm leading-tight">
            {t("wise.title")}
          </p>
          <p className="text-blue-100 text-xs mt-1">
            {t("wise.subtitle")}
          </p>

          {spread !== null && marketRate && (
            <div className="mt-2 flex items-center gap-2">
              <div className="bg-white/20 rounded-md px-2 py-1">
                <span className="text-white text-[10px] block">{t("wise.marketRate")}</span>
                <span className="text-white font-bold text-xs">
                  1 {selectedCurrency} = {marketRate.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/20 rounded-md px-2 py-1">
                <span className="text-white text-[10px] block">{t("wise.shopSpread")}</span>
                <span className="text-yellow-200 font-bold text-xs">
                  +{spread.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-2 inline-flex items-center gap-1 bg-white rounded-md px-3 py-1.5">
            <span className="text-blue-600 font-bold text-xs">
              {t("wise.cta")}
            </span>
            <span className="text-blue-600 text-xs">-&gt;</span>
          </div>
        </a>
      </div>
    </div>
  );
}
