import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GUIDE_LOCALES,
  GUIDE_UI,
  getLocGuides,
  locGuideFlag,
  locGuideSlug,
  type GuideLocale,
} from "@/lib/guides-loc";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return GUIDE_LOCALES.map((locale) => ({ locale }));
}

function asLocale(s: string): GuideLocale | null {
  return (GUIDE_LOCALES as string[]).includes(s) ? (s as GuideLocale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = asLocale(locale);
  if (!l) return {};
  const ui = GUIDE_UI[l];
  return {
    title: `${ui.indexTitle} | MoneySpot`,
    description: ui.indexDesc,
    alternates: {
      canonical: `/${l}/guides`,
      languages: { en: "/guides", ja: "/ja/guides", zh: "/zh/guides", ko: "/ko/guides", "x-default": "/guides" },
    },
    openGraph: { title: `${ui.indexTitle} | MoneySpot`, description: ui.indexDesc, url: `/${l}/guides`, siteName: "MoneySpot", type: "website", locale: ui.ogLocale },
  };
}

export default async function LocGuidesIndex({ params }: Props) {
  const { locale } = await params;
  const l = asLocale(locale);
  if (!l) notFound();
  const ui = GUIDE_UI[l];
  const list = getLocGuides(l);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
          <Link href="/" className="text-sm font-semibold text-blue-700">← MoneySpot</Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">{ui.indexTitle}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">{ui.indexDesc}</p>
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/guides" className="font-semibold text-blue-700 underline">{ui.enLabel}</Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <Link
              key={g.code}
              href={`/${l}/guides/${locGuideSlug(g)}`}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-gray-950">{locGuideFlag(g)} {g.country}</p>
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
