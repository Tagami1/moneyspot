#!/usr/bin/env node
/**
 * Build world-cities dataset by clustering Supabase exchange_shops to
 * curated city centroids. Run at build time:
 *   node scripts/build-world-cities.mjs
 *
 * Output: src/lib/world-cities.generated.json
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || (await readEnv("NEXT_PUBLIC_SUPABASE_URL"));
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (await readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));

async function readEnv(key) {
  const text = await fs.readFile(path.join(ROOT, ".env.local"), "utf8").catch(() => "");
  const m = text.split(/\r?\n/).find((l) => l.startsWith(key + "="));
  return m ? m.slice(key.length + 1).trim() : null;
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Curated world cities (lat/lng verified, slug = URL-safe lower-kebab)
// Chosen for: capital city + major financial/tourist hub + observed shop density
// ---------------------------------------------------------------------------
const CITIES = [
  // East Asia
  { slug: "tokyo",          name_en: "Tokyo",          country: "JP", lat: 35.6812, lng: 139.7671, r: 25 },
  { slug: "osaka",          name_en: "Osaka",          country: "JP", lat: 34.6937, lng: 135.5023, r: 20 },
  { slug: "kyoto",          name_en: "Kyoto",          country: "JP", lat: 35.0116, lng: 135.7681, r: 15 },
  { slug: "fukuoka",        name_en: "Fukuoka",        country: "JP", lat: 33.5904, lng: 130.4017, r: 15 },
  { slug: "sapporo",        name_en: "Sapporo",        country: "JP", lat: 43.0621, lng: 141.3544, r: 15 },
  { slug: "naha",           name_en: "Naha",           country: "JP", lat: 26.2124, lng: 127.6809, r: 15 },
  { slug: "seoul",          name_en: "Seoul",          country: "KR", lat: 37.5665, lng: 126.9780, r: 25 },
  { slug: "busan",          name_en: "Busan",          country: "KR", lat: 35.1796, lng: 129.0756, r: 15 },
  { slug: "beijing",        name_en: "Beijing",        country: "CN", lat: 39.9042, lng: 116.4074, r: 25 },
  { slug: "shanghai",       name_en: "Shanghai",       country: "CN", lat: 31.2304, lng: 121.4737, r: 25 },
  { slug: "guangzhou",      name_en: "Guangzhou",      country: "CN", lat: 23.1291, lng: 113.2644, r: 20 },
  { slug: "shenzhen",       name_en: "Shenzhen",       country: "CN", lat: 22.5431, lng: 114.0579, r: 20 },
  { slug: "hong-kong",      name_en: "Hong Kong",      country: "HK", lat: 22.3193, lng: 114.1694, r: 15 },
  { slug: "macau",          name_en: "Macau",          country: "MO", lat: 22.1987, lng: 113.5439, r: 10 },
  { slug: "taipei",         name_en: "Taipei",         country: "TW", lat: 25.0330, lng: 121.5654, r: 15 },
  { slug: "kaohsiung",      name_en: "Kaohsiung",      country: "TW", lat: 22.6273, lng: 120.3014, r: 12 },
  // Southeast Asia
  { slug: "bangkok",        name_en: "Bangkok",        country: "TH", lat: 13.7563, lng: 100.5018, r: 25 },
  { slug: "chiang-mai",     name_en: "Chiang Mai",     country: "TH", lat: 18.7883, lng:  98.9853, r: 15 },
  { slug: "phuket",         name_en: "Phuket",         country: "TH", lat:  7.8804, lng:  98.3923, r: 20 },
  { slug: "pattaya",        name_en: "Pattaya",        country: "TH", lat: 12.9236, lng: 100.8825, r: 15 },
  { slug: "krabi",          name_en: "Krabi",          country: "TH", lat:  8.0863, lng:  98.9063, r: 15 },
  { slug: "singapore",      name_en: "Singapore",      country: "SG", lat:  1.3521, lng: 103.8198, r: 20 },
  { slug: "kuala-lumpur",   name_en: "Kuala Lumpur",   country: "MY", lat:  3.1390, lng: 101.6869, r: 20 },
  { slug: "penang",         name_en: "Penang",         country: "MY", lat:  5.4141, lng: 100.3288, r: 15 },
  { slug: "johor-bahru",    name_en: "Johor Bahru",    country: "MY", lat:  1.4927, lng: 103.7414, r: 12 },
  { slug: "jakarta",        name_en: "Jakarta",        country: "ID", lat: -6.2088, lng: 106.8456, r: 25 },
  { slug: "bali",           name_en: "Bali (Denpasar)",country: "ID", lat: -8.6705, lng: 115.2126, r: 30 },
  { slug: "manila",         name_en: "Manila",         country: "PH", lat: 14.5995, lng: 120.9842, r: 25 },
  { slug: "cebu",           name_en: "Cebu",           country: "PH", lat: 10.3157, lng: 123.8854, r: 15 },
  { slug: "ho-chi-minh-city",name_en:"Ho Chi Minh City",country:"VN", lat: 10.8231, lng: 106.6297, r: 20 },
  { slug: "hanoi",          name_en: "Hanoi",          country: "VN", lat: 21.0285, lng: 105.8542, r: 15 },
  { slug: "da-nang",        name_en: "Da Nang",        country: "VN", lat: 16.0544, lng: 108.2022, r: 12 },
  { slug: "phnom-penh",     name_en: "Phnom Penh",     country: "KH", lat: 11.5564, lng: 104.9282, r: 15 },
  { slug: "siem-reap",      name_en: "Siem Reap",      country: "KH", lat: 13.3671, lng: 103.8448, r: 12 },
  { slug: "vientiane",      name_en: "Vientiane",      country: "LA", lat: 17.9757, lng: 102.6331, r: 12 },
  { slug: "yangon",         name_en: "Yangon",         country: "MM", lat: 16.8409, lng:  96.1735, r: 15 },
  // South Asia
  { slug: "mumbai",         name_en: "Mumbai",         country: "IN", lat: 19.0760, lng:  72.8777, r: 25 },
  { slug: "new-delhi",      name_en: "New Delhi",      country: "IN", lat: 28.6139, lng:  77.2090, r: 25 },
  { slug: "bangalore",      name_en: "Bangalore",      country: "IN", lat: 12.9716, lng:  77.5946, r: 20 },
  { slug: "kolkata",        name_en: "Kolkata",        country: "IN", lat: 22.5726, lng:  88.3639, r: 20 },
  { slug: "kathmandu",      name_en: "Kathmandu",      country: "NP", lat: 27.7172, lng:  85.3240, r: 15 },
  { slug: "pokhara",        name_en: "Pokhara",        country: "NP", lat: 28.2096, lng:  83.9856, r: 12 },
  { slug: "colombo",        name_en: "Colombo",        country: "LK", lat:  6.9271, lng:  79.8612, r: 15 },
  { slug: "male",           name_en: "Malé",           country: "MV", lat:  4.1755, lng:  73.5093, r: 10 },
  { slug: "dhaka",          name_en: "Dhaka",          country: "BD", lat: 23.8103, lng:  90.4125, r: 20 },
  { slug: "karachi",        name_en: "Karachi",        country: "PK", lat: 24.8607, lng:  67.0011, r: 25 },
  { slug: "lahore",         name_en: "Lahore",         country: "PK", lat: 31.5204, lng:  74.3587, r: 20 },
  // Middle East
  { slug: "dubai",          name_en: "Dubai",          country: "AE", lat: 25.2048, lng:  55.2708, r: 30 },
  { slug: "abu-dhabi",      name_en: "Abu Dhabi",      country: "AE", lat: 24.4539, lng:  54.3773, r: 20 },
  { slug: "sharjah",        name_en: "Sharjah",        country: "AE", lat: 25.3463, lng:  55.4209, r: 15 },
  { slug: "doha",           name_en: "Doha",           country: "QA", lat: 25.2854, lng:  51.5310, r: 20 },
  { slug: "muscat",         name_en: "Muscat",         country: "OM", lat: 23.5859, lng:  58.4059, r: 15 },
  { slug: "manama",         name_en: "Manama",         country: "BH", lat: 26.2235, lng:  50.5876, r: 12 },
  { slug: "kuwait-city",    name_en: "Kuwait City",    country: "KW", lat: 29.3759, lng:  47.9774, r: 15 },
  { slug: "riyadh",         name_en: "Riyadh",         country: "SA", lat: 24.7136, lng:  46.6753, r: 25 },
  { slug: "jeddah",         name_en: "Jeddah",         country: "SA", lat: 21.4858, lng:  39.1925, r: 20 },
  { slug: "amman",          name_en: "Amman",          country: "JO", lat: 31.9454, lng:  35.9284, r: 15 },
  { slug: "beirut",         name_en: "Beirut",         country: "LB", lat: 33.8938, lng:  35.5018, r: 12 },
  { slug: "istanbul",       name_en: "Istanbul",       country: "TR", lat: 41.0082, lng:  28.9784, r: 30 },
  { slug: "ankara",         name_en: "Ankara",         country: "TR", lat: 39.9334, lng:  32.8597, r: 15 },
  { slug: "antalya",        name_en: "Antalya",        country: "TR", lat: 36.8969, lng:  30.7133, r: 15 },
  { slug: "izmir",          name_en: "Izmir",          country: "TR", lat: 38.4192, lng:  27.1287, r: 15 },
  { slug: "tehran",         name_en: "Tehran",         country: "IR", lat: 35.6892, lng:  51.3890, r: 20 },
  { slug: "baghdad",        name_en: "Baghdad",        country: "IQ", lat: 33.3152, lng:  44.3661, r: 25 },
  { slug: "erbil",          name_en: "Erbil",          country: "IQ", lat: 36.1911, lng:  44.0096, r: 15 },
  { slug: "basra",          name_en: "Basra",          country: "IQ", lat: 30.5085, lng:  47.7804, r: 15 },
  // Caucasus / Central Asia
  { slug: "tbilisi",        name_en: "Tbilisi",        country: "GE", lat: 41.7151, lng:  44.8271, r: 15 },
  { slug: "batumi",         name_en: "Batumi",         country: "GE", lat: 41.6168, lng:  41.6367, r: 12 },
  { slug: "yerevan",        name_en: "Yerevan",        country: "AM", lat: 40.1872, lng:  44.5152, r: 15 },
  { slug: "baku",           name_en: "Baku",           country: "AZ", lat: 40.4093, lng:  49.8671, r: 15 },
  { slug: "almaty",         name_en: "Almaty",         country: "KZ", lat: 43.2220, lng:  76.8512, r: 20 },
  { slug: "tashkent",       name_en: "Tashkent",       country: "UZ", lat: 41.2995, lng:  69.2401, r: 15 },
  // Europe (West)
  { slug: "london",         name_en: "London",         country: "GB", lat: 51.5074, lng:  -0.1278, r: 25 },
  { slug: "edinburgh",      name_en: "Edinburgh",      country: "GB", lat: 55.9533, lng:  -3.1883, r: 12 },
  { slug: "manchester",     name_en: "Manchester",     country: "GB", lat: 53.4808, lng:  -2.2426, r: 12 },
  { slug: "paris",          name_en: "Paris",          country: "FR", lat: 48.8566, lng:   2.3522, r: 20 },
  { slug: "nice",           name_en: "Nice",           country: "FR", lat: 43.7102, lng:   7.2620, r: 12 },
  { slug: "lyon",           name_en: "Lyon",           country: "FR", lat: 45.7640, lng:   4.8357, r: 12 },
  { slug: "marseille",      name_en: "Marseille",      country: "FR", lat: 43.2965, lng:   5.3698, r: 12 },
  { slug: "amsterdam",      name_en: "Amsterdam",      country: "NL", lat: 52.3676, lng:   4.9041, r: 15 },
  { slug: "brussels",       name_en: "Brussels",       country: "BE", lat: 50.8503, lng:   4.3517, r: 12 },
  { slug: "luxembourg-city",name_en: "Luxembourg",     country: "LU", lat: 49.6116, lng:   6.1319, r: 10 },
  { slug: "berlin",         name_en: "Berlin",         country: "DE", lat: 52.5200, lng:  13.4050, r: 20 },
  { slug: "munich",         name_en: "Munich",         country: "DE", lat: 48.1351, lng:  11.5820, r: 15 },
  { slug: "frankfurt",      name_en: "Frankfurt",      country: "DE", lat: 50.1109, lng:   8.6821, r: 15 },
  { slug: "hamburg",        name_en: "Hamburg",        country: "DE", lat: 53.5511, lng:   9.9937, r: 15 },
  { slug: "cologne",        name_en: "Cologne",        country: "DE", lat: 50.9375, lng:   6.9603, r: 12 },
  { slug: "zurich",         name_en: "Zurich",         country: "CH", lat: 47.3769, lng:   8.5417, r: 12 },
  { slug: "geneva",         name_en: "Geneva",         country: "CH", lat: 46.2044, lng:   6.1432, r: 10 },
  { slug: "vienna",         name_en: "Vienna",         country: "AT", lat: 48.2082, lng:  16.3738, r: 15 },
  { slug: "salzburg",       name_en: "Salzburg",       country: "AT", lat: 47.8095, lng:  13.0550, r: 10 },
  { slug: "madrid",         name_en: "Madrid",         country: "ES", lat: 40.4168, lng:  -3.7038, r: 20 },
  { slug: "barcelona",      name_en: "Barcelona",      country: "ES", lat: 41.3851, lng:   2.1734, r: 15 },
  { slug: "seville",        name_en: "Seville",        country: "ES", lat: 37.3891, lng:  -5.9845, r: 10 },
  { slug: "valencia",       name_en: "Valencia",       country: "ES", lat: 39.4699, lng:  -0.3763, r: 12 },
  { slug: "lisbon",         name_en: "Lisbon",         country: "PT", lat: 38.7223, lng:  -9.1393, r: 15 },
  { slug: "porto",          name_en: "Porto",          country: "PT", lat: 41.1579, lng:  -8.6291, r: 12 },
  { slug: "rome",           name_en: "Rome",           country: "IT", lat: 41.9028, lng:  12.4964, r: 18 },
  { slug: "milan",          name_en: "Milan",          country: "IT", lat: 45.4642, lng:   9.1900, r: 15 },
  { slug: "venice",         name_en: "Venice",         country: "IT", lat: 45.4408, lng:  12.3155, r: 10 },
  { slug: "florence",       name_en: "Florence",       country: "IT", lat: 43.7696, lng:  11.2558, r: 10 },
  { slug: "naples",         name_en: "Naples",         country: "IT", lat: 40.8518, lng:  14.2681, r: 12 },
  { slug: "dublin",         name_en: "Dublin",         country: "IE", lat: 53.3498, lng:  -6.2603, r: 12 },
  { slug: "copenhagen",     name_en: "Copenhagen",     country: "DK", lat: 55.6761, lng:  12.5683, r: 12 },
  { slug: "stockholm",      name_en: "Stockholm",      country: "SE", lat: 59.3293, lng:  18.0686, r: 15 },
  { slug: "oslo",           name_en: "Oslo",           country: "NO", lat: 59.9139, lng:  10.7522, r: 12 },
  { slug: "helsinki",       name_en: "Helsinki",       country: "FI", lat: 60.1699, lng:  24.9384, r: 12 },
  { slug: "reykjavik",      name_en: "Reykjavik",      country: "IS", lat: 64.1466, lng: -21.9426, r: 10 },
  // Europe (Central/East)
  { slug: "prague",         name_en: "Prague",         country: "CZ", lat: 50.0755, lng:  14.4378, r: 15 },
  { slug: "budapest",       name_en: "Budapest",       country: "HU", lat: 47.4979, lng:  19.0402, r: 15 },
  { slug: "warsaw",         name_en: "Warsaw",         country: "PL", lat: 52.2297, lng:  21.0122, r: 18 },
  { slug: "krakow",         name_en: "Krakow",         country: "PL", lat: 50.0647, lng:  19.9450, r: 12 },
  { slug: "wroclaw",        name_en: "Wroclaw",        country: "PL", lat: 51.1079, lng:  17.0385, r: 12 },
  { slug: "gdansk",         name_en: "Gdansk",         country: "PL", lat: 54.3520, lng:  18.6466, r: 12 },
  { slug: "bratislava",     name_en: "Bratislava",     country: "SK", lat: 48.1486, lng:  17.1077, r: 12 },
  { slug: "ljubljana",      name_en: "Ljubljana",      country: "SI", lat: 46.0569, lng:  14.5058, r: 10 },
  { slug: "zagreb",         name_en: "Zagreb",         country: "HR", lat: 45.8150, lng:  15.9819, r: 12 },
  { slug: "belgrade",       name_en: "Belgrade",       country: "RS", lat: 44.7866, lng:  20.4489, r: 15 },
  { slug: "sofia",          name_en: "Sofia",          country: "BG", lat: 42.6977, lng:  23.3219, r: 12 },
  { slug: "bucharest",      name_en: "Bucharest",      country: "RO", lat: 44.4268, lng:  26.1025, r: 15 },
  { slug: "cluj-napoca",    name_en: "Cluj-Napoca",    country: "RO", lat: 46.7712, lng:  23.6236, r: 10 },
  { slug: "athens",         name_en: "Athens",         country: "GR", lat: 37.9838, lng:  23.7275, r: 15 },
  { slug: "tirana",         name_en: "Tirana",         country: "AL", lat: 41.3275, lng:  19.8187, r: 12 },
  { slug: "skopje",         name_en: "Skopje",         country: "MK", lat: 41.9981, lng:  21.4254, r: 10 },
  { slug: "chisinau",       name_en: "Chisinau",       country: "MD", lat: 47.0105, lng:  28.8638, r: 12 },
  { slug: "vilnius",        name_en: "Vilnius",        country: "LT", lat: 54.6872, lng:  25.2797, r: 10 },
  { slug: "riga",           name_en: "Riga",           country: "LV", lat: 56.9496, lng:  24.1052, r: 10 },
  { slug: "tallinn",        name_en: "Tallinn",        country: "EE", lat: 59.4370, lng:  24.7536, r: 10 },
  { slug: "kyiv",           name_en: "Kyiv",           country: "UA", lat: 50.4501, lng:  30.5234, r: 20 },
  { slug: "lviv",           name_en: "Lviv",           country: "UA", lat: 49.8397, lng:  24.0297, r: 12 },
  { slug: "kharkiv",        name_en: "Kharkiv",        country: "UA", lat: 49.9935, lng:  36.2304, r: 12 },
  { slug: "odesa",          name_en: "Odesa",          country: "UA", lat: 46.4825, lng:  30.7233, r: 12 },
  { slug: "minsk",          name_en: "Minsk",          country: "BY", lat: 53.9006, lng:  27.5590, r: 15 },
  { slug: "moscow",         name_en: "Moscow",         country: "RU", lat: 55.7558, lng:  37.6173, r: 25 },
  { slug: "saint-petersburg",name_en:"Saint Petersburg",country:"RU", lat: 59.9311, lng:  30.3609, r: 20 },
  // Americas
  { slug: "new-york",       name_en: "New York",       country: "US", lat: 40.7128, lng: -74.0060, r: 25 },
  { slug: "los-angeles",    name_en: "Los Angeles",    country: "US", lat: 34.0522, lng:-118.2437, r: 30 },
  { slug: "san-francisco",  name_en: "San Francisco",  country: "US", lat: 37.7749, lng:-122.4194, r: 15 },
  { slug: "chicago",        name_en: "Chicago",        country: "US", lat: 41.8781, lng: -87.6298, r: 20 },
  { slug: "miami",          name_en: "Miami",          country: "US", lat: 25.7617, lng: -80.1918, r: 20 },
  { slug: "las-vegas",      name_en: "Las Vegas",      country: "US", lat: 36.1699, lng:-115.1398, r: 15 },
  { slug: "washington-dc",  name_en: "Washington, D.C.",country:"US", lat: 38.9072, lng: -77.0369, r: 15 },
  { slug: "boston",         name_en: "Boston",         country: "US", lat: 42.3601, lng: -71.0589, r: 12 },
  { slug: "honolulu",       name_en: "Honolulu",       country: "US", lat: 21.3099, lng:-157.8581, r: 15 },
  { slug: "toronto",        name_en: "Toronto",        country: "CA", lat: 43.6532, lng: -79.3832, r: 20 },
  { slug: "vancouver",      name_en: "Vancouver",      country: "CA", lat: 49.2827, lng:-123.1207, r: 15 },
  { slug: "montreal",       name_en: "Montreal",       country: "CA", lat: 45.5017, lng: -73.5673, r: 15 },
  { slug: "mexico-city",    name_en: "Mexico City",    country: "MX", lat: 19.4326, lng: -99.1332, r: 25 },
  { slug: "cancun",         name_en: "Cancun",         country: "MX", lat: 21.1619, lng: -86.8515, r: 15 },
  { slug: "havana",         name_en: "Havana",         country: "CU", lat: 23.1136, lng: -82.3666, r: 15 },
  { slug: "santo-domingo",  name_en: "Santo Domingo",  country: "DO", lat: 18.4861, lng: -69.9312, r: 12 },
  { slug: "san-jose",       name_en: "San José",       country: "CR", lat:  9.9281, lng: -84.0907, r: 10 },
  { slug: "panama-city",    name_en: "Panama City",    country: "PA", lat:  8.9824, lng: -79.5199, r: 12 },
  { slug: "bogota",         name_en: "Bogotá",         country: "CO", lat:  4.7110, lng: -74.0721, r: 20 },
  { slug: "lima",           name_en: "Lima",           country: "PE", lat:-12.0464, lng: -77.0428, r: 20 },
  { slug: "cusco",          name_en: "Cusco",          country: "PE", lat:-13.5320, lng: -71.9675, r: 10 },
  { slug: "quito",          name_en: "Quito",          country: "EC", lat: -0.1807, lng: -78.4678, r: 15 },
  { slug: "santiago",       name_en: "Santiago",       country: "CL", lat:-33.4489, lng: -70.6693, r: 20 },
  { slug: "buenos-aires",   name_en: "Buenos Aires",   country: "AR", lat:-34.6037, lng: -58.3816, r: 20 },
  { slug: "montevideo",     name_en: "Montevideo",     country: "UY", lat:-34.9011, lng: -56.1645, r: 15 },
  { slug: "rio-de-janeiro", name_en: "Rio de Janeiro", country: "BR", lat:-22.9068, lng: -43.1729, r: 20 },
  { slug: "sao-paulo",      name_en: "São Paulo",      country: "BR", lat:-23.5505, lng: -46.6333, r: 25 },
  { slug: "brasilia",       name_en: "Brasília",       country: "BR", lat:-15.7975, lng: -47.8919, r: 15 },
  { slug: "salvador",       name_en: "Salvador",       country: "BR", lat:-12.9714, lng: -38.5014, r: 15 },
  { slug: "caracas",        name_en: "Caracas",        country: "VE", lat: 10.4806, lng: -66.9036, r: 15 },
  // Africa
  { slug: "cairo",          name_en: "Cairo",          country: "EG", lat: 30.0444, lng:  31.2357, r: 25 },
  { slug: "alexandria",     name_en: "Alexandria",     country: "EG", lat: 31.2001, lng:  29.9187, r: 12 },
  { slug: "casablanca",     name_en: "Casablanca",     country: "MA", lat: 33.5731, lng:  -7.5898, r: 15 },
  { slug: "marrakech",      name_en: "Marrakech",      country: "MA", lat: 31.6295, lng:  -7.9811, r: 12 },
  { slug: "rabat",          name_en: "Rabat",          country: "MA", lat: 34.0209, lng:  -6.8416, r: 12 },
  { slug: "fes",            name_en: "Fes",            country: "MA", lat: 34.0181, lng:  -5.0078, r: 12 },
  { slug: "tunis",          name_en: "Tunis",          country: "TN", lat: 36.8065, lng:  10.1815, r: 12 },
  { slug: "algiers",        name_en: "Algiers",        country: "DZ", lat: 36.7538, lng:   3.0588, r: 12 },
  { slug: "lagos",          name_en: "Lagos",          country: "NG", lat:  6.5244, lng:   3.3792, r: 20 },
  { slug: "abuja",          name_en: "Abuja",          country: "NG", lat:  9.0765, lng:   7.3986, r: 15 },
  { slug: "accra",          name_en: "Accra",          country: "GH", lat:  5.6037, lng:  -0.1870, r: 15 },
  { slug: "nairobi",        name_en: "Nairobi",        country: "KE", lat: -1.2921, lng:  36.8219, r: 20 },
  { slug: "kampala",        name_en: "Kampala",        country: "UG", lat:  0.3476, lng:  32.5825, r: 15 },
  { slug: "kigali",         name_en: "Kigali",         country: "RW", lat: -1.9579, lng:  30.1127, r: 12 },
  { slug: "dar-es-salaam",  name_en: "Dar es Salaam",  country: "TZ", lat: -6.7924, lng:  39.2083, r: 20 },
  { slug: "addis-ababa",    name_en: "Addis Ababa",    country: "ET", lat:  9.0320, lng:  38.7469, r: 15 },
  { slug: "johannesburg",   name_en: "Johannesburg",   country: "ZA", lat:-26.2041, lng:  28.0473, r: 20 },
  { slug: "cape-town",      name_en: "Cape Town",      country: "ZA", lat:-33.9249, lng:  18.4241, r: 20 },
  { slug: "douala",         name_en: "Douala",         country: "CM", lat:  4.0511, lng:   9.7679, r: 15 },
  { slug: "yaounde",        name_en: "Yaoundé",        country: "CM", lat:  3.8480, lng:  11.5021, r: 12 },
  // Oceania
  { slug: "sydney",         name_en: "Sydney",         country: "AU", lat:-33.8688, lng: 151.2093, r: 25 },
  { slug: "melbourne",      name_en: "Melbourne",      country: "AU", lat:-37.8136, lng: 144.9631, r: 20 },
  { slug: "brisbane",       name_en: "Brisbane",       country: "AU", lat:-27.4698, lng: 153.0251, r: 15 },
  { slug: "perth",          name_en: "Perth",          country: "AU", lat:-31.9505, lng: 115.8605, r: 15 },
  { slug: "auckland",       name_en: "Auckland",       country: "NZ", lat:-36.8485, lng: 174.7633, r: 15 },
  { slug: "wellington",     name_en: "Wellington",     country: "NZ", lat:-41.2865, lng: 174.7762, r: 12 },
];

// Haversine distance in km
function distKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchAll() {
  const all = [];
  let offset = 0;
  const batch = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/exchange_shops?select=id,name,name_en,address,address_en,lat,lng,country_code,source,is_active&limit=${batch}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data.length) break;
    all.push(...data);
    if (data.length < batch) break;
    offset += batch;
  }
  return all;
}

async function main() {
  console.log("Fetching all shops from Supabase...");
  const shops = await fetchAll();
  console.log(`Fetched ${shops.length} shops`);

  // Index cities by 1°-grid for fast neighbour lookup
  const grid = new Map();
  for (const c of CITIES) {
    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLng = -1; dLng <= 1; dLng++) {
        const key = `${Math.floor(c.lat) + dLat}:${Math.floor(c.lng) + dLng}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(c);
      }
    }
  }

  const cityShops = new Map(CITIES.map((c) => [c.slug, []]));
  let assigned = 0;
  for (const s of shops) {
    if (typeof s.lat !== "number" || typeof s.lng !== "number") continue;
    if (s.is_active === false) continue;
    const key = `${Math.floor(s.lat)}:${Math.floor(s.lng)}`;
    const candidates = grid.get(key) || [];
    let best = null;
    let bestD = Infinity;
    for (const c of candidates) {
      const d = distKm(s, c);
      if (d <= c.r && d < bestD) {
        best = c;
        bestD = d;
      }
    }
    if (best) {
      cityShops.get(best.slug).push({ ...s, distance_km: bestD });
      assigned++;
    }
  }
  console.log(`Assigned ${assigned} / ${shops.length} shops to ${CITIES.length} cities`);

  // Build output - include full shop details for top 50 per city
  const cities = CITIES.map((c) => {
    const list = cityShops.get(c.slug);
    return {
      ...c,
      shop_count: list.length,
      top_shops: list
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 50)
        .map((s) => ({
          id: s.id,
          name: s.name,
          name_en: s.name_en,
          address: s.address,
          address_en: s.address_en,
          lat: s.lat,
          lng: s.lng,
          source: s.source,
          distance_km: Number(s.distance_km.toFixed(2)),
        })),
    };
  }).sort((a, b) => b.shop_count - a.shop_count);

  const out = {
    generated_at: new Date().toISOString(),
    total_shops: shops.length,
    assigned_shops: assigned,
    cities,
  };

  const outPath = path.join(ROOT, "src/lib/world-cities.generated.json");
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);

  console.log("\nTop 30 cities by shop count:");
  for (const c of cities.slice(0, 30)) {
    console.log(`  ${c.slug.padEnd(20)} ${c.country} ${String(c.shop_count).padStart(5)}`);
  }
  console.log(`\nCities with 0 shops: ${cities.filter((c) => c.shop_count === 0).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
