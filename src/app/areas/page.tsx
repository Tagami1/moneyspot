import type { Metadata } from "next";
import Link from "next/link";
import { areaPages } from "@/lib/areas";

export const metadata: Metadata = {
  title: "地域別の外貨両替レート比較",
  description:
    "新宿、渋谷、銀座、東京駅、空港など、地域別に外貨両替レートを比較できます。",
  alternates: {
    canonical: "/areas",
  },
};

export default function AreasPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-blue-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <Link href="/" className="text-sm font-semibold text-blue-700">
            MoneySpot
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-normal text-gray-950">
            地域別の外貨両替レート比較
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            旅行者が検索しやすい主要エリアごとに、近くの両替所・参考レート・営業時間を確認できます。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areaPages.map((area) => (
            <Link
              key={area.slug}
              href={`/areas/${area.slug}`}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="text-xs font-bold uppercase tracking-normal text-blue-600">
                {area.nameEn}
              </p>
              <h2 className="mt-1 text-lg font-black text-gray-950">{area.nameJa}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{area.descriptionJa}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
