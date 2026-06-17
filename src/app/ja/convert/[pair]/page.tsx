import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConverterWidget from "@/components/convert/ConverterWidget";
import {
  CURRENCY_TO_CITY_SLUGS,
  allPairs,
  getCurrencyMeta,
  pairSlug,
  parsePairSlug,
} from "@/lib/currencies-data";
import { getWorldCity } from "@/lib/world-cities";
import { crossRate, formatAmount, ratesData } from "@/lib/rates";
import { IOS_APP_URL } from "@/lib/app-links";

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return allPairs().map(({ from, to }) => ({ pair: pairSlug(from, to) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) return {};
  const f = getCurrencyMeta(parsed.from)!;
  const t = getCurrencyMeta(parsed.to)!;
  const rate = crossRate(parsed.from, parsed.to);
  const rateStr = rate ? formatAmount(rate, parsed.to) : "";
  return {
    title: `${parsed.from}を${parsed.to}に換算 | ${f.name_ja}→${t.name_ja}のレート | MoneySpot`,
    description: `1${f.name_ja}（${parsed.from}）＝${rateStr}${t.name_ja}（${parsed.to}）。${parsed.from}/${parsed.to}のリアルタイム為替レート、通貨換算ツール、現地で${t.name_ja}を両替できる場所も。`,
    keywords: [
      `${parsed.from} ${parsed.to} 換算`,
      `${f.name_ja} ${t.name_ja} 換算`,
      `${parsed.from} ${parsed.to} レート`,
      `${f.name_ja} 両替`,
      `${parsed.from}を${parsed.to}に`,
    ],
    alternates: {
      canonical: `/ja/convert/${pair}`,
      languages: { en: `/convert/${pair}`, ja: `/ja/convert/${pair}`, "x-default": `/convert/${pair}` },
    },
    openGraph: {
      title: `${parsed.from}→${parsed.to} 通貨換算 | MoneySpot`,
      description: `1${parsed.from}＝${rateStr}${parsed.to}。リアルタイムレート＋現金の両替先。`,
      url: `/ja/convert/${pair}`,
      siteName: "MoneySpot",
      type: "website",
      locale: "ja_JP",
    },
  };
}

const AMOUNTS = [1, 10, 50, 100, 500, 1000, 5000, 10000];

export default async function JaPairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();
  const { from, to } = parsed;
  const f = getCurrencyMeta(from)!;
  const t = getCurrencyMeta(to)!;
  const rate = crossRate(from, to);
  if (rate == null) notFound();
  const inverse = crossRate(to, from)!;

  const cities = (CURRENCY_TO_CITY_SLUGS[to] || [])
    .map((slug) => getWorldCity(slug))
    .filter((c): c is NonNullable<typeof c> => !!c && c.shop_count > 0)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MoneySpot", item: "https://moneyspot.money" },
          { "@type": "ListItem", position: 2, name: "通貨換算", item: "https://moneyspot.money/ja/convert" },
          { "@type": "ListItem", position: 3, name: `${from}→${to}`, item: `https://moneyspot.money/ja/convert/${pair}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `1${f.name_ja}は何${t.name_ja}ですか？`,
            acceptedAnswer: { "@type": "Answer", text: `現在の中間レートで1${from}＝${formatAmount(rate, to)}${to}です。` },
          },
          {
            "@type": "Question",
            name: `${t.name_ja}の現金はどこで両替できますか？`,
            acceptedAnswer: { "@type": "Answer", text: `MoneySpotでは世界245都市以上の両替所を掲載しています。${t.name_ja}を使う都市の店舗も検索できます。` },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
          <nav className="text-sm font-semibold text-blue-700">
            <Link href="/ja/convert">← 通貨一覧</Link>
          </nav>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {f.flag} {from} → {to} {t.flag}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            {f.name_ja}を{t.name_ja}に換算
          </p>
          <p className="mt-4 text-2xl font-black text-blue-700">
            1 {from} = {formatAmount(rate, to)} {to}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            1 {to} = {formatAmount(inverse, from)} {from}
            {ratesData.updated_utc ? ` ・中間レート（${ratesData.updated_utc} 更新）` : ""}
          </p>

          <div className="mt-6">
            <ConverterWidget from={from} to={to} fromSymbol={f.symbol} toSymbol={t.symbol} baseRate={rate} />
          </div>
          <p className="mt-4 text-sm">
            <a href={IOS_APP_URL} target="_blank" rel="noopener" className="font-bold text-blue-700 hover:underline">
              📱 MoneySpot の無料iPhoneアプリを入手 →
            </a>
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{from}→{to} 換算早見表</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">{f.name_ja}</th>
                  <th className="px-4 py-2 text-right font-bold">{t.name_ja}</th>
                </tr>
              </thead>
              <tbody>
                {AMOUNTS.map((a) => (
                  <tr key={a} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{formatAmount(a, from)} {from}</td>
                    <td className="px-4 py-2 text-right font-bold text-gray-900">{formatAmount(a * rate, to)} {to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{t.name_ja}の現金を両替できる場所</h2>
          <p className="mt-2 text-sm text-gray-600">
            オンラインのレートは中間レートです。現金は現地の両替所を比較しましょう。MoneySpotは世界245都市以上の両替所を掲載しています。
          </p>
          {cities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ja/cities/${c.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {c.name_en}（{c.shop_count}）
                </Link>
              ))}
            </div>
          )}
          <div className="mt-5">
            <Link href="/ja/cities" className="text-sm font-bold text-blue-700">すべての都市を見る →</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">関連する換算</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/ja/convert/${pairSlug(to, from)}`} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {to} → {from}
            </Link>
            {["USD", "JPY", "EUR", "GBP"].filter((c) => c !== from && c !== to).map((c) => (
              <Link key={c} href={`/ja/convert/${pairSlug(from, c)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                {from} → {c}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
