"use client";

import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  t: TFunction;
};

export default function PromotedBadge({ t }: Props) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap flex-shrink-0">
      <span className="text-amber-500">&#9733;</span>
      {t("shop.promoted")}
    </span>
  );
}
