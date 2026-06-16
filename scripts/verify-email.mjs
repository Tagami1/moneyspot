#!/usr/bin/env node
/**
 * After the DNS records are added at Namecheap, this:
 *   1. Triggers Resend domain verification.
 *   2. Polls until verified.
 *   3. Sends a real test OTP through Supabase to confirm end-to-end delivery.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node scripts/verify-email.mjs [test@email]
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DOMAIN_ID = "b183eb27-c2c8-4bd3-9627-e85db94d767c";
const SUPABASE_URL = "https://svqqfraiktfzchbwhemz.supabase.co";
const ANON_KEY = process.env.MONEYSPOT_ANON_KEY || "";
const TEST_EMAIL = process.argv[2];

async function j(res) {
  const t = await res.text();
  try { return JSON.parse(t); } catch { return { raw: t }; }
}

async function main() {
  if (!RESEND_API_KEY) { console.error("Set RESEND_API_KEY"); process.exit(1); }

  // Trigger verification
  await fetch(`https://api.resend.com/domains/${DOMAIN_ID}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  }).then(j);

  // Poll status
  let status = "pending";
  for (let i = 0; i < 20; i++) {
    const d = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}`, {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
    }).then(j);
    status = d.status;
    console.log(`[${i}] domain status: ${status}`);
    if (status === "verified") break;
    await new Promise((r) => setTimeout(r, 15000));
  }

  if (status !== "verified") {
    console.log("Not verified yet — DNS may still be propagating. Re-run later.");
    return;
  }
  console.log("Domain verified ✓");

  // Optional end-to-end OTP test
  if (TEST_EMAIL && ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, create_user: true }),
    });
    console.log(`OTP send to ${TEST_EMAIL}: HTTP ${res.status}`, (await res.text()).slice(0, 120));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
