export const locales = ["ja", "en", "zh", "ko", "es", "th", "vi", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
  es: "Español",
  th: "ภาษาไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
};
