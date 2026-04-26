"use client";

import { useState } from "react";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  isPremium?: boolean;
  locale: string;
  t: TFunction;
  placement?: "list" | "bottom";
};

// TODO: Replace with real ad unit ID
// const AD_UNIT_ID = "ca-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY";

export default function AdBanner({ isPremium, locale, t, placement = "list" }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (isPremium || dismissed) return null;

  return (
    <div
      className={`relative mx-auto flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden ${
        placement === "bottom" ? "mt-2" : "my-1"
      }`}
      style={{ width: 320, height: 50 }}
    >
      {/* Placeholder for Google Adsense */}
      {/* TODO: Replace with real Google Adsense component */}
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <span>{t("ads.placeholder")}</span>
      </div>

      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-0.5 right-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs"
        aria-label={locale === "ja" ? "閉じる" : "Close"}
      >
        x
      </button>

      {/* Ad label */}
      <span className="absolute bottom-0.5 left-1 text-[8px] text-gray-300 uppercase tracking-wide">
        {t("ads.label")}
      </span>
    </div>
  );
}
