import type { MetadataRoute } from "next";
import { areaPages } from "@/lib/areas";
import { CITY_LOCALES } from "@/lib/cities-i18n";
import { allPairs, pairSlug } from "@/lib/currencies-data";
import { guideSlug, guides } from "@/lib/guides";
import { jaGuideSlug, jaGuides } from "@/lib/guides-ja";
import { GUIDE_LOCALES, getLocGuides, locGuideSlug } from "@/lib/guides-loc";
import { mockCurrencies, mockShops } from "@/lib/mock-data";
import { getShopSlug } from "@/lib/shop-pages";
import { worldCities } from "@/lib/world-cities";

const SITE_URL = "https://moneyspot.money";

export const dynamic = "force-static";

const NON_EN_LOCALES = CITY_LOCALES.filter((l) => l !== "en");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/cities`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...NON_EN_LOCALES.map((l) => ({
      url: `${SITE_URL}/${l}/cities`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    { url: `${SITE_URL}/convert`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ja/convert`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE_URL}/ja/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/areas`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/share`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Currency converter pairs (high search volume) — en + ja
  const convertRoutes: MetadataRoute.Sitemap = allPairs().flatMap(({ from, to }) => {
    const priority = from === "USD" || to === "USD" || from === "EUR" || to === "JPY" ? 0.7 : 0.6;
    return [
      {
        url: `${SITE_URL}/convert/${pairSlug(from, to)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority,
      },
      {
        url: `${SITE_URL}/ja/convert/${pairSlug(from, to)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: priority - 0.05,
      },
    ];
  });

  // Country travel-money guides (en + ja)
  const guideRoutes: MetadataRoute.Sitemap = [
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${guideSlug(g)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...jaGuides.map((g) => ({
      url: `${SITE_URL}/ja/guides/${jaGuideSlug(g)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...GUIDE_LOCALES.flatMap((l) => [
      { url: `${SITE_URL}/${l}/guides`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.75 },
      ...getLocGuides(l).map((g) => ({
        url: `${SITE_URL}/${l}/guides/${locGuideSlug(g)}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  ];

  // Tokyo area pages (existing)
  const areaRoutes: MetadataRoute.Sitemap = areaPages.map((area) => ({
    url: `${SITE_URL}/areas/${area.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // Tokyo area × currency pages (existing)
  const areaCurrencyRoutes: MetadataRoute.Sitemap = areaPages.flatMap((area) =>
    mockCurrencies.map((currency) => ({
      url: `${SITE_URL}/areas/${area.slug}/${currency.code.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  // World city pages — English (canonical) and all locales (ja/zh/ko/es)
  const cityRoutes: MetadataRoute.Sitemap = worldCities
    .filter((c) => c.shop_count > 0)
    .flatMap((city) => {
      const priority = city.shop_count >= 100 ? 0.85 : city.shop_count >= 30 ? 0.75 : 0.65;
      return [
        {
          url: `${SITE_URL}/cities/${city.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority,
        },
        ...NON_EN_LOCALES.map((l) => ({
          url: `${SITE_URL}/${l}/cities/${city.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: priority - 0.05,
        })),
      ];
    });

  // Mock shop pages (existing — Tokyo only)
  const shopRoutes: MetadataRoute.Sitemap = mockShops.map((shop) => ({
    url: `${SITE_URL}/shops/${getShopSlug(shop)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...convertRoutes, ...guideRoutes, ...areaRoutes, ...cityRoutes, ...areaCurrencyRoutes, ...shopRoutes];
}
