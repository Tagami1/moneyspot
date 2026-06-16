import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryByCode } from "@/lib/countries";
import {
  getCitiesByCountry,
  getPrimaryCurrencyForCountry,
  getWorldCity,
  worldCities,
} from "@/lib/world-cities";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return worldCities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getWorldCity(slug);
  if (!city) return {};
  const country = getCountryByCode(city.country);
  const currency = getPrimaryCurrencyForCountry(city.country);
  return {
    title: `Currency Exchange in ${city.name_en} — Best Rates & ${city.shop_count}+ Shops | MoneySpot`,
    description: `Find currency exchange shops in ${city.name_en}, ${country?.name_en ?? city.country}. Compare rates to ${currency}, see locations, opening hours, and reviews. ${city.shop_count} verified shops listed.`,
    keywords: [
      `${city.name_en} currency exchange`,
      `${city.name_en} money exchange`,
      `exchange rates ${city.name_en}`,
      `bureau de change ${city.name_en}`,
      `${city.name_en} ${currency}`,
      `where to exchange money ${city.name_en}`,
    ],
    alternates: { canonical: `/cities/${city.slug}` },
    openGraph: {
      title: `Currency Exchange in ${city.name_en} | MoneySpot`,
      description: `${city.shop_count} exchange shops in ${city.name_en}.`,
      url: `/cities/${city.slug}`,
      siteName: "MoneySpot",
      type: "website",
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getWorldCity(slug);
  if (!city) notFound();
  const country = getCountryByCode(city.country);
  const currency = getPrimaryCurrencyForCountry(city.country);
  const neighbours = getCitiesByCountry(city.country)
    .filter((c) => c.slug !== city.slug && c.shop_count > 0)
    .slice(0, 8);

  // JSON-LD: BreadcrumbList + Place
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MoneySpot", item: "https://moneyspot.money" },
          { "@type": "ListItem", position: 2, name: "Cities", item: "https://moneyspot.money/cities" },
          { "@type": "ListItem", position: 3, name: city.name_en, item: `https://moneyspot.money/cities/${city.slug}` },
        ],
      },
      {
        "@type": "Place",
        name: `Currency Exchange in ${city.name_en}`,
        address: { "@type": "PostalAddress", addressCountry: city.country, addressLocality: city.name_en },
        geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
        containedInPlace: { "@type": "Country", name: country?.name_en ?? city.country },
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
            <Link href="/cities">← All cities</Link>
          </nav>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-blue-600">
            {country?.flag} {country?.name_en ?? city.country}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Currency Exchange in {city.name_en}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            <strong>{city.shop_count} verified exchange shops</strong> in {city.name_en}. Compare locations,
            opening hours and exchange rates for <strong>{currency}</strong> and other major currencies.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/search/currency+exchange/@${city.lat},${city.lng},13z`}
              target="_blank"
              rel="noopener"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Open in Google Maps
            </a>
            <Link
              href={`/go/wise?to=${currency}&utm_campaign=city_${city.slug}`}
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Send money to {currency} with Wise →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-5 py-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">Verified shops</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{city.shop_count}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">Local currency</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{currency}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">Country</p>
            <p className="mt-1 text-2xl font-black text-gray-950">{country?.flag} {city.country}</p>
          </div>
        </div>
      </section>

      {/* Shop list */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <h2 className="text-xl font-black text-gray-950">
            Top {Math.min(city.top_shops.length, 50)} Exchange Shops in {city.name_en}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorted by proximity to city centre. Tap any shop to open it in Google Maps.
          </p>

          {city.top_shops.length === 0 ? (
            <p className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
              No verified shops indexed yet for {city.name_en}. Check back soon as our OpenStreetMap importer
              updates weekly.
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

      {/* Wise affiliate CTA */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">
              💸 Skip the queue
            </p>
            <h3 className="mt-2 text-xl font-black sm:text-2xl">
              Send {currency} online from anywhere — up to 8× cheaper than banks
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 opacity-95">
              Wise uses the real mid-market rate and shows the fee upfront. Faster than visiting a shop in {city.name_en}.
            </p>
            <Link
              href={`/go/wise?to=${currency}&utm_campaign=city_${city.slug}_cta`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Get started with Wise →
            </Link>
          </div>
        </div>
      </section>

      {/* Other cities in country */}
      {neighbours.length > 0 && (
        <section className="border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <h2 className="text-xl font-black text-gray-950">
              Other cities in {country?.name_en ?? city.country}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {neighbours.map((n) => (
                <Link
                  key={n.slug}
                  href={`/cities/${n.slug}`}
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
