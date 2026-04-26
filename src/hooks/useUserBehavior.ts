"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

type EventType =
  | "currency_select"
  | "filter_change"
  | "search"
  | "shop_detail_open"
  | "page_view"
  | "simulation_open";

type QueuedEvent = { event_type: string; event_data: Record<string, unknown> };

export function useUserBehavior(userId: string | null) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewedShopIds, setViewedShopIds] = useState<number[]>([]);
  const [synced, setSynced] = useState(false);
  const queueRef = useRef<QueuedEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初回: localStorageから読み込み → Supabaseと同期
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("moneyspot_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      const storedViewed = localStorage.getItem("moneyspot_viewed");
      if (storedViewed) setViewedShopIds(JSON.parse(storedViewed));
    } catch {}

    if (!HAS_SUPABASE || !userId) return;

    let mounted = true;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;

      const [favsRes, viewedRes] = await Promise.all([
        supabase.from("user_favorites").select("shop_id").eq("user_id", userId),
        supabase.from("user_view_history").select("shop_id").eq("user_id", userId)
          .order("viewed_at", { ascending: false }).limit(20),
      ]);
      const dbFavs = (favsRes.data || []) as { shop_id: number }[];
      const dbViewed = (viewedRes.data || []) as { shop_id: number }[];

      if (!mounted) return;

      // DBとlocalStorageをマージ
      const dbFavIds = dbFavs.map((f) => f.shop_id);
      const localFavs: number[] = (() => {
        try {
          const s = localStorage.getItem("moneyspot_favorites");
          return s ? JSON.parse(s) : [];
        } catch { return []; }
      })();

      const mergedFavs = [...new Set([...dbFavIds, ...localFavs])];
      setFavorites(mergedFavs);

      // localStorageにしかないお気に入りをDBにアップロード
      const newFavs = localFavs.filter((id: number) => !dbFavIds.includes(id));
      if (newFavs.length > 0) {
        await supabase.from("user_favorites").upsert(
          newFavs.map((shop_id: number) => ({ user_id: userId, shop_id })),
          { onConflict: "user_id,shop_id" }
        );
      }

      const dbViewIds = dbViewed.map((v) => v.shop_id);
      if (dbViewIds.length > 0) setViewedShopIds(dbViewIds);

      setSynced(true);
      try { localStorage.setItem("moneyspot_favorites", JSON.stringify(mergedFavs)); } catch {}
    })();

    return () => { mounted = false; };
  }, [userId]);

  // お気に入りトグル
  const toggleFavorite = useCallback((shopId: number) => {
    setFavorites((prev) => {
      const isFav = prev.includes(shopId);
      const next = isFav ? prev.filter((id) => id !== shopId) : [...prev, shopId];
      try { localStorage.setItem("moneyspot_favorites", JSON.stringify(next)); } catch {}

      // Supabase同期（非同期）
      if (HAS_SUPABASE && userId) {
        (async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;
          if (isFav) {
            await supabase.from("user_favorites").delete().eq("user_id", userId).eq("shop_id", shopId);
          } else {
            await supabase.from("user_favorites").upsert(
              { user_id: userId, shop_id: shopId },
              { onConflict: "user_id,shop_id" }
            );
          }
        })();
      }

      return next;
    });
  }, [userId]);

  // 閲覧履歴追加
  const addToViewed = useCallback((shopId: number) => {
    setViewedShopIds((prev) => {
      const next = [shopId, ...prev.filter((id) => id !== shopId)].slice(0, 20);
      try { localStorage.setItem("moneyspot_viewed", JSON.stringify(next)); } catch {}
      return next;
    });

    if (HAS_SUPABASE && userId) {
      (async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;
        await supabase.from("user_view_history").insert({ user_id: userId, shop_id: shopId });
      })();
    }
  }, [userId]);

  // 閲覧履歴クリア
  const clearViewedHistory = useCallback(() => {
    setViewedShopIds([]);
    try { localStorage.removeItem("moneyspot_viewed"); } catch {}

    if (HAS_SUPABASE && userId) {
      (async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;
        await supabase.from("user_view_history").delete().eq("user_id", userId);
      })();
    }
  }, [userId]);

  // イベント追跡（バッチ送信）
  const flushQueue = useCallback(async () => {
    if (!userId || queueRef.current.length === 0) return;
    const batch = [...queueRef.current];
    queueRef.current = [];
    timerRef.current = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { supabase } = await import("@/lib/supabase") as any;
      await supabase.from("user_events").insert(
        batch.map((e) => ({ user_id: userId, event_type: e.event_type, event_data: e.event_data }))
      );
    } catch {
      queueRef.current.unshift(...batch);
    }
  }, [userId]);

  const trackEvent = useCallback((eventType: EventType, eventData: Record<string, unknown> = {}) => {
    if (!HAS_SUPABASE || !userId) return;

    queueRef.current.push({ event_type: eventType, event_data: eventData });

    if (queueRef.current.length >= 10) {
      flushQueue();
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setTimeout(flushQueue, 5000);
    }
  }, [userId, flushQueue]);

  // アンマウント時にキューをフラッシュ
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (queueRef.current.length > 0 && userId) {
        // ベストエフォートで送信（navigator.sendBeacon的）
        flushQueue();
      }
    };
  }, [userId, flushQueue]);

  return {
    favorites,
    toggleFavorite,
    viewedShopIds,
    addToViewed,
    clearViewedHistory,
    trackEvent,
    synced,
  };
}
