import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GUIDE_LOCALES,
  GUIDE_UI,
  getLocGuide,
  getLocGuides,
  locCurrencyName,
  locGuideFlag,
  locGuideSlug,
  type GuideLocale,
} from "@/lib/guides-loc";
import { getWorldCity } from "@/lib/world-cities";
import { CURRENCY_TO_CITY_SLUGS, pairSlug } from "@/lib/currencies-data";

type Props = { params: Promise<{ locale: string; country: string }> };

export function generateStaticParams() {
  return GUIDE_LOCALES.flatMap((locale) =>
    getLocGuides(locale).map((g) => ({ locale, country: locGuideSlug(g) }))
  );
}

function asLocale(s: string): GuideLocale | null {
  return (GUIDE_LOCALES as string[]).includes(s) ? (s as GuideLocale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  const l = asLocale(locale);
  if (!l) return {};
  const g = getLocGuide(l, country);
  if (!g) return {};
  const ui = GUIDE_UI[l];
  const cur = locCurrencyName(l, g);
  return {
    title: ui.metaTitle(g.country, cur),
    description: ui.metaDesc(g.country, cur, g.currency_code),
    alternates: {
      canonical: `/${l}/guides/${country}`,
      languages: {
        en: `/guides/${country}`, ja: `/ja/guides/${country}`,
        zh: `/zh/guides/${country}`, ko: `/ko/guides/${country}`,
        "x-default": `/guides/${country}`,
      },
    },
    openGraph: { title: ui.pageTitle(g.country), description: ui.metaDesc(g.country, cur, g.currency_code), url: `/${l}/guides/${country}`, siteName: "MoneySpot", type: "article", locale: ui.ogLocale },
  };
}

export default async function LocGuidePage({ params }: Props) {
  const { locale, country } = await params;
  const l = asLocale(locale);
  if (!l) notFound();
  const g = getLocGuide(l, country);
  if (!g) notFound();
  const ui = GUIDE_UI[l];
  const cur = locCurrencyName(l, g);
  const flag = locGuideFlag(g);

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
          { "@type": "ListItem", position: 2, name: ui.indexTitle, item: `https://moneyspot.money/${l}/guides` },
          { "@type": "ListItem", position: 3, name: g.country, item: `https://moneyspot.money/${l}/guides/${country}` },
        ],
      },
      { "@type": "Article", headline: ui.pageTitle(g.country), inLanguage: l, publisher: { "@type": "Organization", name: "MoneySpot" } },
      {
        "@type": "FAQPage",
        mainEntity: g.sections.slice(0, 4).map((s) => ({
          "@type": "Question", name: `${g.country} — ${s.heading}`,
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
            <Link href={`/${l}/guides`}>{ui.back}</Link>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-600">{flag} {g.country} · {g.currency_code}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">{ui.pageTitle(g.country)}</h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{g.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/convert/${pairSlug("USD", g.currency_code === "USD" ? "EUR" : g.currency_code)}`}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              {ui.rateCta(cur)}
            </Link>
            {cities.length > 0 && (
              <Link href={`/${l}/cities/${cities[0].slug}`} className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                {ui.findCta}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{ui.quickTips}</h2>
          <ul className="mt-4 grid gap-2">
            {g.quick_tips.map((tip, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                <span className="font-black text-blue-600">✓</span><span>{tip}</span>
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
          <h2 className="text-xl font-black text-gray-950">{ui.findShops(g.country)}</h2>
          <p className="mt-2 text-sm text-gray-600">{ui.findShopsSub}</p>
          {cities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <Link key={c.slug} href={`/${l}/cities/${c.slug}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                  {c.name_en}（{c.shop_count}）
                </Link>
              ))}
            </div>
          )}
          <div className="mt-5"><Link href={`/${l}/cities`} className="text-sm font-bold text-blue-700">{ui.allCities}</Link></div>
        </div>
      </section>

      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">{ui.saveLabel}</p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">{ui.saveTitle}</h3>
            <p className="mt-2 text-sm leading-6 opacity-95">{ui.saveBody}</p>
            <Link href="/?register=1" className="mt-5 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50">{ui.saveCTA}</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{ui.otherGuides}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {getLocGuides(l).filter((x) => x.code !== g.code).slice(0, 12).map((x) => (
              <Link key={x.code} href={`/${l}/guides/${locGuideSlug(x)}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700">
                {locGuideFlag(x)} {x.country}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
