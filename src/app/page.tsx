"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Header from "@/components/common/Header";
import ShopMap from "@/components/map/ShopMap";
import ShopCard from "@/components/shop/ShopCard";
import ShopDetail from "@/components/shop/ShopDetail";
import CurrencySelector from "@/components/currency/CurrencySelector";
import SimulationModal from "@/components/simulation/SimulationModal";
import MyPage from "@/components/mypage/MyPage";
import AdBanner from "@/components/ads/AdBanner";
import WiseAffiliateBanner from "@/components/ads/WiseAffiliateBanner";
import { calcDistance, isOpenNow } from "@/lib/utils";
import { mockShops, mockCurrencies } from "@/lib/mock-data";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useUserBehavior } from "@/hooks/useUserBehavior";
import type { ExchangeShop, Currency, NearbyShopResult } from "@/lib/database.types";
import type { Locale } from "@/i18n/config";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

// Feature 3: Default currency by browser language
const LANG_DEFAULT_CURRENCY: Record<string, string> = {
  ja: "USD",
  en: "USD",
  ko: "KRW",
  zh: "CNY",
  th: "THB",
  vi: "USD",
  id: "USD",
  es: "EUR",
};

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [locale, setLocale] = useState<Locale>("en");
  const [shops, setShops] = useState<ExchangeShop[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<"rate" | "distance">("rate");
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marketRates, setMarketRates] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null); // km
  const [showMyPage, setShowMyPage] = useState(false);

  // Feature 4: Collapsible filter bar
  const [filtersExpanded, setFiltersExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("moneyspot_filters_expanded") === "true";
      } catch {}
    }
    return false;
  });

  // Feature 7: Amount input with cross-currency conversion
  const [amountInput, setAmountInput] = useState("");
  const [convertFromCurrency, setConvertFromCurrency] = useState("JPY");
  const [convertToCurrency, setConvertToCurrency] = useState("");

  // Feature 2: Pull-to-refresh state
  const [pullState, setPullState] = useState<"idle" | "pulling" | "ready" | "refreshing">("idle");
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef(0);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Feature 1: Card slider ref
  const cardSliderRef = useRef<HTMLDivElement>(null);
  // Separate "detail open" from "highlight on map"
  const [detailShopId, setDetailShopId] = useState<number | null>(null);
  // Suppress card scroll auto-select after filter changes
  const suppressScrollSelect = useRef(false);

  const { t } = useTranslation(locale);
  const { userId, isLoggedIn, profile, sendOtp, verifyOtp, updateProfile, signOut } = useAuth();
  const { favorites, toggleFavorite, viewedShopIds, addToViewed, clearViewedHistory, trackEvent } = useUserBehavior(userId);

  // Feature 4: persist filter expanded state
  useEffect(() => {
    try {
      sessionStorage.setItem("moneyspot_filters_expanded", String(filtersExpanded));
    } catch {}
  }, [filtersExpanded]);

  // favorites, toggleFavorite, viewedShopIds, addToViewed, clearViewedHistory
  // are now provided by useUserBehavior hook (synced with Supabase)

  // デフォルト位置（東京駅）
  const DEFAULT_LOCATION = { lat: 35.6812, lng: 139.7671 };

  // 位置情報取得（拒否時はデフォルト位置を使用）
  const [locationReady, setLocationReady] = useState(false);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationReady(true);
        },
        () => {
          // 位置情報拒否時はデフォルト位置（東京）を使用
          setUserLocation(DEFAULT_LOCATION);
          setLocationReady(true);
        }
      );
    } else {
      setUserLocation(DEFAULT_LOCATION);
      setLocationReady(true);
    }
  }, []);

  // Feature 3: ブラウザの言語を自動検出 + default currency
  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2);
    const supportedLocales = ["ja", "en", "zh", "ko", "es", "th", "vi", "id"];
    if (supportedLocales.includes(browserLang)) {
      setLocale(browserLang as Locale);
    }
    // Set default currency based on browser language
    const defaultCurrency = LANG_DEFAULT_CURRENCY[browserLang];
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, []);

  // データ取得（位置情報ベースの20km圏内フィルタ）
  const fetchData = useCallback(async (location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        // ダミーデータを使用
        setShops(mockShops);
        setCurrencies(mockCurrencies);
      } else {
        const { supabase } = await import("@/lib/supabase");

        // 20km圏内のショップIDを取得
        const { data: nearbyData } = await supabase
          .rpc("get_nearby_shop_ids" as never, {
            user_lat: location.lat,
            user_lng: location.lng,
            radius_m: 20000,
          } as never) as unknown as { data: NearbyShopResult[] | null };

        const nearbyIds = nearbyData?.map((r) => r.shop_id) ?? [];

        // 近くのショップの詳細データを取得（関連データ含む）
        const shopsQuery = nearbyIds.length > 0
          ? supabase
              .from("exchange_shops")
              .select(`
                *,
                exchange_chains(*),
                shop_business_hours(*),
                exchange_rates(*)
              `)
              .in("id", nearbyIds)
              .eq("is_active", true)
          : supabase
              .from("exchange_shops")
              .select(`
                *,
                exchange_chains(*),
                shop_business_hours(*),
                exchange_rates(*)
              `)
              .eq("is_active", true);

        const [shopsRes, currenciesRes] = await Promise.all([
          shopsQuery,
          supabase.from("currencies").select("*").order("sort_order"),
        ]);

        if (shopsRes.data) setShops(shopsRes.data as unknown as ExchangeShop[]);
        if (currenciesRes.data) setCurrencies(currenciesRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 位置情報が確定したらデータ取得
  useEffect(() => {
    if (locationReady && userLocation) {
      fetchData(userLocation);
    }
  }, [locationReady, userLocation, fetchData]);

  // 市場レート（Google参考レート）を取得
  useEffect(() => {
    const parseRates = (data: { rates?: Record<string, number> }) => {
      if (!data.rates) return null;
      const jpyRates: Record<string, number> = {};
      for (const [code, rate] of Object.entries(data.rates)) {
        if (typeof rate === "number" && rate > 0) {
          jpyRates[code] = 1 / rate;
        }
      }
      return Object.keys(jpyRates).length > 0 ? jpyRates : null;
    };

    fetch("https://open.er-api.com/v6/latest/JPY")
      .then((res) => res.json())
      .then((data) => {
        const rates = parseRates(data);
        if (rates) {
          setMarketRates(rates);
        } else {
          throw new Error("No rates in response");
        }
      })
      .catch(() => {
        // フォールバック: 別のAPIを試す
        fetch("https://latest.currency-api.pages.dev/v1/currencies/jpy.json")
          .then((res) => res.json())
          .then((data) => {
            if (data.jpy) {
              const jpyRates: Record<string, number> = {};
              for (const [code, rate] of Object.entries(data.jpy)) {
                if (typeof rate === "number" && rate > 0) {
                  jpyRates[code.toUpperCase()] = 1 / rate;
                }
              }
              if (Object.keys(jpyRates).length > 0) {
                setMarketRates(jpyRates);
              }
            }
          })
          .catch(() => {});
      });
  }, []);

  // フィルタ＆ソート済み店舗リスト
  let filteredShops = shops;
  if (filterOpenNow) {
    filteredShops = filteredShops.filter((s) => isOpenNow(s.shop_business_hours || []));
  }
  if (filterFavorites) {
    filteredShops = filteredShops.filter((s) => favorites.includes(s.id));
  }
  // 検索フィルター
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredShops = filteredShops.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.name_en && s.name_en.toLowerCase().includes(q)) ||
      s.address.toLowerCase().includes(q) ||
      (s.exchange_chains?.name && s.exchange_chains.name.toLowerCase().includes(q))
    );
  }
  // 距離フィルター変更時はカードスクロール自動選択を抑制
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    suppressScrollSelect.current = true;
    const timer = setTimeout(() => { suppressScrollSelect.current = false; }, 500);
    return () => clearTimeout(timer);
  }, [distanceFilter, filterOpenNow, filterFavorites, searchQuery]);

  // 距離フィルター
  if (distanceFilter && userLocation) {
    filteredShops = filteredShops.filter((s) =>
      calcDistance(userLocation.lat, userLocation.lng, s.lat, s.lng) <= distanceFilter
    );
  }

  const sortedShops = [...filteredShops].sort((a, b) => {
    // Promoted shops always appear first
    const aPromoted = a.is_promoted ? 1 : 0;
    const bPromoted = b.is_promoted ? 1 : 0;
    if (aPromoted !== bPromoted) return bPromoted - aPromoted;

    if (sortBy === "distance" && userLocation) {
      const distA = calcDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calcDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }
    const rateA = a.exchange_rates?.find(
      (r) => r.currency_code === selectedCurrency
    );
    const rateB = b.exchange_rates?.find(
      (r) => r.currency_code === selectedCurrency
    );
    if (!rateA?.sell_rate) return 1;
    if (!rateB?.sell_rate) return -1;
    // Deprioritize reference/estimated rates below actual rates
    const aIsReference = rateA.rate_type === "reference";
    const bIsReference = rateB.rate_type === "reference";
    if (aIsReference !== bIsReference) return aIsReference ? 1 : -1;
    return Number(rateA.sell_rate) - Number(rateB.sell_rate);
  });

  // Feature 5: Find best rate shop & Top 5
  const bestRateShopId = useMemo(() => {
    let bestId: number | null = null;
    let bestRate = Infinity;
    for (const shop of sortedShops) {
      const rate = shop.exchange_rates?.find(
        (r) => r.currency_code === selectedCurrency && r.rate_type !== "reference"
      );
      if (rate?.sell_rate && Number(rate.sell_rate) < bestRate) {
        bestRate = Number(rate.sell_rate);
        bestId = shop.id;
      }
    }
    return bestId;
  }, [sortedShops, selectedCurrency]);

  const top5ShopIds = useMemo(() => {
    return [...sortedShops]
      .filter((s) => s.exchange_rates?.some((r) => r.currency_code === selectedCurrency && r.sell_rate && r.rate_type !== "reference"))
      .sort((a, b) => {
        const rateA = a.exchange_rates?.find((r) => r.currency_code === selectedCurrency);
        const rateB = b.exchange_rates?.find((r) => r.currency_code === selectedCurrency);
        return Number(rateA?.sell_rate || Infinity) - Number(rateB?.sell_rate || Infinity);
      })
      .slice(0, 5)
      .map((s) => s.id);
  }, [sortedShops, selectedCurrency]);

  const selectedShop = shops.find((s) => s.id === selectedShopId);
  const detailShop = shops.find((s) => s.id === detailShopId);

  // Track viewed shops when shop detail opens
  useEffect(() => {
    if (detailShopId !== null) {
      addToViewed(detailShopId);
    }
  }, [detailShopId, addToViewed]);

  // Feature 7: parsed amount
  const parsedAmount = amountInput ? Number(amountInput) : null;
  const validAmount = parsedAmount && parsedAmount > 0 ? parsedAmount : null;

  // Feature 1: Auto-scroll card slider when selectedShopId changes
  useEffect(() => {
    if (selectedShopId !== null && cardSliderRef.current && viewMode === "map") {
      const cardEl = cardSliderRef.current.querySelector(`[data-shop-id="${selectedShopId}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedShopId, viewMode]);

  // Feature 1: Detect which card is centered via scroll handler
  // Only highlights on map, does NOT open detail
  const handleCardScroll = useCallback(() => {
    if (!cardSliderRef.current || suppressScrollSelect.current) return;
    const container = cardSliderRef.current;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    let closestId: number | null = null;
    let closestDist = Infinity;

    const cards = container.querySelectorAll("[data-shop-id]");
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = Number(card.getAttribute("data-shop-id"));
      }
    });

    if (closestId !== null && closestId !== selectedShopId) {
      setSelectedShopId(closestId);
    }
  }, [selectedShopId]);

  // Feature 2: Pull-to-refresh touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!listContainerRef.current) return;
    if (listContainerRef.current.scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
      setPullState("idle");
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!listContainerRef.current || pullState === "refreshing") return;
    if (listContainerRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;

    if (diff > 0) {
      const dist = Math.min(diff * 0.5, 100);
      setPullDistance(dist);
      if (dist > 60) {
        setPullState("ready");
      } else if (dist > 10) {
        setPullState("pulling");
      }
    }
  }, [pullState]);

  const handleTouchEnd = useCallback(async () => {
    if (pullState === "ready") {
      setPullState("refreshing");
      setPullDistance(50);
      await fetchData(userLocation ?? DEFAULT_LOCATION);
      setPullState("idle");
      setPullDistance(0);
    } else {
      setPullState("idle");
      setPullDistance(0);
    }
  }, [pullState, fetchData, userLocation]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        locale={locale}
        onLocaleChange={setLocale}
        onMyPageOpen={() => setShowMyPage(true)}
        t={t}
      />

      {/* Filter bar - mobile optimized */}
      <div className="bg-white border-b px-3 py-2 space-y-2 overflow-hidden">
        {/* Row 1: Currency + Search + Open Now + Filter toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setShowCurrencySelector(true); trackEvent("page_view", { action: "open_currency_selector" }); }}
            className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors flex-shrink-0"
          >
            {currencies.find((c) => c.code === selectedCurrency)?.flag_emoji}{" "}
            {selectedCurrency}
            <span className="text-blue-400 ml-0.5">▼</span>
          </button>

          {/* Search input */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`px-2 py-1.5 text-xs rounded-lg font-medium border transition-colors flex-shrink-0 ${
              filterOpenNow
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            {filterOpenNow ? `●` : ""} {t("filter.openNow")}
          </button>

          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className="px-2 py-1.5 text-xs rounded-lg font-medium border border-gray-200 bg-white text-gray-500 transition-colors flex-shrink-0"
          >
            {filtersExpanded ? "▲" : "▼"}
          </button>
        </div>

        {/* Row 2: Distance filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {([null, 5, 10, 20] as (number | null)[]).map((d) => (
            <button
              key={d ?? "all"}
              onClick={() => setDistanceFilter(d)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium border whitespace-nowrap transition-colors ${
                distanceFilter === d
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              {d === null ? t("distance.all") : t(`distance.${d}km`)}
            </button>
          ))}

          <div className="flex bg-gray-100 rounded-lg p-0.5 ml-auto flex-shrink-0">
            <button
              onClick={() => setSortBy("rate")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                sortBy === "rate"
                  ? "bg-white text-blue-600 shadow-sm font-medium"
                  : "text-gray-500"
              }`}
            >
              {t("sort.bestRate")}
            </button>
            <button
              onClick={() => setSortBy("distance")}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                sortBy === "distance"
                  ? "bg-white text-blue-600 shadow-sm font-medium"
                  : "text-gray-500"
              }`}
            >
              {t("sort.nearest")}
            </button>
          </div>
        </div>

        {/* Expanded section */}
        {filtersExpanded && (
          <>
            {/* Row 3: Favorites + Simulation + Area */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                  filterFavorites
                    ? "bg-red-100 text-red-600 border-red-300"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {filterFavorites ? "♥ " : "♡ "}{t("filter.favorites")}
              </button>

              <button
                onClick={() => { setShowSimulation(true); trackEvent("simulation_open"); }}
                className="px-2.5 py-1.5 text-xs rounded-lg font-medium border border-purple-200 bg-purple-50 text-purple-700 transition-colors"
              >
                {t("simulation.button")}
              </button>
            </div>

            {/* Cross-currency converter */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={amountInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setAmountInput(v);
                }}
                placeholder="100"
                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={convertFromCurrency}
                onChange={(e) => setConvertFromCurrency(e.target.value)}
                className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none"
              >
                <option value="JPY">JPY</option>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <span className="text-gray-400 text-xs">→</span>
              <select
                value={convertToCurrency || selectedCurrency}
                onChange={(e) => setConvertToCurrency(e.target.value)}
                className="px-1.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-none"
              >
                <option value="JPY">JPY</option>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              {amountInput ? (
                <>
                  <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
                    {(() => {
                      const amt = Number(amountInput);
                      if (!amt || amt <= 0) return "";
                      const from = convertFromCurrency;
                      const to = convertToCurrency || selectedCurrency;
                      if (from === to) return `${amt.toFixed(2)} ${to}`;
                      const fromJpy = from === "JPY" ? 1 : (marketRates[from] || 0);
                      const toJpy = to === "JPY" ? 1 : (marketRates[to] || 0);
                      if (!fromJpy || !toJpy) return "-";
                      const result = (amt * fromJpy) / toJpy;
                      return `= ${result.toFixed(2)} ${to}`;
                    })()}
                  </span>
                  <button
                    onClick={() => { setAmountInput(""); setConvertFromCurrency("JPY"); setConvertToCurrency(""); }}
                    className="text-gray-400 text-sm hover:text-gray-600 flex-shrink-0"
                  >
                    ×
                  </button>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t("common.loading")}</p>
            </div>
          </div>
        ) : viewMode === "map" ? (
          <>
            <ShopMap
              shops={sortedShops}
              selectedShopId={selectedShopId}
              selectedCurrency={selectedCurrency}
              onShopSelect={(id) => { setSelectedShopId(id); setDetailShopId(id); }}
              userLocation={userLocation}
              onLocationUpdate={setUserLocation}
            />
            {/* Feature 1: マップ下部のカードスライダー with sync */}
            <div className="absolute bottom-8 left-0 right-0 px-4 pb-4">
              <div
                ref={cardSliderRef}
                onScroll={handleCardScroll}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
              >
                {sortedShops.slice(0, 10).map((shop) => (
                  <div key={shop.id} data-shop-id={shop.id} className="snap-start flex-shrink-0 w-[280px]">
                    <ShopCard
                      shop={shop}
                      selectedCurrency={selectedCurrency}
                      locale={locale}
                      t={t}
                      isFavorite={favorites.includes(shop.id)}
                      onToggleFavorite={toggleFavorite}
                      isBestRate={shop.id === bestRateShopId}
                      marketRates={marketRates}
                      amountInput={validAmount}
                      distance={
                        userLocation
                          ? calcDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
                          : null
                      }
                      onClick={() => setDetailShopId(shop.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Feature 2: List view with pull-to-refresh */
          <div
            ref={listContainerRef}
            className="overflow-y-auto h-full p-4 space-y-3 pb-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Pull-to-refresh indicator */}
            {pullState !== "idle" && (
              <div
                className="flex items-center justify-center text-sm text-gray-500 transition-all"
                style={{ height: `${pullDistance}px`, overflow: "hidden" }}
              >
                {pullState === "refreshing"
                  ? t("pullToRefresh.refreshing")
                  : pullState === "ready"
                    ? t("pullToRefresh.release")
                    : t("pullToRefresh.pull")}
              </div>
            )}
            {/* Top 5 section */}
            {sortBy === "rate" && !searchQuery && top5ShopIds.length > 0 && (
              <div className="mb-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <span className="text-yellow-500">★</span> {t("top5.title")} ({selectedCurrency})
                </h3>
                <div className="space-y-2">
                  {top5ShopIds.map((shopId, idx) => {
                    const shop = sortedShops.find((s) => s.id === shopId);
                    if (!shop) return null;
                    return (
                      <div key={shop.id} className="flex items-center gap-2">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                          idx === 0 ? "bg-yellow-100 text-yellow-700" :
                          idx === 1 ? "bg-gray-100 text-gray-600" :
                          idx === 2 ? "bg-orange-50 text-orange-600" :
                          "bg-gray-50 text-gray-500"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <ShopCard
                            shop={shop}
                            selectedCurrency={selectedCurrency}
                            locale={locale}
                            t={t}
                            isFavorite={favorites.includes(shop.id)}
                            onToggleFavorite={toggleFavorite}
                            isBestRate={shop.id === bestRateShopId}
                            marketRates={marketRates}
                            amountInput={validAmount}
                            distance={
                              userLocation
                                ? calcDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
                                : null
                            }
                            onClick={() => setDetailShopId(shop.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">{t("common.shopsFound", { count: String(sortedShops.length) })}</p>
            {sortedShops.map((shop, index) => (
              <div key={shop.id}>
                <ShopCard
                  shop={shop}
                  selectedCurrency={selectedCurrency}
                  locale={locale}
                  t={t}
                  isFavorite={favorites.includes(shop.id)}
                  onToggleFavorite={toggleFavorite}
                  isBestRate={shop.id === bestRateShopId}
                  marketRates={marketRates}
                  amountInput={validAmount}
                  distance={
                    userLocation
                      ? calcDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
                      : null
                  }
                  onClick={() => setDetailShopId(shop.id)}
                />
                {/* Show ad banner every 5th card */}
                {(index + 1) % 5 === 0 && (
                  <AdBanner locale={locale} t={t} placement="list" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 店舗詳細（ボトムシート） */}
        {detailShop && (
          <div className="absolute inset-0 z-30 flex items-end">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setDetailShopId(null)}
            />
            <div className="relative w-full">
              <ShopDetail
                shop={detailShop}
                selectedCurrency={selectedCurrency}
                marketRates={marketRates}
                locale={locale}
                t={t}
                isFavorite={favorites.includes(detailShop.id)}
                onToggleFavorite={toggleFavorite}
                onClose={() => setDetailShopId(null)}
                isBestRate={detailShop.id === bestRateShopId}
                wiseAffiliateBanner={
                  <WiseAffiliateBanner
                    locale={locale}
                    t={t}
                    selectedCurrency={selectedCurrency}
                    marketRate={marketRates[selectedCurrency]}
                    shopRate={
                      detailShop.exchange_rates?.find(
                        (r) => r.currency_code === selectedCurrency
                      )?.sell_rate
                        ? Number(
                            detailShop.exchange_rates.find(
                              (r) => r.currency_code === selectedCurrency
                            )?.sell_rate
                          )
                        : undefined
                    }
                  />
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Feature 9: Disclaimer footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-1.5 text-center">
        <p className="text-[10px] text-gray-400 leading-tight">
          {t("disclaimer.text")}
        </p>
      </div>

      {/* 通貨セレクター */}
      {showCurrencySelector && (
        <CurrencySelector
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          locale={locale}
          t={t}
          onSelect={(c: string) => { setSelectedCurrency(c); trackEvent("currency_select", { currency: c }); }}
          onClose={() => setShowCurrencySelector(false)}
        />
      )}

      {/* シミュレーションモーダル */}
      {showSimulation && (
        <SimulationModal
          shops={shops}
          selectedCurrency={selectedCurrency}
          currencies={currencies}
          t={t}
          onClose={() => setShowSimulation(false)}
        />
      )}

      {/* マイページ */}
      {showMyPage && (
        <MyPage
          shops={shops}
          currencies={currencies}
          favorites={favorites}
          viewedShopIds={viewedShopIds}
          selectedCurrency={selectedCurrency}
          locale={locale}
          t={t}
          onClose={() => setShowMyPage(false)}
          onShopSelect={(id) => { setDetailShopId(id); setShowMyPage(false); }}
          onToggleFavorite={toggleFavorite}
          onCurrencyChange={setSelectedCurrency}
          onLocaleChange={setLocale}
          onClearHistory={clearViewedHistory}
          isLoggedIn={isLoggedIn}
          profile={profile}
          onSendOtp={sendOtp}
          onVerifyOtp={verifyOtp}
          onUpdateProfile={updateProfile}
          onSignOut={signOut}
        />
      )}
    </div>
  );
}
