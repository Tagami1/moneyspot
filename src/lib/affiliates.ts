/**
 * Affiliate redirect configuration.
 *
 * Each provider has a base URL and a builder that can incorporate query params
 * forwarded from `/go/[provider]?to=USD&utm_campaign=…`.
 *
 * IDs marked PLACEHOLDER below should be replaced when the corresponding
 * affiliate account is approved. The redirect itself works (sends users to
 * the provider) before approval — only commission tracking is off.
 */

export type ProviderId = "wise" | "booking" | "skyscanner" | "klook" | "getyourguide" | "tiqets";

export type ProviderConfig = {
  id: ProviderId;
  name: string;
  tagline: string;
  /** Build the final URL, given query params from the /go redirect. */
  buildUrl: (params: URLSearchParams) => string;
};

/**
 * Travelpayouts marker. PLACEHOLDER until田上's申請 is approved.
 * After approval, replace with the assigned numeric marker, e.g. "639543".
 */
const TRAVELPAYOUTS_MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || "PLACEHOLDER";

/**
 * Wise referral ID. PLACEHOLDER until田上 logs in to wise.com and obtains
 * the personal invite link from wise.com/invite/dic/<username>.
 */
const WISE_INVITE_ID = process.env.NEXT_PUBLIC_WISE_INVITE_ID || "";

/**
 * Klook affiliate ID. PLACEHOLDER until田上 signs up at affiliate.klook.com
 */
const KLOOK_AFFILIATE_ID = process.env.NEXT_PUBLIC_KLOOK_AFFILIATE_ID || "";

/**
 * Build a Travelpayouts redirect that wraps a destination URL.
 * Format: https://tp.media/r?marker=MARKER&u=ENCODED_URL&campaign_id=…
 */
function tp(destinationUrl: string, params: URLSearchParams, campaignId?: string): string {
  if (TRAVELPAYOUTS_MARKER === "PLACEHOLDER") {
    // Fallback: forward directly to destination without TP wrapping.
    // This keeps the user experience intact pre-approval.
    return destinationUrl;
  }
  const u = new URL("https://tp.media/r");
  u.searchParams.set("marker", TRAVELPAYOUTS_MARKER);
  u.searchParams.set("u", destinationUrl);
  if (campaignId) u.searchParams.set("campaign_id", campaignId);
  const utm = params.get("utm_campaign");
  if (utm) u.searchParams.set("sub_id", utm);
  return u.toString();
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  wise: {
    id: "wise",
    name: "Wise",
    tagline: "Send money abroad with the real mid-market rate",
    buildUrl: (params) => {
      const to = params.get("to")?.toUpperCase() || "USD";
      const utm = params.get("utm_campaign") || "moneyspot";

      if (WISE_INVITE_ID) {
        // Personal referral form: wise.com/invite/dic/<id>?utm_…
        const u = new URL(`https://wise.com/invite/dic/${WISE_INVITE_ID}`);
        u.searchParams.set("utm_source", "moneyspot");
        u.searchParams.set("utm_medium", "referral");
        u.searchParams.set("utm_campaign", utm);
        u.searchParams.set("target_currency", to);
        return u.toString();
      }

      // No referral configured yet — send to Wise's send-money flow.
      const u = new URL("https://wise.com/send");
      u.searchParams.set("utm_source", "moneyspot");
      u.searchParams.set("utm_medium", "affiliate");
      u.searchParams.set("utm_campaign", utm);
      u.searchParams.set("targetCurrency", to);
      return u.toString();
    },
  },

  booking: {
    id: "booking",
    name: "Booking.com",
    tagline: "Find a hotel where you're exchanging money",
    buildUrl: (params) => {
      const city = params.get("city") || "";
      const url = city
        ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&aid=moneyspot`
        : "https://www.booking.com/?aid=moneyspot";
      return tp(url, params, "booking");
    },
  },

  skyscanner: {
    id: "skyscanner",
    name: "Skyscanner",
    tagline: "Find flights to your destination",
    buildUrl: (params) => {
      const city = params.get("city") || "";
      const url = city
        ? `https://www.skyscanner.net/transport/flights-to/${encodeURIComponent(city)}/`
        : "https://www.skyscanner.net/";
      return tp(url, params, "skyscanner");
    },
  },

  klook: {
    id: "klook",
    name: "Klook",
    tagline: "Book tours & activities at your destination",
    buildUrl: (params) => {
      const city = params.get("city") || "";
      const url = city
        ? `https://www.klook.com/en-US/search/?keyword=${encodeURIComponent(city)}`
        : "https://www.klook.com/";
      if (KLOOK_AFFILIATE_ID) {
        const u = new URL(url);
        u.searchParams.set("aid", KLOOK_AFFILIATE_ID);
        return u.toString();
      }
      return tp(url, params, "klook");
    },
  },

  getyourguide: {
    id: "getyourguide",
    name: "GetYourGuide",
    tagline: "Book tickets & experiences",
    buildUrl: (params) => {
      const city = params.get("city") || "";
      const url = city
        ? `https://www.getyourguide.com/s/?q=${encodeURIComponent(city)}`
        : "https://www.getyourguide.com/";
      return tp(url, params, "gyg");
    },
  },

  tiqets: {
    id: "tiqets",
    name: "Tiqets",
    tagline: "Skip-the-line museum & attraction tickets",
    buildUrl: (params) => {
      const city = params.get("city") || "";
      const url = city
        ? `https://www.tiqets.com/en/search?q=${encodeURIComponent(city)}`
        : "https://www.tiqets.com/";
      return tp(url, params, "tiqets");
    },
  },
};

export const PROVIDER_IDS: ProviderId[] = Object.keys(PROVIDERS) as ProviderId[];
