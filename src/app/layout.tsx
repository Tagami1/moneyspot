import type { Metadata, Viewport } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const SITE_URL = "https://moneyspot.money";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "MoneySpot - 東京の外貨両替レート比較 | Best Exchange Rates in Tokyo",
    template: "%s | MoneySpot",
  },
  description:
    "東京都内の両替所のリアルタイムレートを比較。最安レートの両替所が地図ですぐ見つかる。Compare real-time currency exchange rates at shops across Tokyo.",
  keywords: [
    "currency exchange",
    "Tokyo",
    "exchange rate",
    "両替",
    "外貨両替",
    "東京 両替 おすすめ",
    "exchange rate comparison",
    "money exchange Tokyo",
    "両替所 レート比較",
    "新宿 両替",
    "渋谷 両替",
    "上野 両替",
    "秋葉原 両替",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "ja": "/",
      "en": "/",
      "zh": "/",
      "ko": "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "MoneySpot - 東京の外貨両替レート比較",
    description:
      "東京都内の両替所のリアルタイムレートを比較。最安レートの両替所が地図ですぐ見つかる。",
    siteName: "MoneySpot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MoneySpot - Tokyo Currency Exchange Rate Comparison",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneySpot - 東京の外貨両替レート比較",
    description:
      "東京都内の両替所のリアルタイムレートを比較。最安レートが地図ですぐ見つかる。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoneySpot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5732642781898820"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
