"use client";

import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  locale: string;
  t: TFunction;
};

export default function PremiumBanner({ t }: Props) {
  return (
    <div className="bg-white mt-2">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-sm">{t("premium.sectionTitle")}</h2>
      </div>
      <div className="px-4 py-5">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <h3 className="font-bold text-gray-900 text-base">
            {t("premium.title")}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {t("premium.subtitle")}
          </p>

          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs font-bold">&#10003;</span>
              </span>
              {t("premium.benefitAdFree")}
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs font-bold">&#10003;</span>
              </span>
              {t("premium.benefitAlerts")}
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs font-bold">&#10003;</span>
              </span>
              {t("premium.benefitCharts")}
            </li>
          </ul>

          <button
            disabled
            className="mt-4 w-full py-2.5 rounded-lg font-bold text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            {t("premium.comingSoon")}
          </button>
        </div>
      </div>
    </div>
  );
}
