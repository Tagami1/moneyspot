import data from "./currency-rates.generated.json";

type RatesPayload = {
  base: string;
  updated_utc: string | null;
  rates: Record<string, number>;
};

export const ratesData = data as RatesPayload;

/** Build-time rate: how many `to` for 1 `from` (USD-based cross rate). */
export function crossRate(from: string, to: string): number | null {
  const r = ratesData.rates;
  const f = r[from.toUpperCase()];
  const t = r[to.toUpperCase()];
  if (!f || !t) return null;
  return t / f;
}

export function formatAmount(value: number, code: string): string {
  // No-decimal currencies
  const zeroDecimal = ["JPY", "KRW", "VND", "IDR", "CLP", "HUF"];
  const max = zeroDecimal.includes(code.toUpperCase()) ? 0 : value >= 100 ? 2 : 4;
  return value.toLocaleString("en-US", { maximumFractionDigits: max, minimumFractionDigits: 0 });
}
