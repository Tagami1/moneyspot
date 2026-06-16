import type { MetadataRoute } from "next";
import { areaPages } from "@/lib/areas";
import { mockCurrencies, mockShops } from "@/lib/mock-data";
import { getShopSlug } from "@/lib/shop-pages";
import { worldCities } from "@/lib/world-cities";

const SITE_URL = "https://moneyspot.money";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/cities`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ja/cities`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE_URL}/areas`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/share`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
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

  // World city pages — English (canonical) and Japanese
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
        {
          url: `${SITE_URL}/ja/cities/${city.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: priority - 0.05,
        },
      ];
    });

  // Mock shop pages (existing — Tokyo only)
  const shopRoutes: MetadataRoute.Sitemap = mockShops.map((shop) => ({
    url: `${SITE_URL}/shops/${getShopSlug(shop)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...areaRoutes, ...cityRoutes, ...areaCurrencyRoutes, ...shopRoutes];
}
