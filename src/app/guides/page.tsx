import type { Metadata } from "next";
import Link from "next/link";
import { guideFlag, guideSlug, guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Travel Money Guides — Currency & Exchange Tips by Country | MoneySpot",
  description:
    "Country-by-country travel money guides: local currency, cash vs card, where to get the best exchange rates, ATM tips, tipping, and scams to avoid.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Travel Money Guides by Country | MoneySpot",
    description: "Currency, cash, ATM and exchange tips for 24 top destinations.",
    url: "/guides",
    siteName: "MoneySpot",
    type: "website",
  },
};

export default function GuidesIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">← MoneySpot</Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Travel Money Guides
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">
            Know before you go. For each country: the local currency, whether to use cash or card,
            where to get the best exchange rates, ATM and tipping tips, and the money scams to avoid.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Link
              key={g.code}
              href={`/guides/${guideSlug(g)}`}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-gray-950">{guideFlag(g)} {g.country_en}</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{g.currency_code}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{g.intro}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
