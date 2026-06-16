#!/usr/bin/env node
/**
 * Fetch USD-based mid-market rates and write src/lib/currency-rates.generated.json.
 * Run at build time (and weekly via auto-grow) so /convert pages have a fresh
 * baseline rate; the client also live-updates from the API.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CODES = [
  "USD","EUR","JPY","GBP","AUD","CAD","CHF","CNY","HKD","SGD","KRW","THB",
  "INR","IDR","MYR","PHP","VND","TWD","NZD","AED","TRY","MXN","BRL","ZAR",
];

async function main() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error(`rate API ${res.status}`);
  const data = await res.json();
  if (data.result !== "success") throw new Error("rate API not success");

  const all = data.rates || {};
  const rates = {};
  for (const c of CODES) {
    if (typeof all[c] === "number") rates[c] = all[c];
  }
  // sanity: USD must be 1
  rates.USD = 1;

  const out = {
    base: "USD",
    updated_utc: data.time_last_update_utc || null,
    rates, // value = how many <code> per 1 USD
  };
  const outPath = path.join(ROOT, "src/lib/currency-rates.generated.json");
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath} with ${Object.keys(rates).length} rates (updated ${out.updated_utc})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
