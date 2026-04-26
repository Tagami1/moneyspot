import type { Locale } from "./config";

import jaMessages from "./messages/ja.json";
import enMessages from "./messages/en.json";
import zhMessages from "./messages/zh.json";
import koMessages from "./messages/ko.json";
import esMessages from "./messages/es.json";
import thMessages from "./messages/th.json";
import viMessages from "./messages/vi.json";
import idMessages from "./messages/id.json";

type Messages = Record<string, Record<string, string>>;

const allMessages: Record<Locale, Messages> = {
  ja: jaMessages as unknown as Messages,
  en: enMessages as unknown as Messages,
  zh: zhMessages as unknown as Messages,
  ko: koMessages as unknown as Messages,
  es: esMessages as unknown as Messages,
  th: thMessages as unknown as Messages,
  vi: viMessages as unknown as Messages,
  id: idMessages as unknown as Messages,
};

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function useTranslation(locale: Locale): { t: TFunction } {
  const messages = allMessages[locale] || allMessages.en;
  const fallback = allMessages.en;

  const t: TFunction = (key, params) => {
    let value = getNestedValue(messages, key) ?? getNestedValue(fallback, key) ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  };

  return { t };
}
