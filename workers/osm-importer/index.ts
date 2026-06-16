/**
 * Cloudflare Worker: OSM Exchange Shop Importer
 *
 * Fetches currency exchange shops (bureau_de_change) from OpenStreetMap
 * via the Overpass API and upserts them into the Supabase exchange_shops table.
 *
 * Trigger modes:
 *   - POST request with { lat, lng, radius_m }  -> import for a single area
 *   - Cron trigger (every Monday 04:00 UTC)      -> import for ~20 major cities
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ENVIRONMENT: string;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface ExchangeShopRow {
  osm_id: number;
  name: string | null;
  name_en: string | null;
  address: string | null;
  address_en: string | null;
  lat: number;
  lng: number;
  source: string;
  country_code: string | null;
  shop_type: string;
  is_active: boolean;
  chain_id: null;
}

// ---------------------------------------------------------------------------
// Major cities for cron mode
// ---------------------------------------------------------------------------

const MAJOR_CITIES: { name: string; lat: number; lng: number; radius_m: number }[] = [
  { name: "Tokyo",         lat: 35.6812, lng: 139.7671, radius_m: 15000 },
  { name: "London",        lat: 51.5074, lng:  -0.1278, radius_m: 15000 },
  { name: "Paris",         lat: 48.8566, lng:   2.3522, radius_m: 15000 },
  { name: "Bangkok",       lat: 13.7563, lng: 100.5018, radius_m: 15000 },
  { name: "Singapore",     lat:  1.3521, lng: 103.8198, radius_m: 12000 },
  { name: "New York",      lat: 40.7128, lng: -74.0060, radius_m: 15000 },
  { name: "Dubai",         lat: 25.2048, lng:  55.2708, radius_m: 20000 },
  { name: "Seoul",         lat: 37.5665, lng: 126.9780, radius_m: 15000 },
  { name: "Hong Kong",     lat: 22.3193, lng: 114.1694, radius_m: 12000 },
  { name: "Sydney",        lat: -33.8688, lng: 151.2093, radius_m: 15000 },
  { name: "Berlin",        lat: 52.5200, lng:  13.4050, radius_m: 15000 },
  { name: "Rome",          lat: 41.9028, lng:  12.4964, radius_m: 12000 },
  { name: "Amsterdam",     lat: 52.3676, lng:   4.9041, radius_m: 10000 },
  { name: "Barcelona",     lat: 41.3874, lng:   2.1686, radius_m: 12000 },
  { name: "Istanbul",      lat: 41.0082, lng:  28.9784, radius_m: 20000 },
  { name: "Kuala Lumpur",  lat:  3.1390, lng: 101.6869, radius_m: 15000 },
  { name: "Taipei",        lat: 25.0330, lng: 121.5654, radius_m: 12000 },
  { name: "Prague",        lat: 50.0755, lng:  14.4378, radius_m: 10000 },
  { name: "Vienna",        lat: 48.2082, lng:  16.3738, radius_m: 12000 },
  { name: "Zurich",        lat: 47.3769, lng:   8.5417, radius_m: 10000 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pause execution for the given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Build an address string from OSM addr:* tags. */
function buildAddress(tags: Record<string, string> | undefined): string | null {
  if (!tags) return null;

  const parts: string[] = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:country"]) parts.push(tags["addr:country"]);

  return parts.length > 0 ? parts.join(", ") : null;
}

/** Build an English address string, falling back to default tags. */
function buildAddressEn(tags: Record<string, string> | undefined): string | null {
  if (!tags) return null;

  const parts: string[] = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street:en"] || tags["addr:street"]) {
    parts.push(tags["addr:street:en"] || tags["addr:street"]);
  }
  if (tags["addr:city:en"] || tags["addr:city"]) {
    parts.push(tags["addr:city:en"] || tags["addr:city"]);
  }
  if (tags["addr:country"]) parts.push(tags["addr:country"]);

  return parts.length > 0 ? parts.join(", ") : null;
}

/** Convert an Overpass element to a Supabase row object. */
function elementToRow(el: OverpassElement): ExchangeShopRow {
  const tags = el.tags ?? {};
  return {
    osm_id: el.id,
    name: tags["name"] ?? null,
    name_en: tags["name:en"] ?? tags["name"] ?? null,
    address: buildAddress(tags),
    address_en: buildAddressEn(tags),
    lat: el.lat,
    lng: el.lon,
    source: "osm",
    country_code: tags["addr:country"] ?? null,
    shop_type: "specialist",
    is_active: true,
    chain_id: null,
  };
}

// ---------------------------------------------------------------------------
// Overpass API
// ---------------------------------------------------------------------------

async function fetchFromOverpass(
  lat: number,
  lng: number,
  radius_m: number,
): Promise<OverpassElement[]> {
  const query = `[out:json][timeout:30];node["amenity"="bureau_de_change"](around:${radius_m},${lat},${lng});out;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Overpass API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as OverpassResponse;
  return json.elements ?? [];
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

/** Fetch existing osm_ids from Supabase so we can skip them. */
async function fetchExistingOsmIds(
  env: Env,
  osmIds: number[],
): Promise<Set<number>> {
  if (osmIds.length === 0) return new Set();

  // Query in batches of 100 to avoid URL length limits
  const existing = new Set<number>();
  const batchSize = 100;

  for (let i = 0; i < osmIds.length; i += batchSize) {
    const batch = osmIds.slice(i, i + batchSize);
    const filter = `osm_id.in.(${batch.join(",")})`;

    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/exchange_shops?select=osm_id&${new URLSearchParams({ osm_id: filter })}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
      },
    );

    if (res.ok) {
      const rows = (await res.json()) as { osm_id: number }[];
      for (const row of rows) {
        existing.add(row.osm_id);
      }
    }
  }

  return existing;
}

/** Upsert rows into Supabase exchange_shops (on conflict osm_id). */
async function upsertShops(env: Env, rows: ExchangeShopRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/exchange_shops`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert error ${res.status}: ${text.slice(0, 300)}`);
  }

  return rows.length;
}

// ---------------------------------------------------------------------------
// Core import logic
// ---------------------------------------------------------------------------

async function importArea(
  env: Env,
  lat: number,
  lng: number,
  radius_m: number,
  label: string,
): Promise<{ fetched: number; inserted: number; skipped: number }> {
  console.log(`[${label}] Fetching from Overpass (lat=${lat}, lng=${lng}, r=${radius_m}m)...`);

  const elements = await fetchFromOverpass(lat, lng, radius_m);
  console.log(`[${label}] Overpass returned ${elements.length} elements`);

  if (elements.length === 0) {
    return { fetched: 0, inserted: 0, skipped: 0 };
  }

  // Check which shops already exist
  const osmIds = elements.map((el) => el.id);
  const existingIds = await fetchExistingOsmIds(env, osmIds);

  // Filter out already-existing shops
  const newElements = elements.filter((el) => !existingIds.has(el.id));
  const skipped = elements.length - newElements.length;

  console.log(`[${label}] ${skipped} already exist, ${newElements.length} new`);

  // Convert & upsert
  const rows = newElements.map(elementToRow);
  const inserted = await upsertShops(env, rows);

  return { fetched: elements.length, inserted, skipped };
}

// ---------------------------------------------------------------------------
// Request handler (POST mode)
// ---------------------------------------------------------------------------

async function handlePostRequest(request: Request, env: Env): Promise<Response> {
  let body: { lat?: number; lng?: number; radius_m?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lat, lng, radius_m = 10000 } = body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return Response.json(
      { error: "lat and lng are required numbers" },
      { status: 400 },
    );
  }

  if (radius_m < 100 || radius_m > 50000) {
    return Response.json(
      { error: "radius_m must be between 100 and 50000" },
      { status: 400 },
    );
  }

  try {
    const result = await importArea(env, lat, lng, radius_m, "POST");
    return Response.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Import error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Cron handler
// ---------------------------------------------------------------------------

async function handleCron(env: Env): Promise<void> {
  console.log(`Starting cron import for ${MAJOR_CITIES.length} cities...`);

  const results: { city: string; fetched: number; inserted: number; skipped: number }[] = [];

  for (let i = 0; i < MAJOR_CITIES.length; i++) {
    const city = MAJOR_CITIES[i];

    try {
      const result = await importArea(env, city.lat, city.lng, city.radius_m, city.name);
      results.push({ city: city.name, ...result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${city.name}] Error: ${message}`);
      results.push({ city: city.name, fetched: 0, inserted: 0, skipped: 0 });
    }

    // Rate-limit: wait 2 seconds between Overpass requests
    if (i < MAJOR_CITIES.length - 1) {
      await sleep(2000);
    }
  }

  const totalFetched = results.reduce((s, r) => s + r.fetched, 0);
  const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);

  console.log(
    `Cron complete: ${totalFetched} fetched, ${totalInserted} inserted, ${totalSkipped} skipped`,
  );
  console.log("Per-city results:", JSON.stringify(results, null, 2));
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST") {
      return handlePostRequest(request, env);
    }

    if (request.method === "GET") {
      return Response.json({
        service: "moneyspot-osm-importer",
        status: "ok",
        cities: MAJOR_CITIES.length,
        usage: "POST { lat, lng, radius_m } to import a specific area",
      });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleCron(env));
  },
};

export default worker;
