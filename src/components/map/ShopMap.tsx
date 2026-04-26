"use client";

import { useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { ExchangeShop } from "@/lib/database.types";

const JAPAN_CENTER = { lat: 36.5, lng: 137.0 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

type Props = {
  shops: ExchangeShop[];
  selectedShopId: number | null;
  selectedCurrency: string;
  onShopSelect: (shopId: number) => void;
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate?: (loc: { lat: number; lng: number }) => void;
};

function MyLocationButton({
  userLocation,
  onLocationUpdate,
}: {
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate?: (loc: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  const handleClick = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (map) {
          map.panTo(loc);
          map.setZoom(16);
        }
        onLocationUpdate?.(loc);
      },
      () => {
        if (userLocation && map) {
          map.panTo(userLocation);
          map.setZoom(16);
        }
      },
      { enableHighAccuracy: true }
    );
  }, [map, userLocation, onLocationUpdate]);

  return (
    <button
      onClick={handleClick}
      className="absolute top-[110px] right-2.5 w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-50 z-10"
      aria-label="Go to my location"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#666" strokeWidth="2">
        <circle cx="12" cy="12" r="3" fill="#4285F4" stroke="none" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    </button>
  );
}

export default function ShopMap({
  shops,
  selectedShopId,
  selectedCurrency,
  onShopSelect,
  userLocation,
  onLocationUpdate,
}: Props) {
  const center = userLocation || JAPAN_CENTER;
  const defaultZoom = userLocation ? 14 : 6;

  if (!API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <p>Google Maps API Key が設定されていません</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative w-full h-full">
      <Map
        defaultCenter={center}
        defaultZoom={defaultZoom}
        mapId="moneyspot-map"
        className="w-full h-full"
        disableDefaultUI
        zoomControl
        zoomControlOptions={{ position: 3 }}
        gestureHandling="greedy"
      >
        {shops.map((shop) => {
          const rate = shop.exchange_rates?.find(
            (r) => r.currency_code === selectedCurrency
          );
          return (
            <AdvancedMarker
              key={shop.id}
              position={{ lat: shop.lat, lng: shop.lng }}
              onClick={() => onShopSelect(shop.id)}
            >
              <div
                className={`px-2 py-1 rounded-full text-xs font-bold shadow-md cursor-pointer transition-transform ${
                  selectedShopId === shop.id
                    ? "bg-blue-600 text-white scale-110"
                    : shop.is_promoted
                      ? "bg-amber-400 text-white hover:scale-105 ring-2 ring-amber-300"
                      : "bg-white text-gray-800 hover:scale-105"
                }`}
              >
                {rate?.sell_rate
                  ? `¥${Number(rate.sell_rate).toFixed(1)}`
                  : shop.name_en.slice(0, 8)}
              </div>
            </AdvancedMarker>
          );
        })}

        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          </AdvancedMarker>
        )}
      </Map>
      <MyLocationButton userLocation={userLocation} onLocationUpdate={onLocationUpdate} />
      </div>
    </APIProvider>
  );
}
