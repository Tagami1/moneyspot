#!/usr/bin/env node
/**
 * Submit the sitemap's URLs to IndexNow (Bing / Yandex / Seznam etc.).
 * IndexNow accepts batch URL pings without OAuth — only the key file
 * at /<key>.txt needs to be reachable on the host.
 *
 * Run:  node scripts/submit-indexnow.mjs
 */
const KEY = "7b5f2cbedb884086f2be80a321139467";
const HOST = "moneyspot.money";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function fetchSitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

async function submitBatch(urls) {
  // IndexNow caps each request at 10,000 URLs.
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`IndexNow ${res.status}: ${text.slice(0, 200)}`);
  return res.ok;
}

async function main() {
  // Verify the key file is live first.
  const keyRes = await fetch(KEY_LOCATION);
  if (!keyRes.ok) {
    console.error(`Key file not reachable at ${KEY_LOCATION} (${keyRes.status}). Deploy first.`);
    process.exit(1);
  }
  console.log(`Key file OK: ${KEY_LOCATION}`);

  const urls = await fetchSitemapUrls();
  console.log(`Fetched ${urls.length} URLs from sitemap`);

  // Batch by 10k (IndexNow per-request cap)
  for (let i = 0; i < urls.length; i += 10000) {
    const batch = urls.slice(i, i + 10000);
    console.log(`Submitting batch ${i}-${i + batch.length}…`);
    await submitBatch(batch);
  }
  console.log("Done. Bing / Yandex / Seznam should crawl within hours.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
