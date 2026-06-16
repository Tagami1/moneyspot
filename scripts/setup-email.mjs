#!/usr/bin/env node
/**
 * One-shot email setup for MoneySpot.
 *
 * Given a Supabase Personal Access Token and a Resend API key, this:
 *   1. Registers moneyspot.money as a Resend sending domain and prints the
 *      DNS (SPF/DKIM/DMARC) records to add at Namecheap.
 *   2. Configures Supabase Auth SMTP to relay through Resend.
 *   3. Applies the 014_signups_tracking.sql migration via the Management API.
 *
 * Usage:
 *   SUPABASE_PAT=sbp_xxx RESEND_API_KEY=re_xxx node scripts/setup-email.mjs
 *
 * Safe to re-run: domain creation is idempotent (reuses existing), SMTP config
 * is a PATCH, and the SQL uses IF NOT EXISTS / OR REPLACE.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PROJECT_REF = "svqqfraiktfzchbwhemz";
const DOMAIN = "moneyspot.money";
const FROM_ADDRESS = "MoneySpot <no-reply@moneyspot.money>";
const SUPABASE_PAT = process.env.SUPABASE_PAT;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_PAT || !RESEND_API_KEY) {
  console.error("Set SUPABASE_PAT and RESEND_API_KEY env vars.");
  process.exit(1);
}

async function j(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ---------------------------------------------------------------------------
// 1. Resend domain
// ---------------------------------------------------------------------------
async function setupResendDomain() {
  // List existing domains
  const list = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  }).then(j);

  let domain = (list.data || []).find((d) => d.name === DOMAIN);

  if (!domain) {
    console.log(`Creating Resend domain ${DOMAIN}…`);
    const created = await fetch("https://api.resend.com/domains", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: DOMAIN, region: "us-east-1" }),
    }).then(j);
    domain = created;
  } else {
    console.log(`Resend domain ${DOMAIN} already exists (id=${domain.id}).`);
    // fetch detail for records
    domain = await fetch(`https://api.resend.com/domains/${domain.id}`, {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
    }).then(j);
  }

  const records = domain.records || [];
  console.log("\n=== DNS records to add at Namecheap (moneyspot.money) ===");
  for (const r of records) {
    console.log(
      `  ${r.type.padEnd(5)} name=${(r.name || "@").padEnd(40)} value=${r.value}${r.priority ? ` priority=${r.priority}` : ""}`
    );
  }
  console.log(
    "\nAdd these in Namecheap → Advanced DNS, then run: node scripts/verify-email.mjs\n"
  );

  // Save records for later reference / DNS automation
  await fs.writeFile(
    path.join(ROOT, "scripts/.resend-dns.json"),
    JSON.stringify({ domainId: domain.id, records }, null, 2)
  );

  return domain;
}

// ---------------------------------------------------------------------------
// 2. Supabase SMTP config (Management API)
// ---------------------------------------------------------------------------
async function configureSupabaseSmtp() {
  console.log("Configuring Supabase Auth SMTP → Resend…");
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_email_enabled: true,
        mailer_autoconfirm: false,
        smtp_admin_email: "no-reply@moneyspot.money",
        smtp_host: "smtp.resend.com",
        smtp_port: 465,
        smtp_user: "resend",
        smtp_pass: RESEND_API_KEY,
        smtp_sender_name: "MoneySpot",
        // Generous-but-safe rate while small
        rate_limit_email_sent: 30,
      }),
    }
  );
  const out = await j(res);
  if (!res.ok) {
    console.error("SMTP config failed:", res.status, JSON.stringify(out).slice(0, 300));
    return false;
  }
  console.log("SMTP configured ✓");
  return true;
}

// ---------------------------------------------------------------------------
// 3. Apply signups SQL (Management API)
// ---------------------------------------------------------------------------
async function applySql() {
  console.log("Applying 014_signups_tracking.sql…");
  const sql = await fs.readFile(
    path.join(ROOT, "supabase/migrations/014_signups_tracking.sql"),
    "utf8"
  );
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const out = await j(res);
  if (!res.ok) {
    console.error("SQL apply failed:", res.status, JSON.stringify(out).slice(0, 300));
    return false;
  }
  console.log("signups table + signup_count() RPC created ✓");
  return true;
}

async function main() {
  await setupResendDomain();
  await configureSupabaseSmtp();
  await applySql();
  console.log(
    "\nNext: add the DNS records at Namecheap, wait for propagation, then test a signup."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
