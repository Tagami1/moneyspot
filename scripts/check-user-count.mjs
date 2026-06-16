#!/usr/bin/env node
/**
 * MoneySpot user-count monitor.
 *
 * Calls the public `signup_count()` RPC (privacy-safe total) and, when the
 * count first crosses the AFFILIATE_THRESHOLD, drops a marker file and a
 * desktop notification so 田上 knows it's time to turn on monetization.
 *
 * Designed to run from launchd on the always-on Mac mini (daily).
 *   node scripts/check-user-count.mjs
 *
 * Threshold logic is idempotent: it only fires the "pitch" once, by writing
 * ~/.moneyspot-affiliate-ready once the count is >= threshold.
 */
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";

const SUPABASE_URL = "https://svqqfraiktfzchbwhemz.supabase.co";
// Public anon key (safe to embed — read-only, RLS-protected).
const ANON_KEY =
  process.env.MONEYSPOT_ANON_KEY ||
  "__SET_MONEYSPOT_ANON_KEY__";
const THRESHOLD = 100;
const MARKER = path.join(os.homedir(), ".moneyspot-affiliate-ready");
const LOG = path.join(os.homedir(), ".moneyspot-user-count.log");

async function getCount() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/signup_count`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(`signup_count RPC ${res.status}: ${(await res.text()).slice(0, 120)}`);
  }
  return Number(await res.json());
}

function notify(title, message) {
  // macOS desktop notification (best-effort).
  return new Promise((resolve) => {
    execFile(
      "osascript",
      ["-e", `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`],
      () => resolve()
    );
  });
}

async function main() {
  const stamp = new Date().toISOString();
  let count;
  try {
    count = await getCount();
  } catch (e) {
    await fs.appendFile(LOG, `${stamp}  ERROR  ${e.message}\n`).catch(() => {});
    console.error(e.message);
    process.exit(1);
  }

  await fs.appendFile(LOG, `${stamp}  count=${count}\n`).catch(() => {});
  console.log(`MoneySpot registered users: ${count} / ${THRESHOLD}`);

  const alreadyFired = await fs
    .access(MARKER)
    .then(() => true)
    .catch(() => false);

  if (count >= THRESHOLD && !alreadyFired) {
    const msg = `MoneySpot reached ${count} users — time to enable affiliates (Wise / Travelpayouts).`;
    await fs.writeFile(MARKER, `${stamp}\ncount=${count}\n`).catch(() => {});
    await notify("MoneySpot 🎉 100 users!", msg);
    console.log("PITCH:", msg);
  }
}

main();
