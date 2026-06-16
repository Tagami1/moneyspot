"use client";

import { useState } from "react";
import type { TFunction } from "@/i18n/useTranslation";
import type { Locale } from "@/i18n/config";
import type { AuthResult, UserProfile } from "@/hooks/useAuth";
import { COUNTRIES, getPhoneCodeByCountry } from "@/lib/countries";
import CountrySelect from "@/components/common/CountrySelect";

type Props = {
  t: TFunction;
  mode: "register" | "login";
  locale: Locale;
  onSignUp: (email: string, password: string, profile: Omit<UserProfile, "email">) => Promise<AuthResult>;
  onSignIn: (email: string, password: string) => Promise<AuthResult>;
  onClose: () => void;
  onSuccess?: () => void;
};

export { COUNTRIES };

export default function AuthFlow({ t, mode, locale, onSignUp, onSignIn, onClose, onSuccess }: Props) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("JP");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const countrySelectLocale = locale === "ja" ? "ja" : "en";
  const phoneCode = getPhoneCodeByCountry(phoneCountry);
  const isLogin = mode === "login";

  const handleSubmitForm = async () => {
    setError("");
    if (!isLogin) {
      if (!lastName.trim()) { setError(t("auth.errorLastName")); return; }
      if (!firstName.trim()) { setError(t("auth.errorFirstName")); return; }
    }
    if (!email.trim() || !email.includes("@")) { setError(t("auth.errorEmail")); return; }
    if (!password.trim() || password.length < 6) { setError(t("auth.errorPassword")); return; }
    if (!isLogin) {
      if (!phoneNumber.trim()) { setError(t("auth.errorPhone")); return; }
      if (!country) { setError(t("auth.errorCountry")); return; }
    }

    setSending(true);
    const fullPhone = isLogin ? "" : `${phoneCode}${phoneNumber.replace(/^0+/, "")}`;
    const result = isLogin
      ? await onSignIn(email.trim(), password)
      : await onSignUp(email.trim(), password, {
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          phone: fullPhone,
          country,
        });
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
      onClose();
    }
  };

  const title = isLogin ? t("auth.login") : t("auth.title");
  const subtitle = isLogin ? t("auth.loginSubtitle") : t("auth.subtitle");

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">{title}</h2>
          </div>
          <p className="text-blue-100 text-xs mt-1">{subtitle}</p>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {(
            <div className="space-y-4">
              {/* Registration fields (name, phone, country) */}
              {!isLogin && (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.lastName")}</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t("auth.lastNamePlaceholder")}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.firstName")}</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t("auth.firstNamePlaceholder")}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Phone (registration only) */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    {t("auth.phone")}
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={phoneCountry}
                      onChange={(e) => setPhoneCountry(e.target.value)}
                      className="w-[110px] px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex-shrink-0"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.phone}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={locale === "ja" ? "90-1234-5678" : "123-456-7890"}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Country (registration only) */}
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.country")}</label>
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    placeholder={t("auth.countrySelect")}
                    locale={countrySelectLocale}
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmitForm}
                disabled={sending}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {sending ? t("auth.sending") : isLogin ? t("auth.loginSend") : t("auth.createAccount")}
              </button>

              {/* Back button */}
              <button
                onClick={onClose}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                {t("common.back")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
