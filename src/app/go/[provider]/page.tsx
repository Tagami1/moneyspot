import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "@/lib/affiliates";

type Props = { params: Promise<{ provider: string }> };

export function generateStaticParams() {
  return PROVIDER_IDS.map((p) => ({ provider: p }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provider } = await params;
  const config = PROVIDERS[provider as ProviderId];
  if (!config) return { robots: { index: false, follow: false } };
  return {
    title: `Redirecting to ${config.name}… | MoneySpot`,
    description: `${config.tagline}.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/go/${config.id}` },
  };
}

/**
 * Client-side affiliate redirect for static-export builds.
 *
 * - meta refresh sends the no-param fallback URL (works without JS).
 * - The inline script parses the actual query string at runtime and
 *   replaces location, so `?to=USD&utm_campaign=…` reaches the provider.
 */
export default async function GoPage({ params }: Props) {
  const { provider } = await params;
  const config = PROVIDERS[provider as ProviderId];
  if (!config) notFound();

  const fallbackUrl = config.buildUrl(new URLSearchParams());
  const buildFnSource = config.buildUrl.toString();

  const script = `
    (function() {
      try {
        var params = new URLSearchParams(window.location.search);
        var build = (${buildFnSource});
        var url = build(params);
        window.location.replace(url);
      } catch (e) {
        window.location.replace(${JSON.stringify(fallbackUrl)});
      }
    })();
  `;

  return (
    <>
      <meta httpEquiv="refresh" content={`1; url=${fallbackUrl}`} />
      <main style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <p style={{ color: "#555" }}>Redirecting to {config.name}…</p>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          If you are not redirected,{" "}
          <a href={fallbackUrl} style={{ color: "#2563eb" }}>
            click here
          </a>
          .
        </p>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </main>
    </>
  );
}
