"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

// User profile stored in Supabase Auth user_metadata
export type UserProfile = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  country: string;
};

export type AuthResult = {
  error: string | null;
  localTestCode?: string;
};

// Check if we have a real Supabase connection
const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
const LOCAL_AUTH_TEST_CODE = "000000";
const LOCAL_AUTH_FALLBACK_EMAIL_KEY = "moneyspot_local_auth_fallback_email";

function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function isLocalAuthEmail(email: string) {
  if (!isLocalDevHost()) return false;
  try {
    return localStorage.getItem(LOCAL_AUTH_FALLBACK_EMAIL_KEY) === email;
  } catch {
    return false;
  }
}

function shouldUseLocalAuthFallback(error: unknown) {
  if (!isLocalDevHost()) return false;
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();
  return (
    normalized.includes("error sending confirmation email") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network")
  );
}

function makeLocalUser(email: string, profile: Omit<UserProfile, "email">) {
  const fullProfile: UserProfile = { ...profile, email };
  try { localStorage.setItem("moneyspot_user_profile", JSON.stringify(fullProfile)); } catch {}
  return {
    id: "local-dev",
    email,
    is_anonymous: false,
    user_metadata: { ...fullProfile, localAuthFallback: true },
  } as unknown as User;
}

function isLocalAuthUser(user: User | null) {
  return user?.id === "local-dev" || Boolean(user?.user_metadata?.localAuthFallback);
}

function getAuthErrorMessage(error: unknown) {
  const message = typeof error === "string" ? error : error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();
  if (normalized.includes("error sending confirmation email")) {
    return "認証メールを送信できませんでした。時間をおいて再度お試しください。";
  }
  if (normalized.includes("failed to fetch") || normalized.includes("network")) {
    return "通信に失敗しました。ネットワーク接続を確認して再度お試しください。";
  }
  return message || "認証処理に失敗しました。時間をおいて再度お試しください。";
}

function getLocalStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  if (HAS_SUPABASE && !isLocalDevHost()) return null;
  try {
    const stored = localStorage.getItem("moneyspot_user_profile");
    if (!stored) return null;
    const profile = JSON.parse(stored) as UserProfile;
    if (!profile.email) return null;
    return {
      id: "local-dev",
      email: profile.email,
      is_anonymous: false,
      user_metadata: { ...profile, localAuthFallback: true },
    } as unknown as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize: check current session
  useEffect(() => {
    const localUser = getLocalStoredUser();
    if (localUser) {
      const timer = window.setTimeout(() => {
        setUser(localUser);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (!HAS_SUPABASE) {
      const timer = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timer);
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (data.session?.user) {
            setUser(data.session.user);
          } else {
            // 匿名認証: ログインしていないユーザーにもIDを付与
            const { data: anonData } = await supabase.auth.signInAnonymously();
            if (anonData?.user && mounted) {
              setUser(anonData.user);
            }
          }
          setLoading(false);
        }

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) setUser(session?.user ?? null);
        });
        unsubscribe = () => listener.subscription.unsubscribe();
      } catch {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  // Send OTP to email
  const sendOtp = useCallback(async (email: string): Promise<AuthResult> => {
    if (!HAS_SUPABASE) {
      return { error: null, localTestCode: LOCAL_AUTH_TEST_CODE }; // Mock: always succeed
    }
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error && shouldUseLocalAuthFallback(error.message)) {
        try { localStorage.setItem(LOCAL_AUTH_FALLBACK_EMAIL_KEY, email); } catch {}
        return { error: null, localTestCode: LOCAL_AUTH_TEST_CODE };
      }
      return { error: error ? getAuthErrorMessage(error.message) : null };
    } catch (error) {
      if (shouldUseLocalAuthFallback(error)) {
        try { localStorage.setItem(LOCAL_AUTH_FALLBACK_EMAIL_KEY, email); } catch {}
        return { error: null, localTestCode: LOCAL_AUTH_TEST_CODE };
      }
      return { error: getAuthErrorMessage(error) };
    }
  }, []);

  // Verify OTP and set profile
  const verifyOtp = useCallback(async (
    email: string,
    token: string,
    profile: Omit<UserProfile, "email">
  ): Promise<AuthResult> => {
    if (!HAS_SUPABASE || isLocalAuthEmail(email)) {
      if (HAS_SUPABASE && token !== LOCAL_AUTH_TEST_CODE) {
        return { error: "認証コードが違います。" };
      }
      // Mock mode: store in localStorage
      setUser(makeLocalUser(email, profile));
      try { localStorage.removeItem(LOCAL_AUTH_FALLBACK_EMAIL_KEY); } catch {}
      return { error: null };
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) return { error: getAuthErrorMessage(error.message) };

      // Update user metadata with profile info
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { lastName: profile.lastName, firstName: profile.firstName, phone: profile.phone, country: profile.country },
      });
      if (updateError) return { error: getAuthErrorMessage(updateError.message) };

      const verifiedUser = (updateData.user ?? data.user) as User | null;
      if (verifiedUser) setUser(verifiedUser);

      // Record the signup for the 100-user monitor (idempotent upsert).
      // Silently ignores errors so registration never fails on analytics.
      if (verifiedUser?.id) {
        try {
          await (supabase.from("signups" as never) as ReturnType<typeof supabase.from>).upsert(
            {
              user_id: verifiedUser.id,
              country: profile.country || null,
              locale:
                typeof navigator !== "undefined"
                  ? navigator.language.slice(0, 2)
                  : null,
            } as never,
            { onConflict: "user_id", ignoreDuplicates: true }
          );
        } catch {
          /* table may not exist yet — ignore */
        }
      }
      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    }
  }, []);

  // Record a signup row for the 100-user monitor (idempotent, best-effort).
  const recordSignup = useCallback(async (u: User, country: string) => {
    if (!u?.id) return;
    try {
      const { supabase } = await import("@/lib/supabase");
      await (supabase.from("signups" as never) as ReturnType<typeof supabase.from>).upsert(
        {
          user_id: u.id,
          country: country || null,
          locale: typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : null,
        } as never,
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    } catch {
      /* table may not exist yet — ignore */
    }
  }, []);

  // Register with email + password (instant, no confirmation email needed).
  const signUpWithPassword = useCallback(async (
    email: string,
    password: string,
    profile: Omit<UserProfile, "email">
  ): Promise<AuthResult> => {
    if (!HAS_SUPABASE) {
      setUser(makeLocalUser(email, profile));
      return { error: null };
    }
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            lastName: profile.lastName,
            firstName: profile.firstName,
            phone: profile.phone,
            country: profile.country,
          },
        },
      });
      if (error) return { error: getAuthErrorMessage(error.message) };
      const newUser = data.user as User | null;
      if (newUser) {
        setUser(newUser);
        await recordSignup(newUser, profile.country);
      }
      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    }
  }, [recordSignup]);

  // Log in with email + password.
  const signInWithPassword = useCallback(async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    if (!HAS_SUPABASE) {
      const stored = getLocalStoredUser();
      if (stored) { setUser(stored); return { error: null }; }
      return { error: "アカウントが見つかりません。" };
    }
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: getAuthErrorMessage(error.message) };
      if (data.user) setUser(data.user as User);
      return { error: null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<AuthResult> => {
    if (!HAS_SUPABASE || isLocalAuthUser(user)) {
      try {
        const stored = localStorage.getItem("moneyspot_user_profile");
        const current = stored ? JSON.parse(stored) : {};
        const updated = { ...current, ...updates };
        localStorage.setItem("moneyspot_user_profile", JSON.stringify(updated));
        setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates } } as User : null);
      } catch {}
      return { error: null };
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.updateUser({ data: updates });
      if (!error) {
        setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates } } as User : null);
      }
      return { error: error ? getAuthErrorMessage(error.message) : null };
    } catch (error) {
      return { error: getAuthErrorMessage(error) };
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!HAS_SUPABASE) {
      localStorage.removeItem("moneyspot_user_profile");
      setUser(null);
      return;
    }
    if (isLocalAuthUser(user)) {
      localStorage.removeItem("moneyspot_user_profile");
      try { localStorage.removeItem(LOCAL_AUTH_FALLBACK_EMAIL_KEY); } catch {}
      setUser(null);
      return;
    }
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
  }, [user]);

  const profile: UserProfile | null = user
    ? {
        lastName: (user.user_metadata?.lastName as string) || "",
        firstName: (user.user_metadata?.firstName as string) || "",
        email: user.email || "",
        phone: (user.user_metadata?.phone as string) || "",
        country: (user.user_metadata?.country as string) || "",
      }
    : null;

  return {
    user,
    userId: isLocalAuthUser(user) ? null : user?.id ?? null,
    profile,
    loading,
    isLoggedIn: !!user && !user.is_anonymous,
    isAnonymous: user?.is_anonymous ?? true,
    sendOtp,
    verifyOtp,
    signUpWithPassword,
    signInWithPassword,
    updateProfile,
    signOut,
  };
}
