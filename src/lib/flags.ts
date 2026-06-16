/**
 * Feature flags.
 *
 * Monetization (Wise affiliate, AdSense, promoted shops) stays OFF until the
 * product reaches 100 registered users. Flip `NEXT_PUBLIC_AFFILIATES_ENABLED`
 * to "true" in Vercel env vars when ready — no code change needed.
 *
 * Until then MoneySpot is a clean, free product focused on user value.
 */

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

/** Master switch for all affiliate / ad / promoted-shop monetization UI. */
export const AFFILIATES_ENABLED = envFlag(
  process.env.NEXT_PUBLIC_AFFILIATES_ENABLED,
  false
);

/** Show the Wise "send money online" affiliate CTAs. */
export const WISE_CTA_ENABLED = AFFILIATES_ENABLED;

/** Show AdSense / ad banners. */
export const ADS_ENABLED = AFFILIATES_ENABLED;

/** Show "promoted shop" badges & sort boosts. */
export const PROMOTED_SHOPS_ENABLED = AFFILIATES_ENABLED;
