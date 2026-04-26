/**
 * 2点間の距離をkmで計算（ハバーサイン公式）
 */
export function calcDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * 現在営業中かどうかを判定
 */
export function isOpenNow(
  businessHours: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[]
): boolean {
  return getOpenStatus(businessHours) !== "closed";
}

/**
 * 営業状態を返す: "open" | "closing_soon" | "closed"
 * closing_soon = 営業中だが閉店まで60分以内
 */
export type OpenStatus = "open" | "closing_soon" | "closed";

export function getOpenStatus(
  businessHours: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[]
): OpenStatus {
  const now = new Date();
  const day = now.getDay();
  const hours = businessHours.find((h) => h.day_of_week === day);
  if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) return "closed";

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = hours.open_time.split(":").map(Number);
  const [closeH, closeM] = hours.close_time.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes < openMinutes || currentMinutes > closeMinutes) return "closed";
  if (closeMinutes - currentMinutes <= 60) return "closing_soon";
  return "open";
}

/**
 * 今日の営業時間テキストを返す（例: "10:00 - 19:00"）
 */
export function getTodayHours(
  businessHours: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[]
): string | null {
  const day = new Date().getDay();
  const hours = businessHours.find((h) => h.day_of_week === day);
  if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) return null;
  return `${hours.open_time.slice(0, 5)} - ${hours.close_time.slice(0, 5)}`;
}

/**
 * レートをフォーマット
 */
export function formatRate(rate: number | null): string {
  if (rate === null) return "-";
  return rate.toFixed(2);
}

/**
 * 相対時間を返す（例: "5分", "3時間", "1日"）
 * locale に応じて単位を切り替える
 */
export function formatTimeAgo(dateString: string, locale: string = "ja"): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return locale === "ja" ? "たった今" : "just now";

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === "ja") {
    if (diffMinutes < 1) return "たった今";
    if (diffMinutes < 60) return `${diffMinutes}分`;
    if (diffHours < 24) return `${diffHours}時間`;
    return `${diffDays}日`;
  }

  // English and other languages
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}
