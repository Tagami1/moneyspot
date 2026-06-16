import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areaPages, getAreaPage } from "@/lib/areas";
import { mockCurrencies } from "@/lib/mock-data";
import {
  COMPARISON_JPY_AMOUNT,
  convertJpyToForeign,
  formatForeignAmount,
  formatJpyAmount,
  getRateTrustScore,
} from "@/lib/rate-display";
import { getAreaCurrencyRanking, getShopSlug } from "@/lib/shop-pages";
import { formatRate, formatTimeAgo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string; currency: string }>;
};

function getCurrency(code: string) {
  return mockCurrencies.find((currency) => currency.code === code.toUpperCase());
}

export function generateStaticParams() {
  return areaPages.flatMap((area) =>
    mockCurrencies.map((currency) => ({
      slug: area.slug,
      currency: currency.code.toLowerCase(),
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, currency: currencyParam } = await params;
  const area = getAreaPage(slug);
  const currency = getCurrency(currencyParam);
  if (!area || !currency) return {};

  return {
    title: `${area.nameJa}の${currency.name_ja}両替レート比較`,
    description: `${area.nameJa}周辺で${currency.name_ja}（${currency.code}）を両替できる店舗、販売レート、10,000円換算、最終更新時刻を比較できます。`,
    keywords: [
      `${area.nameJa} ${currency.code} 両替`,
      `${area.nameJa} ${currency.name_ja} レート`,
      `${area.nameEn} ${currency.name_en} exchange`,
      ...area.searchKeywords,
    ],
    alternates: {
      canonical: `/areas/${area.slug}/${currency.code.toLowerCase()}`,
    },
    openGraph: {
      title: `${area.nameJa}の${currency.code}両替レート比較 | MoneySpot`,
      description: `${area.nameJa}周辺の${currency.name_ja}レートを10,000円換算で比較できます。`,
      url: `/areas/${area.slug}/${currency.code.toLowerCase()}`,
      siteName: "MoneySpot",
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function AreaCurrencyPage({ params }: Props) {
  const { slug, currency: currencyParam } = await params;
  const area = getAreaPage(slug);
  const currency = getCurrency(currencyParam);
  if (!area || !currency) notFound();

  const ranking = getAreaCurrencyRanking(area, currency.code);
  const appHref = `/?area=${area.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${area.nameJa}の${currency.code}両替レート比較`,
    itemListElement: ranking.map(({ shop, rate }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://moneyspot.money/shops/${getShopSlug(shop)}`,
      name: `${shop.name} ${currency.code} 販売 ${rate?.sell_rate ? `¥${formatRate(Number(rate.sell_rate))}` : ""}`,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-gray-200 bg-blue-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-700">
            <Link href="/areas">地域一覧</Link>
            <span className="text-blue-300">/</span>
            <Link href={`/areas/${area.slug}`}>{area.nameJa}</Link>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-normal text-blue-600">
            {area.nameEn} {currency.code} exchange rates
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal text-gray-950 sm:text-4xl">
            {area.nameJa}の{currency.name_ja}（{currency.code}）両替レート比較
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            {area.descriptionJa} {currency.name_ja}を10,000円で両替した場合の目安と、店舗ごとの更新状況を比較できます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={appHref}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              アプリで周辺を探す
            </Link>
            <Link
              href={`/areas/${area.slug}`}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {area.nameJa}の全通貨を見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-700">比較通貨</p>
            <p className="mt-2 text-2xl font-black text-blue-950">
              {currency.flag_emoji} {currency.name_ja}
            </p>
            <p className="mt-1 text-sm font-semibold text-blue-700">{currency.code}</p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">比較エリア</p>
            <p className="mt-2 text-lg font-black text-gray-950">{area.nameJa}</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">半径約{area.radiusKm}kmの掲載店舗を比較</p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">確認ポイント</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              実店舗レート、参考レート、投稿レートを区別し、来店直前の確認に使いやすくしています。
            </p>
          </article>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">
            {area.nameJa}周辺の{currency.code}レートランキング
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            販売レートが低い順に並べています。10,000円で受け取れる{currency.code}の目安も確認できます。
          </p>

          {ranking.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {ranking.map(({ shop, rate, distanceKm }, index) => {
                const converted = convertJpyToForeign(COMPARISON_JPY_AMOUNT, rate?.sell_rate);
                const trustScore = getRateTrustScore(rate?.rate_type, rate?.fetched_at);
                return (
                  <Link
                    key={shop.id}
                    href={`/shops/${getShopSlug(shop)}`}
                    className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:grid-cols-[48px_1fr_auto]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-950">{shop.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{shop.address}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        約{distanceKm.toFixed(1)}km / {rate ? `${formatTimeAgo(rate.fetched_at, "ja")}前更新` : "更新情報なし"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs font-bold text-gray-500">
                        ¥{formatJpyAmount(COMPARISON_JPY_AMOUNT, "ja")}なら
                      </p>
                      <p className="mt-1 text-lg font-black text-blue-700">
                        {formatForeignAmount(converted, currency.code, "ja")}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        販売 ¥{formatRate(rate?.sell_rate ? Number(rate.sell_rate) : null)} / 信頼度 {trustScore.score}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm leading-6 text-gray-600">
                現在、{area.nameJa}周辺の{currency.code}掲載レートは更新待ちです。アプリでは近隣店舗や別通貨の候補も確認できます。
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h2 className="text-xl font-black text-gray-950">関連する通貨ページ</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {mockCurrencies
            .filter((item) => item.code !== currency.code)
            .slice(0, 8)
            .map((item) => (
              <Link
                key={item.code}
                href={`/areas/${area.slug}/${item.code.toLowerCase()}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
              >
                {item.flag_emoji} {item.code}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
