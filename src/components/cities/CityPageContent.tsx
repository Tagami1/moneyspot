import Link from "next/link";
import { getCountryByCode } from "@/lib/countries";
import {
  type WorldCity,
  getCitiesByCountry,
  getPrimaryCurrencyForCountry,
} from "@/lib/world-cities";
import { type CityDict, type CityLocale } from "@/lib/cities-i18n";
import { WISE_CTA_ENABLED } from "@/lib/flags";

type Props = {
  city: WorldCity;
  dict: CityDict;
  locale: CityLocale;
};

/** Localized city page. Used by /cities/[slug] (en) and /ja/cities/[slug]. */
export function CityPageContent({ city, dict, locale }: Props) {
  const country = getCountryByCode(city.country);
  const countryName = locale === "ja" ? country?.name_ja : country?.name_en;
  const currency = getPrimaryCurrencyForCountry(city.country);
  const cityName = city.name_en; // We don't have per-locale city names yet
  const neighbours = getCitiesByCountry(city.country)
    .filter((c) => c.slug !== city.slug && c.shop_count > 0)
    .slice(0, 8);
  const indexHref = locale === "en" ? "/cities" : `/${locale}/cities`;

  // JSON-LD: BreadcrumbList + Place + FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MoneySpot", item: "https://moneyspot.money" },
          { "@type": "ListItem", position: 2, name: dict.worldwide, item: `https://moneyspot.money${indexHref}` },
          { "@type": "ListItem", position: 3, name: cityName, item: `https://moneyspot.money${indexHref}/${city.slug}` },
        ],
      },
      {
        "@type": "Place",
        name: dict.pageHeader(cityName),
        address: { "@type": "PostalAddress", addressCountry: city.country, addressLocality: cityName },
        geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
        containedInPlace: { "@type": "Country", name: country?.name_en ?? city.country },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: locale === "ja"
              ? `${cityName}でおすすめの両替所は？`
              : `Where is the best currency exchange in ${cityName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: locale === "ja"
                ? `${cityName}には${city.shop_count}件の両替所がOpenStreetMapで確認されています。市の中心部に位置する店舗から距離順に表示しています。レートは店舗により異なるため、複数比較するのがおすすめです。`
                : `${cityName} has ${city.shop_count} verified currency exchange shops in our database. We list them by proximity to the city centre. Rates vary between shops, so it's worth comparing a few before committing.`,
            },
          },
          {
            "@type": "Question",
            name: locale === "ja"
              ? `${cityName}の両替で円→${currency}のレートはどこで分かりますか？`
              : `How do I get the best ${currency} exchange rate in ${cityName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: locale === "ja"
                ? `現地の両替所のレートは店舗により異なります。一般的に空港や観光地から離れた市街地の店舗のほうが良いレートで、Wise等のオンライン送金サービスは銀行や両替所より最大8倍安く${currency}を送金できます。`
                : `Rates vary between shops. Off-airport, off-tourist-area shops typically offer better rates. For larger amounts, online services like Wise can be up to 8× cheaper than banks or in-person exchanges.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
          <nav className="text-sm font-semibold text-blue-700">
            <Link href={indexHref}>{dict.back}</Link>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-600">
            {country?.flag} {countryName ?? city.country}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            {dict.pageHeader(cityName)}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            {locale === "ja"
              ? <><strong>{city.shop_count}件の検証済み両替所</strong>を{cityName}で掲載。<strong>{currency}</strong>と各通貨の場所・営業時間・レート情報を確認できます。</>
              : <><strong>{city.shop_count} verified exchange shops</strong> in {cityName}. Compare locations, opening hours and exchange rates for <strong>{currency}</strong> and other major currencies.</>}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/?lat=${city.lat}&lng=${city.lng}&city=${encodeURIComponent(cityName)}`}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              {dict.openMap}
            </Link>
            {WISE_CTA_ENABLED && (
              <Link
                href={`/go/wise?to=${currency}&utm_campaign=city_${city.slug}_${locale}`}
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {dict.wiseCTA(currency)}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-5 py-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">{dict.statsShops}</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{city.shop_count}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">{dict.statsCurrency}</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{currency}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">{dict.statsCountry}</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{country?.flag} {city.country}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <h2 className="text-xl font-black text-gray-950">
            {dict.topShopsTitle(cityName, Math.min(city.top_shops.length, 50))}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{dict.topShopsSub}</p>

          {city.top_shops.length === 0 ? (
            <p className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
              {dict.noShops(cityName)}
            </p>
          ) : (
            <ol className="mt-5 grid gap-2">
              {city.top_shops.map((shop, i) => {
                const displayName = shop.name_en || shop.name || `Exchange shop #${shop.id}`;
                const address = shop.address_en || shop.address;
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
                return (
                  <li key={shop.id}>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener"
                      className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:grid-cols-[40px_1fr_auto]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-black text-gray-950">{displayName}</p>
                        {address && <p className="mt-1 text-sm text-gray-500">{address}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {shop.distance_km.toFixed(1)} km
                      </div>
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* Money-saving tips — user value + SEO content */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">{dict.tipsTitle(cityName)}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {dict.tips(cityName, currency).map((tip, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700"
              >
                <span className="font-black text-blue-600">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Free account CTA (replaces affiliate CTA until 100 users) */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">
              {dict.saveLabel}
            </p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">
              {dict.saveTitle(cityName)}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 opacity-95">{dict.saveBody}</p>
            <Link
              href="/?register=1"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              {dict.saveCTA}
            </Link>
          </div>
        </div>
      </section>

      {/* Wise affiliate card — only when monetization is enabled (≥100 users) */}
      {WISE_CTA_ENABLED && (
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wide opacity-90">
                {dict.wiseCardLabel}
              </p>
              <h3 className="mt-2 text-xl font-black sm:text-2xl">
                {dict.wiseCardTitle(cityName, currency)}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 opacity-95">
                {dict.wiseCardBody(cityName)}
              </p>
              <Link
                href={`/go/wise?to=${currency}&utm_campaign=city_${city.slug}_${locale}_cta`}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
              >
                {dict.wiseCTA(currency)}
              </Link>
            </div>
          </div>
        </section>
      )}

      {neighbours.length > 0 && (
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <h2 className="text-xl font-black text-gray-950">
              {dict.otherCitiesIn(countryName ?? city.country)}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {neighbours.map((n) => (
                <Link
                  key={n.slug}
                  href={`${indexHref}/${n.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {n.name_en} ({n.shop_count})
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
