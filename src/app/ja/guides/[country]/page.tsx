import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getJaGuideBySlug,
  jaCurrencyNameJa,
  jaGuideFlag,
  jaGuideSlug,
  jaGuides,
} from "@/lib/guides-ja";
import { getWorldCity } from "@/lib/world-cities";
import { CURRENCY_TO_CITY_SLUGS, pairSlug } from "@/lib/currencies-data";

type Props = { params: Promise<{ country: string }> };

export function generateStaticParams() {
  return jaGuides.map((g) => ({ country: jaGuideSlug(g) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const g = getJaGuideBySlug(country);
  if (!g) return {};
  const cur = jaCurrencyNameJa(g);
  return {
    title: `${g.country_ja}の旅行マネーガイド｜両替・${cur}・現金・チップ | MoneySpot`,
    description: `${g.country_ja}のお金のすべて：${cur}（${g.currency_code}）、現金とカードの使い分け、一番得する両替方法、ATM、チップ、詐欺対策まで日本語で解説。`,
    keywords: [
      `${g.country_ja} 両替`,
      `${g.country_ja} 通貨`,
      `${g.country_ja} 現金 カード`,
      `${g.country_ja} 旅行 お金`,
      `${cur} 両替`,
      `${g.country_ja} ATM チップ`,
    ],
    alternates: {
      canonical: `/ja/guides/${country}`,
      languages: { en: `/guides/${country}`, ja: `/ja/guides/${country}`, "x-default": `/guides/${country}` },
    },
    openGraph: {
      title: `${g.country_ja}の旅行マネーガイド | MoneySpot`,
      description: `${g.country_ja}の${cur}・両替・ATM・チップ・詐欺対策を日本語で。`,
      url: `/ja/guides/${country}`,
      siteName: "MoneySpot",
      type: "article",
      locale: "ja_JP",
    },
  };
}

export default async function JaGuidePage({ params }: Props) {
  const { country } = await params;
  const g = getJaGuideBySlug(country);
  if (!g) notFound();
  const cur = jaCurrencyNameJa(g);
  const flag = jaGuideFlag(g);

  const cities = (CURRENCY_TO_CITY_SLUGS[g.currency_code] || [])
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
          { "@type": "ListItem", position: 2, name: "ガイド", item: "https://moneyspot.money/ja/guides" },
          { "@type": "ListItem", position: 3, name: g.country_ja, item: `https://moneyspot.money/ja/guides/${country}` },
        ],
      },
      {
        "@type": "Article",
        headline: `${g.country_ja}の旅行マネーガイド`,
        inLanguage: "ja",
        publisher: { "@type": "Organization", name: "MoneySpot" },
      },
      {
        "@type": "FAQPage",
        mainEntity: g.sections.slice(0, 4).map((s) => ({
          "@type": "Question",
          name: `${g.country_ja}の${s.heading}`,
          acceptedAnswer: { "@type": "Answer", text: s.body },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
          <nav className="text-sm font-semibold text-blue-700">
            <Link href="/ja/guides">← ガイド一覧</Link>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-600">
            {flag} {g.country_ja} · {g.currency_code}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {g.country_ja}の旅行マネーガイド
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{g.intro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/convert/${pairSlug(g.currency_code === "JPY" ? "USD" : "JPY", g.currency_code === "JPY" ? "JPY" : g.currency_code)}`}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              💱 {cur}のレートを見る
            </Link>
            {cities.length > 0 && (
              <Link
                href={`/ja/cities/${cities[0].slug}`}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                両替所を探す →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">クイックTips</h2>
          <ul className="mt-4 grid gap-2">
            {g.quick_tips.map((tip, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                <span className="font-black text-blue-600">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="grid gap-6">
            {g.sections.map((s, i) => (
              <article key={i}>
                <h2 className="text-lg font-black text-gray-950">{s.heading}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-700">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{g.country_ja}の両替所を探す</h2>
          <p className="mt-2 text-sm text-gray-600">
            現地の両替所を比較。営業時間・場所・口コミをチェックできます。
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
            <Link href="/ja/cities" className="text-sm font-bold text-blue-700">世界245都市の両替所を見る →</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">⭐ 無料アカウント</p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">お気に入りの両替所を保存・レート通知</h3>
            <p className="mt-2 text-sm leading-6 opacity-95">
              無料登録でお気に入り店舗をブックマーク、レート通知、端末間で同期。手数料・広告なし。
            </p>
            <Link href="/?register=1" className="mt-5 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
              メールで無料登録 →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">他の国のお金ガイド</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {jaGuides.filter((x) => x.code !== g.code).slice(0, 12).map((x) => (
              <Link key={x.code} href={`/ja/guides/${jaGuideSlug(x)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                {jaGuideFlag(x)} {x.country_ja}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
