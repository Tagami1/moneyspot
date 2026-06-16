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
    title: `${f.code} to ${t.code} — Convert ${f.name_en} to ${t.name_en} | MoneySpot`,
    description: `1 ${f.name_en} = ${rateStr} ${t.name_en}. Live ${f.code}/${t.code} exchange rate, currency converter, and where to exchange ${t.code} cash near you.`,
    keywords: [
      `${parsed.from} to ${parsed.to}`,
      `${f.name_en} to ${t.name_en}`,
      `convert ${parsed.from} ${parsed.to}`,
      `${parsed.from} ${parsed.to} exchange rate`,
      `${parsed.from} ${parsed.to} converter`,
    ],
    alternates: { canonical: `/convert/${pair}` },
    openGraph: {
      title: `${f.code} to ${t.code} — Currency Converter | MoneySpot`,
      description: `1 ${f.code} = ${rateStr} ${t.code}. Live rate + where to exchange cash.`,
      url: `/convert/${pair}`,
      siteName: "MoneySpot",
      type: "website",
    },
  };
}

const AMOUNTS = [1, 10, 50, 100, 500, 1000, 5000, 10000];

export default async function PairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) notFound();
  const { from, to } = parsed;
  const f = getCurrencyMeta(from)!;
  const t = getCurrencyMeta(to)!;
  const rate = crossRate(from, to);
  if (rate == null) notFound();
  const inverse = crossRate(to, from)!;

  const cityCandidates = CURRENCY_TO_CITY_SLUGS[to] || [];
  const cities = cityCandidates
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
          { "@type": "ListItem", position: 2, name: "Convert", item: "https://moneyspot.money/convert" },
          { "@type": "ListItem", position: 3, name: `${from} to ${to}`, item: `https://moneyspot.money/convert/${pair}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `How much is 1 ${f.name_en} in ${t.name_en}?`,
            acceptedAnswer: { "@type": "Answer", text: `1 ${from} = ${formatAmount(rate, to)} ${to} at the current mid-market rate.` },
          },
          {
            "@type": "Question",
            name: `Where can I exchange ${t.name_en} cash?`,
            acceptedAnswer: { "@type": "Answer", text: `MoneySpot lists verified currency exchange shops in 245+ cities worldwide, including cities that use the ${t.name_en}.` },
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
            <Link href="/convert">← All currencies</Link>
          </nav>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {f.flag} {from} to {to} {t.flag}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            Convert {f.name_en} to {t.name_en}
          </p>
          <p className="mt-4 text-2xl font-black text-blue-700">
            1 {from} = {formatAmount(rate, to)} {to}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            1 {to} = {formatAmount(inverse, from)} {from}
            {ratesData.updated_utc ? ` · mid-market rate, updated ${ratesData.updated_utc}` : ""}
          </p>

          <div className="mt-6">
            <ConverterWidget from={from} to={to} fromSymbol={f.symbol} toSymbol={t.symbol} baseRate={rate} />
          </div>
        </div>
      </section>

      {/* Amounts table — targets "N USD to JPY" long-tail */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{from} to {to} conversion table</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">{f.name_en}</th>
                  <th className="px-4 py-2 text-right font-bold">{t.name_en}</th>
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

      {/* Where to exchange — funnel to city pages + signup */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">Where to exchange {t.name_en} cash</h2>
          <p className="mt-2 text-sm text-gray-600">
            Online rates are mid-market. For cash, compare local exchange shops — MoneySpot lists verified shops in 245+ cities.
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
            <Link href="/cities" className="text-sm font-bold text-blue-700">Browse all cities →</Link>
          </div>
        </div>
      </section>

      {/* Reverse + related pairs */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">Related conversions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/convert/${pairSlug(to, from)}`} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {to} → {from}
            </Link>
            {["USD", "EUR", "JPY", "GBP"].filter((c) => c !== from && c !== to).map((c) => (
              <Link key={c} href={`/convert/${pairSlug(from, c)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                {from} → {c}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
