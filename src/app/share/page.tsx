import type { Metadata } from "next";
import Link from "next/link";
import { areaPages } from "@/lib/areas";

export const metadata: Metadata = {
  title: "MoneySpotを紹介する",
  description:
    "MoneySpotを友人・旅行者・SNSで紹介しやすいように、短い紹介文、検索されやすい地域ページ、共有リンクをまとめました。",
  alternates: {
    canonical: "/share",
  },
  openGraph: {
    title: "MoneySpotを紹介する | MoneySpot",
    description:
      "日本で外貨両替を探す人にMoneySpotを紹介するための共有ページです。",
    url: "/share",
    siteName: "MoneySpot",
    type: "website",
    locale: "ja_JP",
  },
};

const shareCopies = [
  "日本で外貨両替する前に、MoneySpotで近くの店舗とレートを比較できます。",
  "東京・空港・主要都市の両替レートを、10,000円換算で見比べられるMoneySpotが便利です。",
  "旅行前に外貨両替の候補を探すならMoneySpot。店舗レート、参考レート、営業時間をまとめて確認できます。",
];

export default function SharePage() {
  const featuredAreas = areaPages.slice(0, 10);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-green-100 bg-green-50">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
          <Link href="/" className="text-sm font-bold text-green-700">
            MoneySpotに戻る
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-normal text-green-700">
            Share MoneySpot
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-normal text-gray-950 sm:text-4xl">
            MoneySpotを紹介する
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
            日本で外貨両替を探している友人、旅行者、SNSのフォロワーに紹介しやすいように、短い紹介文と地域別リンクをまとめました。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://moneyspot.money"
              className="rounded-lg bg-green-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
            >
              共有リンクを開く
            </a>
            <Link
              href="/areas"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              地域別ページを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h2 className="text-xl font-black text-gray-950">そのまま使える紹介文</h2>
        <div className="mt-4 grid gap-3">
          {shareCopies.map((copy) => (
            <article key={copy} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm leading-6 text-gray-700">{copy}</p>
              <p className="mt-3 text-xs font-bold text-green-700">https://moneyspot.money</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <h2 className="text-xl font-black text-gray-950">地域別に紹介する</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            旅行先や現在地に合わせて地域ページを共有すると、登録前の人にも価値が伝わりやすくなります。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700"
              >
                {area.nameJa}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <h2 className="text-xl font-black text-gray-950">登録をおすすめする理由</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-black text-gray-950">お気に入りを同期</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              気になる店舗を保存して、あとからすぐ確認できます。
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-black text-gray-950">レート通知</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              目標レートに近づいたときに、アプリ内で気づきやすくなります。
            </p>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-black text-gray-950">報告履歴</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              店頭で見たレート報告を保存し、データ改善に参加できます。
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
