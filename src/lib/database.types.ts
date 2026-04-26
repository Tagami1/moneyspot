export type NearbyShopResult = {
  shop_id: number;
  distance_m: number;
};

export type Database = {
  public: {
    Tables: {
      exchange_chains: {
        Row: {
          id: number;
          name: string;
          name_en: string;
          logo_url: string | null;
          website_url: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["exchange_chains"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["exchange_chains"]["Insert"]
        >;
      };
      exchange_shops: {
        Row: {
          id: number;
          chain_id: number | null;
          name: string;
          name_en: string;
          address: string;
          address_en: string;
          lat: number;
          lng: number;
          phone: string | null;
          website_url: string | null;
          shop_type: "specialist" | "ticket_shop" | "bank" | "atm" | "hotel";
          is_active: boolean;
          is_promoted: boolean;
          source: "scraper" | "osm" | "manual" | "user";
          osm_id: number | null;
          country_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["exchange_shops"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["exchange_shops"]["Insert"]
        >;
      };
      shop_business_hours: {
        Row: {
          id: number;
          shop_id: number;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["shop_business_hours"]["Row"],
          "id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["shop_business_hours"]["Insert"]
        >;
      };
      currencies: {
        Row: {
          id: number;
          code: string;
          name_ja: string;
          name_en: string;
          symbol: string;
          flag_emoji: string;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["currencies"]["Row"], "id">;
        Update: Partial<
          Database["public"]["Tables"]["currencies"]["Insert"]
        >;
      };
      exchange_rates: {
        Row: {
          id: number;
          shop_id: number;
          currency_code: string;
          buy_rate: number | null;
          sell_rate: number | null;
          rate_type: "actual" | "reference" | "user_reported";
          fetched_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["exchange_rates"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["exchange_rates"]["Insert"]
        >;
      };
    };
  };
};

export type ExchangeShop =
  Database["public"]["Tables"]["exchange_shops"]["Row"] & {
    exchange_chains: Database["public"]["Tables"]["exchange_chains"]["Row"] | null;
    shop_business_hours: Database["public"]["Tables"]["shop_business_hours"]["Row"][];
    exchange_rates: Database["public"]["Tables"]["exchange_rates"]["Row"][];
  };

export type Currency = Database["public"]["Tables"]["currencies"]["Row"];
export type ExchangeRate =
  Database["public"]["Tables"]["exchange_rates"]["Row"];
