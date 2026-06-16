"use client";

import { useEffect, useState } from "react";

const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

type PremiumRow = {
  status: "active" | "trialing" | "past_due" | "canceled" | "expired";
  current_period_end: string | null;
};

function isActive(row: PremiumRow | null): boolean {
  if (!row) return false;
  if (row.status !== "active" && row.status !== "trialing") return false;
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() > Date.now();
}

export function usePremium(userId: string | null) {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let mounted = true;
    (async () => {
      if (!HAS_SUPABASE) {
        try {
          const stored = localStorage.getItem("moneyspot_premium");
          if (mounted) setIsPremium(stored ? isActive(JSON.parse(stored) as PremiumRow) : false);
        } catch {
          if (mounted) setIsPremium(false);
        }
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;
      const { data } = await supabase
        .from("user_premium_subscriptions")
        .select("status,current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      if (mounted) setIsPremium(isActive(data as PremiumRow | null));
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { isPremium: Boolean(userId && isPremium) };
}
