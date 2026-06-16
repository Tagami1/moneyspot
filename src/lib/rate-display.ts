export const COMPARISON_JPY_AMOUNT = 10000;

export type RateType = "actual" | "reference" | "user_reported";
export type RateTrustLevel = "high" | "medium" | "low";

function getNumberLocale(locale: string): string {
  if (locale === "ja") return "ja-JP";
  if (locale === "en") return "en-US";
  return locale;
}

export function getRateTrustLabelKey(rateType?: RateType | null): string {
  if (rateType === "actual") return "shop.actualRate";
  if (rateType === "user_reported") return "shop.userReportedRate";
  return "shop.referenceEstimate";
}

export function getRateTrustNoteKey(rateType?: RateType | null): string {
  if (rateType === "actual") return "shop.actualRateNote";
  if (rateType === "user_reported") return "shop.userReportedRateNote";
  return "shop.referenceRateNoteShort";
}

export function getRateTrustScore(rateType?: RateType | null, fetchedAt?: string | null) {
  const baseScore =
    rateType === "actual" ? 92 :
    rateType === "user_reported" ? 74 :
    62;

  const fetchedTime = fetchedAt ? new Date(fetchedAt).getTime() : 0;
  const ageHours = fetchedTime > 0
    ? Math.max(0, (Date.now() - fetchedTime) / 3600000)
    : 999;
  const agePenalty =
    ageHours <= 6 ? 0 :
    ageHours <= 24 ? 8 :
    ageHours <= 72 ? 18 :
    32;
  const score = Math.max(25, Math.min(100, Math.round(baseScore - agePenalty)));
  const level: RateTrustLevel = score >= 80 ? "high" : score >= 55 ? "medium" : "low";
  const labelKey =
    level === "high" ? "shop.trustHigh" :
    level === "medium" ? "shop.trustMedium" :
    "shop.trustLow";

  return { score, level, labelKey };
}

export function getRateTrustScoreClasses(level: RateTrustLevel): string {
  if (level === "high") return "text-green-700";
  if (level === "medium") return "text-yellow-700";
  return "text-orange-700";
}

export function getRateTrustClasses(rateType?: RateType | null): string {
  if (rateType === "actual") return "bg-green-50 text-green-700 border-green-200";
  if (rateType === "user_reported") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

export function convertJpyToForeign(amountJpy: number, sellRate: number | string | null | undefined): number | null {
  const parsedRate = Number(sellRate);
  if (!Number.isFinite(parsedRate) || parsedRate <= 0) return null;
  return amountJpy / parsedRate;
}

export function formatJpyAmount(amount: number, locale: string): string {
  return amount.toLocaleString(getNumberLocale(locale));
}

export function formatForeignAmount(amount: number | null, currency: string, locale: string): string {
  if (amount === null || !Number.isFinite(amount)) return "-";
  const maximumFractionDigits = amount >= 1000 ? 0 : amount >= 100 ? 1 : 2;
  return `${amount.toLocaleString(getNumberLocale(locale), {
    maximumFractionDigits,
    minimumFractionDigits: amount >= 100 ? 0 : 2,
  })} ${currency}`;
}
