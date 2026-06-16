import type { Metadata, Viewport } from "next";
import { Geist, Outfit } from "next/font/google";
import Script from "next/script";
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
const serviceWorkerScript =
  process.env.NODE_ENV === "production"
    ? `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    `
    : `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
          .then(() => {
            if ('caches' in window) {
              return caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
            }
          })
          .then(() => {
            if (navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
      }
    `;

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "MoneySpot - Find the Best Currency Exchange Rates Worldwide | 外貨両替レート比較",
    template: "%s | MoneySpot",
  },
  description:
    "Find the best currency exchange rates in 185+ cities and 80+ countries. Real-time rates, locations, and reviews. 世界中の両替所レートを比較。",
  keywords: [
    "currency exchange",
    "exchange rate comparison",
    "money exchange",
    "bureau de change",
    "best exchange rates",
    "currency converter",
    "Tokyo currency exchange",
    "London currency exchange",
    "Bangkok currency exchange",
    "Dubai currency exchange",
    "外貨両替",
    "両替所 レート比較",
    "海外旅行 両替",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ja: "/",
      zh: "/",
      ko: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "MoneySpot - Currency Exchange Rates Worldwide",
    description:
      "Find the best currency exchange shops in 185+ cities worldwide. Compare real-time rates and locations.",
    siteName: "MoneySpot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MoneySpot - Worldwide Currency Exchange Rate Comparison",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneySpot - Currency Exchange Rates Worldwide",
    description:
      "Find the best currency exchange shops in 185+ cities worldwide.",
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
  verification: {
    // One-time setup: visit https://search.google.com/search-console, add
    // moneyspot.money as a domain property, copy the HTML-tag verification
    // string here. Then redeploy. After that, Google auto-discovers the
    // sitemap via robots.txt.
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    // Bing verification (one-time): https://www.bing.com/webmasters
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Script id="service-worker-control" strategy="afterInteractive">
          {serviceWorkerScript}
        </Script>
      </body>
    </html>
  );
}
