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

// Check if we have a real Supabase connection
const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize: check current session
  useEffect(() => {
    if (!HAS_SUPABASE) {
      // Try localStorage fallback for demo/mock mode
      try {
        const stored = localStorage.getItem("moneyspot_user_profile");
        if (stored) {
          const profile = JSON.parse(stored) as UserProfile;
          setUser({ id: "local", email: profile.email, user_metadata: profile } as unknown as User);
        }
      } catch {}
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
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

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    })();

    return () => { mounted = false; };
  }, []);

  // Send OTP to email
  const sendOtp = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!HAS_SUPABASE) {
      return { error: null }; // Mock: always succeed
    }
    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error: error?.message ?? null };
  }, []);

  // Verify OTP and set profile
  const verifyOtp = useCallback(async (
    email: string,
    token: string,
    profile: Omit<UserProfile, "email">
  ): Promise<{ error: string | null }> => {
    if (!HAS_SUPABASE) {
      // Mock mode: store in localStorage
      const fullProfile: UserProfile = { ...profile, email };
      try { localStorage.setItem("moneyspot_user_profile", JSON.stringify(fullProfile)); } catch {}
      setUser({ id: "local", email, user_metadata: fullProfile } as unknown as User);
      return { error: null };
    }

    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) return { error: error.message };

    // Update user metadata with profile info
    await supabase.auth.updateUser({
      data: { lastName: profile.lastName, firstName: profile.firstName, phone: profile.phone, country: profile.country },
    });

    if (data.user) setUser(data.user);
    return { error: null };
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!HAS_SUPABASE) {
      try {
        const stored = localStorage.getItem("moneyspot_user_profile");
        const current = stored ? JSON.parse(stored) : {};
        const updated = { ...current, ...updates };
        localStorage.setItem("moneyspot_user_profile", JSON.stringify(updated));
        setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates } } as User : null);
      } catch {}
      return { error: null };
    }

    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (!error) {
      setUser((prev) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates } } as User : null);
    }
    return { error: error?.message ?? null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    if (!HAS_SUPABASE) {
      localStorage.removeItem("moneyspot_user_profile");
      setUser(null);
      return;
    }
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    setUser(null);
  }, []);

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
    userId: user?.id ?? null,
    profile,
    loading,
    isLoggedIn: !!user && !user.is_anonymous,
    isAnonymous: user?.is_anonymous ?? true,
    sendOtp,
    verifyOtp,
    updateProfile,
    signOut,
  };
}
