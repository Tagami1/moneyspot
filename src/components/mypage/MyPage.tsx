"use client";

import { useState } from "react";
import type { ExchangeShop, Currency } from "@/lib/database.types";
import { localeNames, type Locale } from "@/i18n/config";
import { getOpenStatus, formatRate, getTodayHours } from "@/lib/utils";
import type { TFunction } from "@/i18n/useTranslation";
import type { UserProfile } from "@/hooks/useAuth";
import AuthFlow from "@/components/auth/AuthFlow";
import PremiumBanner from "@/components/premium/PremiumBanner";
import { COUNTRIES } from "@/lib/countries";
import CountrySelect from "@/components/common/CountrySelect";

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
  // Auth props
  isLoggedIn: boolean;
  profile: UserProfile | null;
  onSendOtp: (email: string) => Promise<{ error: string | null }>;
  onVerifyOtp: (email: string, token: string, profile: Omit<UserProfile, "email">) => Promise<{ error: string | null }>;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  onSignOut: () => Promise<void>;
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
  isLoggedIn,
  profile,
  onSendOtp,
  onVerifyOtp,
  onUpdateProfile,
  onSignOut,
}: Props) {
  const [showAuth, setShowAuth] = useState<"register" | "login" | null>(null);
  const favoriteShops = shops.filter((s) => favorites.includes(s.id));
  const viewedShops = viewedShopIds
    .map((id) => shops.find((s) => s.id === id))
    .filter((s): s is ExchangeShop => s !== undefined)
    .slice(0, 10);

  const userCountry = COUNTRIES.find((c) => c.code === profile?.country);

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onClose} className="text-blue-600 text-sm font-medium py-1 px-2 -ml-2 rounded-lg active:bg-blue-50">
          {t("common.back")}
        </button>
        <h1 className="font-bold text-gray-900">{t("mypage.title")}</h1>
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
                  <p className="font-bold text-gray-900 truncate">{profile.lastName} {profile.firstName}</p>
                  <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                  {userCountry && (
                    <p className="text-xs text-gray-400">{userCountry.flag} {locale === "ja" ? userCountry.name_ja : userCountry.name_en}</p>
                  )}
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
            </div>
          )}
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
                onClick={() => {
                  if (confirm(t("mypage.clearHistoryConfirm"))) onClearHistory();
                }}
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
        <PremiumBanner locale={locale} t={t} />

        {/* Settings section */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">{t("mypage.settings")}</h2>
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
                onClick={() => {
                  if (confirm(t("auth.logoutConfirm"))) onSignOut();
                }}
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

      {/* Auth flow modal */}
      {showAuth && (
        <AuthFlow
          t={t}
          mode={showAuth}
          onSendOtp={onSendOtp}
          onVerifyOtp={onVerifyOtp}
          onClose={() => setShowAuth(null)}
        />
      )}
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
