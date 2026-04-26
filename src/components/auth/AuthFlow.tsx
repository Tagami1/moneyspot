"use client";

import { useState } from "react";
import type { TFunction } from "@/i18n/useTranslation";
import type { UserProfile } from "@/hooks/useAuth";
import { COUNTRIES, getPhoneCodeByCountry } from "@/lib/countries";
import CountrySelect from "@/components/common/CountrySelect";

type Props = {
  t: TFunction;
  mode: "register" | "login";
  onSendOtp: (email: string) => Promise<{ error: string | null }>;
  onVerifyOtp: (email: string, token: string, profile: Omit<UserProfile, "email">) => Promise<{ error: string | null }>;
  onClose: () => void;
};

export { COUNTRIES };

type Step = "form" | "verify";

export default function AuthFlow({ t, mode, onSendOtp, onVerifyOtp, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("JP");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const locale = t("common.appName") === "MoneySpot" ? "en" : "ja";
  const phoneCode = getPhoneCodeByCountry(phoneCountry);
  const isLogin = mode === "login";

  const handleSubmitForm = async () => {
    setError("");
    if (!isLogin) {
      if (!lastName.trim()) { setError(t("auth.errorLastName")); return; }
      if (!firstName.trim()) { setError(t("auth.errorFirstName")); return; }
    }
    if (!email.trim() || !email.includes("@")) { setError(t("auth.errorEmail")); return; }
    if (!isLogin) {
      if (!phoneNumber.trim()) { setError(t("auth.errorPhone")); return; }
      if (!country) { setError(t("auth.errorCountry")); return; }
    }

    setSending(true);
    const result = await onSendOtp(email.trim());
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setStep("verify");
    }
  };

  const handleVerify = async () => {
    setError("");
    if (!otpCode.trim() || otpCode.length < 6) {
      setError(t("auth.errorCode"));
      return;
    }

    const fullPhone = isLogin ? "" : `${phoneCode}${phoneNumber.replace(/^0+/, "")}`;

    setSending(true);
    const result = await onVerifyOtp(email.trim(), otpCode.trim(), {
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      phone: fullPhone,
      country,
    });
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
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
          {step === "form" ? (
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
                    locale={locale as "ja" | "en"}
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmitForm}
                disabled={sending}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {sending ? t("auth.sending") : isLogin ? t("auth.loginSend") : t("auth.sendCode")}
              </button>

              {/* Back button */}
              <button
                onClick={onClose}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                {t("common.back")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">{t("auth.codeSent")}</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{email}</p>
              </div>

              {/* OTP input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t("auth.codeLabel")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setOtpCode(v);
                  }}
                  placeholder="123456"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={sending || otpCode.length < 6}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {sending ? t("auth.verifying") : t("auth.verify")}
              </button>

              <button
                onClick={() => { setStep("form"); setOtpCode(""); setError(""); }}
                className="w-full text-gray-500 text-sm py-2 hover:text-gray-700"
              >
                {t("auth.backToForm")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
