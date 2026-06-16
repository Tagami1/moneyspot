"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExchangeShop } from "@/lib/database.types";
import {
  createRateAlertId,
  getTriggeredRateAlerts,
  type RateAlert,
} from "@/lib/rate-alerts";

const STORAGE_KEY = "moneyspot_rate_alerts";

function loadStoredAlerts(): RateAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRateAlerts(shops: ExchangeShop[]) {
  const [rateAlerts, setRateAlerts] = useState<RateAlert[]>([]);
  const [alertsHydrated, setAlertsHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRateAlerts(loadStoredAlerts());
      setAlertsHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!alertsHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rateAlerts));
    } catch {}
  }, [alertsHydrated, rateAlerts]);

  const saveRateAlert = useCallback((currency: string, targetRate: number) => {
    const normalizedRate = Number(targetRate);
    if (!Number.isFinite(normalizedRate) || normalizedRate <= 0) return false;

    setRateAlerts((prev) => {
      const id = createRateAlertId(currency);
      const nextAlert: RateAlert = {
        id,
        currency,
        targetRate: normalizedRate,
        active: true,
        createdAt: prev.find((alert) => alert.id === id)?.createdAt ?? new Date().toISOString(),
      };
      return [nextAlert, ...prev.filter((alert) => alert.id !== id)];
    });
    return true;
  }, []);

  const toggleRateAlert = useCallback((id: string) => {
    setRateAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  }, []);

  const removeRateAlert = useCallback((id: string) => {
    setRateAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const triggeredRateAlerts = useMemo(
    () => getTriggeredRateAlerts(shops, rateAlerts),
    [shops, rateAlerts]
  );

  return {
    rateAlerts,
    saveRateAlert,
    toggleRateAlert,
    removeRateAlert,
    triggeredRateAlerts,
  };
}
