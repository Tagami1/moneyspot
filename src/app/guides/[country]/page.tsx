import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getGuideBySlug,
  guideCurrencyName,
  guideFlag,
  guideSlug,
  guides,
} from "@/lib/guides";
import { getWorldCity } from "@/lib/world-cities";
import { CURRENCY_TO_CITY_SLUGS, pairSlug } from "@/lib/currencies-data";

type Props = { params: Promise<{ country: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ country: guideSlug(g) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const g = getGuideBySlug(country);
  if (!g) return {};
  const cur = guideCurrencyName(g);
  return {
    title: `${g.country_en} Travel Money Guide — Currency, Cash & Exchange Tips | MoneySpot`,
    description: `Everything about money in ${g.country_en}: the ${cur} (${g.currency_code}), cash vs card, where to get the best exchange rates, ATM tips, tipping, and scams to avoid.`,
    keywords: [
      `${g.country_en} travel money`,
      `${g.country_en} currency`,
      `money in ${g.country_en}`,
      `${g.country_en} exchange rate tips`,
      `cash or card ${g.country_en}`,
      `${cur} exchange`,
    ],
    alternates: { canonical: `/guides/${country}` },
    openGraph: {
      title: `${g.country_en} Travel Money Guide | MoneySpot`,
      description: `Money tips for ${g.country_en}: ${cur}, exchange rates, ATMs, tipping & scams.`,
      url: `/guides/${country}`,
      siteName: "MoneySpot",
      type: "article",
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { country } = await params;
  const g = getGuideBySlug(country);
  if (!g) notFound();
  const cur = guideCurrencyName(g);
  const flag = guideFlag(g);

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
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://moneyspot.money/guides" },
          { "@type": "ListItem", position: 3, name: g.country_en, item: `https://moneyspot.money/guides/${country}` },
        ],
      },
      {
        "@type": "Article",
        headline: `${g.country_en} Travel Money Guide`,
        about: `Currency and money tips for travelers to ${g.country_en}`,
        inLanguage: "en",
        publisher: { "@type": "Organization", name: "MoneySpot" },
      },
      {
        "@type": "FAQPage",
        mainEntity: g.sections.slice(0, 4).map((s) => ({
          "@type": "Question",
          name: `${s.heading} in ${g.country_en}`,
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
            <Link href="/guides">← All guides</Link>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-600">
            {flag} {g.country_en} · {g.currency_code}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {g.country_en} Travel Money Guide
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{g.intro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/convert/${pairSlug("USD", g.currency_code === "USD" ? "EUR" : g.currency_code)}`}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              💱 Check the {g.currency_code} rate
            </Link>
            {cities.length > 0 && (
              <Link
                href={`/cities/${cities[0].slug}`}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Find exchange shops →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick tips */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">Quick tips</h2>
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

      {/* Full sections */}
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

      {/* Where to exchange — funnel */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">Find exchange shops in {g.country_en}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Compare verified currency exchange shops near you — opening hours, locations and reviews.
          </p>
          {cities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {c.name_en} ({c.shop_count})
                </Link>
              ))}
            </div>
          )}
          <div className="mt-5">
            <Link href="/cities" className="text-sm font-bold text-blue-700">Browse all 245+ cities →</Link>
          </div>
        </div>
      </section>

      {/* Free signup */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">⭐ Free account</p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">Save shops & get rate alerts for your trip</h3>
            <p className="mt-2 text-sm leading-6 opacity-95">
              Create a free account to bookmark exchange shops, get rate alerts, and sync across devices. No fees, no ads.
            </p>
            <Link href="/?register=1" className="mt-5 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">
              Sign up free with email →
            </Link>
          </div>
        </div>
      </section>

      {/* Other guides */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">More travel money guides</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {guides.filter((x) => x.code !== g.code).slice(0, 12).map((x) => (
              <Link key={x.code} href={`/guides/${guideSlug(x)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                {guideFlag(x)} {x.country_en}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
