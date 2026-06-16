"use client";

import { useEffect, useState } from "react";
import type { ExchangeShop, Currency } from "@/lib/database.types";
import { localeNames, type Locale } from "@/i18n/config";
import { getOpenStatus, formatRate, getTodayHours, isOpenNow } from "@/lib/utils";
import type { TFunction } from "@/i18n/useTranslation";
import type { AuthResult, UserProfile } from "@/hooks/useAuth";
import AuthFlow from "@/components/auth/AuthFlow";
import PremiumBanner from "@/components/premium/PremiumBanner";
import { COUNTRIES } from "@/lib/countries";
import CountrySelect from "@/components/common/CountrySelect";
import type { RateAlert, TriggeredRateAlert } from "@/lib/rate-alerts";

type Props = {
  shops: ExchangeShop[];
  currencies: Currency[];
  favorites: number[];
  viewedShopIds: number[];
  selectedCurrency: string;
  locale: Locale;
  t: TFunction;
  onClose: () => void;
  onShopSelect: (shopId: number) => void;
  onToggleFavorite: (shopId: number) => void;
  onCurrencyChange: (code: string) => void;
  onLocaleChange: (locale: Locale) => void;
  onClearHistory: () => void;
  rateAlerts: RateAlert[];
  triggeredRateAlerts: TriggeredRateAlert[];
  onSaveRateAlert: (currency: string, targetRate: number) => boolean;
  onToggleRateAlert: (id: string) => void;
  onRemoveRateAlert: (id: string) => void;
  isPremium?: boolean;
  initialAuthMode?: "register" | "login" | null;
  // Auth props
  isLoggedIn: boolean;
  profile: UserProfile | null;
  onSendOtp: (email: string) => Promise<AuthResult>;
  onVerifyOtp: (email: string, token: string, profile: Omit<UserProfile, "email">) => Promise<AuthResult>;
  onAuthSuccess?: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<AuthResult>;
  onSignOut: () => Promise<void>;
};

type LocalRateReport = {
  id?: string;
  shopName?: string;
  currency?: string;
  sellRate?: number | null;
  buyRate?: number | null;
  status?: string;
  createdAt?: string;
};

type ConfirmAction = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
};

export default function MyPage({
  shops,
  currencies,
  favorites,
  viewedShopIds,
  selectedCurrency,
  locale,
  t,
  onClose,
  onShopSelect,
  onToggleFavorite,
  onCurrencyChange,
  onLocaleChange,
  onClearHistory,
  rateAlerts,
  triggeredRateAlerts,
  onSaveRateAlert,
  onToggleRateAlert,
  onRemoveRateAlert,
  isPremium,
  initialAuthMode,
  isLoggedIn,
  profile,
  onSendOtp,
  onVerifyOtp,
  onAuthSuccess,
  onUpdateProfile,
  onSignOut,
}: Props) {
  const [showAuth, setShowAuth] = useState<"register" | "login" | null>(initialAuthMode ?? null);
  const [alertDraft, setAlertDraft] = useState<{ currency: string; value: string }>({
    currency: selectedCurrency,
    value: "",
  });
  const [alertError, setAlertError] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [rateReports] = useState<LocalRateReport[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("moneyspot_rate_reports");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const favoriteShops = shops.filter((s) => favorites.includes(s.id));
  const viewedShops = viewedShopIds
    .map((id) => shops.find((s) => s.id === id))
    .filter((s): s is ExchangeShop => s !== undefined)
    .slice(0, 10);

  const userCountry = COUNTRIES.find((c) => c.code === profile?.country);
  const selectedCurrencyObj = currencies.find((c) => c.code === selectedCurrency);
  const shopsWithSelectedRate = shops.filter((s) =>
    s.exchange_rates?.some((r) => r.currency_code === selectedCurrency && r.sell_rate)
  );
  const favoriteShopsOpenNow = favoriteShops.filter((s) => isOpenNow(s.shop_business_hours || [])).length;
  const bestFavoriteRate = favoriteShops
    .map((shop) => shop.exchange_rates?.find((r) => r.currency_code === selectedCurrency))
    .filter((rate): rate is NonNullable<typeof rate> => Boolean(rate?.sell_rate))
    .sort((a, b) => Number(a.sell_rate) - Number(b.sell_rate))[0];
  const profileFields = profile
    ? [profile.lastName, profile.firstName, profile.email, profile.phone, profile.country]
    : [];
  const profileCompletion = profileFields.length
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;
  const selectedRateAlert = rateAlerts.find((alert) => alert.currency === selectedCurrency);
  const alertTargetRate =
    alertDraft.currency === selectedCurrency
      ? alertDraft.value
      : selectedRateAlert?.targetRate
        ? String(selectedRateAlert.targetRate)
        : "";
  const handleSaveRateAlert = () => {
    const targetRate = Number(alertTargetRate);
    if (!onSaveRateAlert(selectedCurrency, targetRate)) {
      setAlertError(t("rateAlert.invalidTarget"));
      return;
    }
    setAlertError("");
    setAlertDraft({ currency: selectedCurrency, value: String(targetRate) });
  };
  const handleToggleRateAlert = () => {
    if (selectedRateAlert) {
      onToggleRateAlert(selectedRateAlert.id);
      return;
    }
    handleSaveRateAlert();
  };
  const runConfirmAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    await action.onConfirm();
  };

  useEffect(() => {
    if (!initialAuthMode) return;
    const timer = window.setTimeout(() => setShowAuth(initialAuthMode), 0);
    return () => window.clearTimeout(timer);
  }, [initialAuthMode]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = window.setTimeout(() => setShowAuth(null), 0);
    return () => window.clearTimeout(timer);
  }, [isLoggedIn]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onClose} className="text-blue-600 text-sm font-medium py-1 px-2 -ml-2 rounded-lg active:bg-blue-50">
          {t("common.back")}
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 leading-tight">{t("mypage.title")}</h1>
          <p className="text-[11px] text-gray-400">{t("mypage.overview")}</p>
        </div>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Account section */}
        <div className="bg-white mt-2">
          {isLoggedIn && profile ? (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">
                    {(profile.lastName || profile.firstName || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{profile.lastName} {profile.firstName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isPremium ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500"
                    }`}>
                      {isPremium ? t("premium.active") : t("mypage.freePlan")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                  {userCountry && (
                    <p className="text-xs text-gray-400">{userCountry.flag} {locale === "ja" ? userCountry.name_ja : userCountry.name_en}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">{t("mypage.profileCompletion")}</span>
                  <span className="font-bold text-blue-600">{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-8 10a8 8 0 1116 0H4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-3">{t("mypage.loginPrompt")}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowAuth("register")}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  {t("auth.register")}
                </button>
                <button
                  onClick={() => setShowAuth("login")}
                  className="bg-white text-blue-600 border border-blue-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  {t("auth.login")}
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-left">
                <p className="text-xs font-black text-green-800">{t("growth.title")}</p>
                <div className="mt-2 space-y-1 text-xs leading-5 text-green-700">
                  <p>{t("growth.benefitFavorites")}</p>
                  <p>{t("growth.benefitAlerts")}</p>
                  <p>{t("growth.benefitReports")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white mt-2 px-4 py-4">
          <SectionTitle title={t("mypage.summary")} />
          <div className="grid grid-cols-2 gap-2">
            <StatTile label={t("mypage.favoriteCount")} value={favoriteShops.length} />
            <StatTile label={t("mypage.openFavorites")} value={favoriteShopsOpenNow} />
            <StatTile label={t("mypage.historyCount")} value={viewedShops.length} />
            <StatTile
              label={t("mypage.ratedShopCount")}
              value={shopsWithSelectedRate.length}
              suffix={selectedCurrency}
            />
          </div>
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="text-xs text-blue-700 font-bold">{t("mypage.defaultCurrency")}</p>
            <p className="text-sm text-blue-900 mt-0.5">
              {selectedCurrencyObj?.flag_emoji} {selectedCurrency}
              {bestFavoriteRate?.sell_rate
                ? ` / ${t("mypage.bestFavoriteRate")}: ¥${formatRate(Number(bestFavoriteRate.sell_rate))}`
                : ` / ${t("mypage.noFavoriteRate")}`}
            </p>
          </div>
        </div>

        {/* Rate reports */}
        <div className="bg-white mt-2 px-4 py-4">
          <SectionTitle title={t("report.historyTitle")} />
          {rateReports.length === 0 ? (
            <p className="text-sm text-gray-400">{t("report.historyEmpty")}</p>
          ) : (
            <div className="space-y-2">
              {rateReports.map((report, index) => (
                <div
                  key={report.id ?? `${report.shopName}-${report.currency}-${index}`}
                  className="rounded-lg border border-gray-200 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{report.shopName ?? "-"}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {report.currency ?? "-"}
                        {report.sellRate ? ` / ${t("report.sellRate")}: ¥${formatRate(Number(report.sellRate))}` : ""}
                        {report.buyRate ? ` / ${t("report.buyRate")}: ¥${formatRate(Number(report.buyRate))}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-yellow-50 px-2 py-1 text-[10px] font-bold text-yellow-700">
                      {report.status === "approved" ? t("report.approved") : t("report.pendingReview")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate alerts */}
        <div className="bg-white mt-2 px-4 py-4">
          <SectionTitle title={t("mypage.rateAlert")} />
          {triggeredRateAlerts.length > 0 && (
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-xs font-bold text-green-700">
                {t("rateAlert.triggered", {
                  currency: triggeredRateAlerts[0].currency,
                  rate: triggeredRateAlerts[0].currentRate.toFixed(2),
                  shop: triggeredRateAlerts[0].shopName,
                })}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">{t("mypage.rateAlertTitle", { currency: selectedCurrency })}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("mypage.rateAlertDescription")}</p>
            </div>
            <button
              onClick={handleToggleRateAlert}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                selectedRateAlert?.active ? "bg-blue-600" : "bg-gray-200"
              }`}
              aria-pressed={Boolean(selectedRateAlert?.active)}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  selectedRateAlert?.active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">¥</span>
            <input
              type="text"
              inputMode="decimal"
              value={alertTargetRate}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) {
                  setAlertDraft({ currency: selectedCurrency, value: v });
                  setAlertError("");
                }
              }}
              placeholder={selectedCurrency === "USD" ? "150.00" : "100.00"}
              className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">/ {selectedCurrency}</span>
            <button
              onClick={handleSaveRateAlert}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              {t("rateAlert.save")}
            </button>
          </div>
          {alertError && <p className="text-[11px] text-red-500 mt-2">{alertError}</p>}
          <p className="text-[11px] text-gray-400 mt-2">
            {selectedRateAlert?.active ? t("mypage.rateAlertOn") : t("mypage.rateAlertOff")}
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-xs font-bold text-gray-700">{t("rateAlert.savedAlerts")}</p>
            {rateAlerts.length === 0 ? (
              <p className="text-xs text-gray-400">{t("rateAlert.noAlerts")}</p>
            ) : (
              rateAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-700">
                    <span className="font-bold">{alert.currency}</span>{" "}
                    {t("rateAlert.targetRate", { rate: alert.targetRate.toFixed(2) })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleRateAlert(alert.id)}
                      className="text-xs font-bold text-blue-600"
                    >
                      {alert.active ? t("rateAlert.active") : t("rateAlert.paused")}
                    </button>
                    <button
                      onClick={() => onRemoveRateAlert(alert.id)}
                      className="text-xs font-bold text-gray-400 hover:text-red-500"
                    >
                      {t("rateAlert.remove")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Favorites section */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <span className="text-red-500">♥</span> {t("mypage.favorites")}
              {favoriteShops.length > 0 && (
                <span className="text-xs text-gray-400 font-normal">({favoriteShops.length})</span>
              )}
            </h2>
          </div>
          {favoriteShops.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-400 text-sm">{t("mypage.favoritesEmpty")}</p>
              <p className="text-gray-300 text-xs mt-1">{t("mypage.favoritesHint")}</p>
            </div>
          ) : (
            <div>
              {favoriteShops.map((shop) => (
                <ShopRow
                  key={shop.id}
                  shop={shop}
                  selectedCurrency={selectedCurrency}
                  isFavorite={true}
                  t={t}
                  onSelect={() => { onShopSelect(shop.id); onClose(); }}
                  onToggleFavorite={() => onToggleFavorite(shop.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* History section */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">{t("mypage.history")}</h2>
            {viewedShops.length > 0 && (
              <button
                onClick={() => setConfirmAction({
                  title: t("mypage.clearHistory"),
                  message: t("mypage.clearHistoryConfirm"),
                  confirmLabel: t("mypage.clearHistory"),
                  danger: true,
                  onConfirm: onClearHistory,
                })}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                {t("mypage.clearHistory")}
              </button>
            )}
          </div>
          {viewedShops.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-400 text-sm">{t("mypage.historyEmpty")}</p>
            </div>
          ) : (
            <div>
              {viewedShops.map((shop) => (
                <ShopRow
                  key={shop.id}
                  shop={shop}
                  selectedCurrency={selectedCurrency}
                  isFavorite={favorites.includes(shop.id)}
                  t={t}
                  onSelect={() => { onShopSelect(shop.id); onClose(); }}
                  onToggleFavorite={() => onToggleFavorite(shop.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Premium upsell banner */}
        <PremiumBanner locale={locale} t={t} isPremium={isPremium} />

        {/* Settings section */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">{t("mypage.settings")}</h2>
          </div>

          {/* Account status */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
            <span className="text-sm text-gray-700">{t("mypage.accountStatus")}</span>
            <span className="text-sm font-bold text-gray-700">
              {isLoggedIn ? t("mypage.synced") : t("mypage.localOnly")}
            </span>
          </div>

          {/* Default currency */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
            <span className="text-sm text-gray-700">{t("mypage.defaultCurrency")}</span>
            <select
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="text-sm text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag_emoji} {c.code} - {locale === "ja" ? c.name_ja : c.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t("mypage.country")}</span>
              <div className="w-48">
                <CountrySelect
                  value={profile?.country || ""}
                  onChange={(code) => onUpdateProfile({ country: code })}
                  placeholder={t("auth.countrySelect")}
                  locale={locale as "ja" | "en"}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
            <span className="text-sm text-gray-700">{t("mypage.language")}</span>
            <select
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="text-sm text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          {/* Logout (only if logged in) */}
          {isLoggedIn && (
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
              <span className="text-sm text-gray-700">{t("auth.logout")}</span>
              <button
                onClick={() => setConfirmAction({
                  title: t("auth.logout"),
                  message: t("auth.logoutConfirm"),
                  confirmLabel: t("auth.logout"),
                  danger: true,
                  onConfirm: onSignOut,
                })}
                className="text-sm text-red-500 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50"
              >
                {t("auth.logout")}
              </button>
            </div>
          )}

          {/* Version */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">{t("mypage.version")}</span>
            <span className="text-sm text-gray-400">1.0.0</span>
          </div>
        </div>

        {/* Bottom back button */}
        <div className="bg-white mt-2 mb-8">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-blue-600 text-sm font-medium text-center active:bg-blue-50"
          >
            {t("common.back")}
          </button>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="px-4 py-4">
              <h2 className="text-base font-bold text-gray-900">{confirmAction.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{confirmAction.message}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={runConfirmAction}
                className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${
                  confirmAction.danger ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                {confirmAction.confirmLabel || t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth flow modal */}
      {showAuth && (
        <AuthFlow
          t={t}
          mode={showAuth}
          locale={locale}
          onSendOtp={onSendOtp}
          onVerifyOtp={onVerifyOtp}
          onSuccess={onAuthSuccess}
          onClose={() => setShowAuth(null)}
        />
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="font-bold text-gray-800 text-sm mb-3">{title}</h2>;
}

function StatTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
      <p className="text-xl font-black text-gray-900 mt-1">
        {value}
        {suffix && <span className="text-xs font-bold text-gray-400 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

// Compact shop row component for MyPage lists
function ShopRow({
  shop,
  selectedCurrency,
  isFavorite,
  t,
  onSelect,
  onToggleFavorite,
}: {
  shop: ExchangeShop;
  selectedCurrency: string;
  isFavorite: boolean;
  t: TFunction;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const openStatus = getOpenStatus(shop.shop_business_hours || []);
  const rate = shop.exchange_rates?.find((r) => r.currency_code === selectedCurrency);
  const todayHours = getTodayHours(shop.shop_business_hours || []);

  const statusClass =
    openStatus === "closing_soon"
      ? "text-orange-600"
      : openStatus === "open"
        ? "text-green-600"
        : "text-gray-400";

  const statusLabel =
    openStatus === "closing_soon"
      ? t("shop.closingSoon")
      : openStatus === "open"
        ? t("shop.open")
        : t("shop.closed");

  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50">
      <button onClick={onSelect} className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{shop.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium ${statusClass}`}>{statusLabel}</span>
              {todayHours && <span className="text-xs text-gray-400">{todayHours}</span>}
            </div>
          </div>
          {rate?.sell_rate && (
            <div className="text-right ml-3 flex-shrink-0">
              <p className="text-xs text-gray-500">{selectedCurrency}</p>
              <p className="text-sm font-bold text-blue-600">¥{formatRate(Number(rate.sell_rate))}</p>
            </div>
          )}
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="w-8 h-8 flex items-center justify-center ml-2 flex-shrink-0"
      >
        <span className={`text-base leading-none ${isFavorite ? "text-red-500" : "text-gray-300"}`}>
          {isFavorite ? "♥" : "♡"}
        </span>
      </button>
    </div>
  );
}
