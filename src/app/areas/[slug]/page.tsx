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
} from "@/lib/rate-display";
import { getAreaRanking, getShopSlug } from "@/lib/shop-pages";
import { formatRate, formatTimeAgo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return areaPages.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaPage(slug);
  if (!area) return {};

  return {
    title: `${area.nameJa}の外貨両替レート比較`,
    description: `${area.descriptionJa} MoneySpotで近くの両替所、実レート、参考レート、10,000円換算ランキングを比較できます。`,
    keywords: area.searchKeywords,
    alternates: {
      canonical: `/areas/${area.slug}`,
    },
    openGraph: {
      title: `${area.nameJa}の外貨両替レート比較 | MoneySpot`,
      description: area.descriptionJa,
      url: `/areas/${area.slug}`,
      siteName: "MoneySpot",
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getAreaPage(slug);
  if (!area) notFound();

  const appHref = `/?area=${area.slug}`;
  const ranking = getAreaRanking(area);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-blue-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
          <Link href="/areas" className="text-sm font-semibold text-blue-700">
            地域一覧へ
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-normal text-blue-600">
            {area.nameEn} exchange rates
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal text-gray-950 sm:text-4xl">
            {area.nameJa}の外貨両替レート比較
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            {area.descriptionJa}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {area.descriptionEn}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={appHref}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {area.nameJa}周辺で探す
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              地図から探す
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-black text-gray-950">比較できること</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              店舗ごとの売値・買値、営業状況、最終更新時刻、実レートか参考レートかを見比べられます。
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-black text-gray-950">10,000円の目安</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              一覧では10,000円を両替した場合に受け取れる外貨額の目安を確認できます。
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-base font-black text-gray-950">近くの候補</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {area.nearbyHints.join("、")}など、移動しやすい周辺スポットを基準に探せます。
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <h2 className="text-xl font-black text-gray-950">通貨別に比較する</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          エリア内の店舗を、USD・EUR・KRWなど通貨ごとの販売レートで比較できます。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {mockCurrencies.slice(0, 9).map((currency) => (
            <Link
              key={currency.code}
              href={`/areas/${area.slug}/${currency.code.toLowerCase()}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              {currency.flag_emoji} {currency.code}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-950">
                {area.nameJa}周辺の10,000円比較ランキング
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                USD販売レートをもとに、10,000円で受け取れる外貨額の目安を比較しています。
              </p>
            </div>
            <Link href={appHref} className="text-sm font-bold text-blue-700">
              地図で見る
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {ranking.map(({ shop, rate, distanceKm }, index) => {
              const converted = convertJpyToForeign(COMPARISON_JPY_AMOUNT, rate?.sell_rate);
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
                      {formatForeignAmount(converted, rate?.currency_code ?? "USD", "ja")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      販売 ¥{formatRate(rate?.sell_rate ? Number(rate.sell_rate) : null)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">よく検索されるキーワード</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {area.searchKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h2 className="text-xl font-black text-gray-950">利用前のチェックポイント</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-600">
            実店舗レートは店舗・取得タイミングで変わります。来店直前に最終更新時刻を確認してください。
          </p>
          <p className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-600">
            参考レートは市場レートをもとにした目安です。実際の交換額や手数料は店舗で確認してください。
          </p>
        </div>
      </section>
    </main>
  );
}
