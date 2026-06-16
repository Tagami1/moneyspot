import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockShops } from "@/lib/mock-data";
import {
  COMPARISON_JPY_AMOUNT,
  convertJpyToForeign,
  formatForeignAmount,
  formatJpyAmount,
  getRateTrustLabelKey,
  getRateTrustNoteKey,
  getRateTrustScore,
} from "@/lib/rate-display";
import { getNearbyArea, getShopBySlug, getShopComparisonText, getShopPrimaryRate, getShopSlug } from "@/lib/shop-pages";
import { formatRate, formatTimeAgo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://moneyspot.money";
const schemaDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const rateLabelJa: Record<string, string> = {
  "shop.actualRate": "実店舗レート",
  "shop.referenceEstimate": "参考レート",
  "shop.userReportedRate": "投稿レート",
};

const rateNoteJa: Record<string, string> = {
  "shop.actualRateNote": "店舗または公式情報から取得したレートです。",
  "shop.referenceRateNoteShort": "市場レートをもとにした目安です。店舗の実レートとは異なる場合があります。",
  "shop.userReportedRateNote": "ユーザーから共有されたレートです。来店前に店舗で確認してください。",
};

export function generateStaticParams() {
  return mockShops.map((shop) => ({ slug: getShopSlug(shop) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) return {};

  const area = getNearbyArea(shop);
  const rate = getShopPrimaryRate(shop);
  const rateText = rate?.sell_rate ? `USD販売レートは¥${formatRate(Number(rate.sell_rate))}` : "外貨両替レートを掲載";

  return {
    title: `${shop.name}の外貨両替レート`,
    description: `${shop.name}（${area.nameJa}周辺）の外貨両替レート、営業時間、住所、10,000円換算を確認できます。${rateText}。`,
    keywords: [
      `${shop.name} 両替`,
      `${shop.name_en} currency exchange`,
      `${area.nameJa} 両替`,
      "外貨両替 レート",
      "money exchange Japan",
    ],
    alternates: {
      canonical: `/shops/${getShopSlug(shop)}`,
    },
    openGraph: {
      title: `${shop.name}の外貨両替レート | MoneySpot`,
      description: `${shop.address}。10,000円換算とレートの信頼性を確認できます。`,
      url: `/shops/${getShopSlug(shop)}`,
      siteName: "MoneySpot",
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) notFound();

  const area = getNearbyArea(shop);
  const primaryRate = getShopPrimaryRate(shop);
  const comparisonText = getShopComparisonText(shop, primaryRate?.currency_code ?? "USD");
  const trustLabel = rateLabelJa[getRateTrustLabelKey(primaryRate?.rate_type)] ?? "参考レート";
  const trustNote = rateNoteJa[getRateTrustNoteKey(primaryRate?.rate_type)] ?? rateNoteJa["shop.referenceRateNoteShort"];
  const trustScore = primaryRate ? getRateTrustScore(primaryRate.rate_type, primaryRate.fetched_at) : null;
  const appHref = `/?shop=${shop.id}`;
  const shopUrl = `${SITE_URL}/shops/${getShopSlug(shop)}`;
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`;
  const currenciesAccepted = Array.from(
    new Set(shop.exchange_rates.map((rate) => rate.currency_code))
  ).join(", ");
  const openingHoursSpecification = shop.shop_business_hours
    ?.filter((hours) => !hours.is_closed && hours.open_time && hours.close_time)
    .map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaDays[hours.day_of_week],
      opens: hours.open_time?.slice(0, 5),
      closes: hours.close_time?.slice(0, 5),
    }));
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "@id": shopUrl,
      name: shop.name,
      alternateName: shop.name_en,
      description: `${shop.name}（${area.nameJa}周辺）の外貨両替レート、営業時間、10,000円換算を掲載しています。`,
      url: shopUrl,
      sameAs: shop.website_url ? [shop.website_url] : undefined,
      telephone: shop.phone ?? undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: shop.address,
        addressCountry: "JP",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: shop.lat,
        longitude: shop.lng,
      },
      hasMap: mapUrl,
      areaServed: area.nameJa,
      currenciesAccepted,
      paymentAccepted: "Cash",
      openingHoursSpecification,
      additionalProperty: [
        primaryRate
          ? {
              "@type": "PropertyValue",
              name: `${primaryRate.currency_code} sell rate`,
              value: Number(primaryRate.sell_rate ?? 0),
              unitText: "JPY",
            }
          : undefined,
        primaryRate
          ? {
              "@type": "PropertyValue",
              name: "Rate source",
              value: trustLabel,
            }
          : undefined,
        trustScore
          ? {
              "@type": "PropertyValue",
              name: "MoneySpot trust score",
              value: trustScore.score,
              minValue: 0,
              maxValue: 100,
            }
          : undefined,
      ].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "地域別ページ",
          item: `${SITE_URL}/areas`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: area.nameJa,
          item: `${SITE_URL}/areas/${area.slug}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: shop.name,
          item: shopUrl,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-gray-200 bg-blue-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-700">
            <Link href="/areas">地域別ページ</Link>
            <span className="text-blue-300">/</span>
            <Link href={`/areas/${area.slug}`}>{area.nameJa}</Link>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-normal text-blue-600">
            {shop.name_en || "Currency exchange shop"}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal text-gray-950 sm:text-4xl">
            {shop.name}の外貨両替レート
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            {shop.address}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={appHref}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              アプリでこの店舗を見る
            </Link>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              ルートを開く
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-700">10,000円の目安</p>
            <p className="mt-2 text-2xl font-black text-blue-950">
              ¥{formatJpyAmount(COMPARISON_JPY_AMOUNT, "ja")}なら {comparisonText}
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">レートの信頼性</p>
            <p className="mt-2 text-lg font-black text-gray-950">{trustLabel}</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">{trustNote}</p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">信頼スコア / 最終確認</p>
            <p className="mt-2 text-lg font-black text-gray-950">
              {trustScore ? `${trustScore.score}/100` : "-"}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {primaryRate ? `${formatTimeAgo(primaryRate.fetched_at, "ja")}前に確認` : "更新情報なし"}
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">掲載レート</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-bold text-gray-700">通貨</th>
                  <th className="p-3 text-right font-bold text-gray-700">買取</th>
                  <th className="p-3 text-right font-bold text-gray-700">販売</th>
                  <th className="p-3 text-right font-bold text-gray-700">10,000円換算</th>
                </tr>
              </thead>
              <tbody>
                {shop.exchange_rates.map((rate) => {
                  const converted = convertJpyToForeign(COMPARISON_JPY_AMOUNT, rate.sell_rate);
                  return (
                    <tr key={rate.currency_code} className="border-t border-gray-100">
                      <td className="p-3 font-bold text-gray-950">{rate.currency_code}</td>
                      <td className="p-3 text-right text-gray-700">¥{formatRate(rate.buy_rate ? Number(rate.buy_rate) : null)}</td>
                      <td className="p-3 text-right font-bold text-blue-700">¥{formatRate(rate.sell_rate ? Number(rate.sell_rate) : null)}</td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        {formatForeignAmount(converted, rate.currency_code, "ja")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h2 className="text-xl font-black text-gray-950">店舗情報</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">住所</p>
            <p className="mt-2 text-sm leading-6 text-gray-800">{shop.address}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">連絡先</p>
            <p className="mt-2 text-sm leading-6 text-gray-800">{shop.phone ?? "未掲載"}</p>
            {shop.website_url && (
              <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm font-semibold text-blue-700">
                公式サイト
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
