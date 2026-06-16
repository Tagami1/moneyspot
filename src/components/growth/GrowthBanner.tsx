"use client";

import { useState } from "react";
import Link from "next/link";
import type { TFunction } from "@/i18n/useTranslation";

type Props = {
  t: TFunction;
  onRegister: () => void;
};

const SHARE_URL = "https://moneyspot.money";

export default function GrowthBanner({ t, onRegister }: Props) {
  const [shareStatus, setShareStatus] = useState("");

  const shareMoneySpot = async () => {
    const text = t("growth.shareMessage");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "MoneySpot",
          text,
          url: SHARE_URL,
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n${SHARE_URL}`);
        setShareStatus(t("growth.shareCopied"));
        window.setTimeout(() => setShareStatus(""), 2500);
      }
    } catch {}
  };

  return (
    <section className="border-b border-green-100 bg-green-50 px-3 py-3">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-950">{t("growth.title")}</p>
          <p className="mt-1 text-xs leading-5 text-gray-600">{t("growth.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/?register=1"
            onClick={onRegister}
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-700"
          >
            {t("growth.registerCta")}
          </Link>
          <button
            onClick={shareMoneySpot}
            className="rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-100"
          >
            {shareStatus || t("growth.shareCta")}
          </button>
          <Link
            href="/share"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t("growth.prKit")}
          </Link>
        </div>
      </div>
    </section>
  );
}
