-- ============================================
-- MoneySpot 全テーブル作成 + 初期データ投入
-- Supabase SQL Editor に貼り付けて実行してください
-- ============================================

-- 通貨マスタ
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  name_ja VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  symbol VARCHAR(5) NOT NULL,
  flag_emoji VARCHAR(10) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 両替チェーンマスタ
CREATE TABLE exchange_chains (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 両替所マスタ
CREATE TABLE exchange_shops (
  id SERIAL PRIMARY KEY,
  chain_id INT REFERENCES exchange_chains(id),
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  address VARCHAR(500) NOT NULL,
  address_en VARCHAR(500) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone VARCHAR(20),
  website_url TEXT,
  shop_type VARCHAR(20) NOT NULL CHECK (shop_type IN ('specialist', 'ticket_shop', 'bank', 'atm', 'hotel')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 営業時間
CREATE TABLE shop_business_hours (
  id SERIAL PRIMARY KEY,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(shop_id, day_of_week)
);

-- 臨時休業日
CREATE TABLE shop_holidays (
  id SERIAL PRIMARY KEY,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  holiday_date DATE NOT NULL,
  reason VARCHAR(200),
  UNIQUE(shop_id, holiday_date)
);

-- 取扱通貨
CREATE TABLE shop_currencies (
  id SERIAL PRIMARY KEY,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
  UNIQUE(shop_id, currency_code)
);

-- 為替レート履歴
CREATE TABLE exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  currency_code VARCHAR(3) NOT NULL REFERENCES currencies(code),
  buy_rate DECIMAL(12,4),
  sell_rate DECIMAL(12,4),
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- スクレイピングログ
CREATE TABLE scraping_logs (
  id BIGSERIAL PRIMARY KEY,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'parse_error')),
  currencies_count INT DEFAULT 0,
  error_message TEXT,
  duration_ms INT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_exchange_rates_shop_currency ON exchange_rates(shop_id, currency_code);
CREATE INDEX idx_exchange_rates_fetched_at ON exchange_rates(fetched_at DESC);
CREATE INDEX idx_exchange_shops_location ON exchange_shops(lat, lng);
CREATE INDEX idx_exchange_shops_active ON exchange_shops(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_scraping_logs_shop ON scraping_logs(shop_id, executed_at DESC);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exchange_shops_updated_at
  BEFORE UPDATE ON exchange_shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLSポリシー
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON currencies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_chains FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_shops FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shop_business_hours FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shop_currencies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_rates FOR SELECT USING (true);

-- ============================================
-- 通貨マスタデータ
-- ============================================
INSERT INTO currencies (code, name_ja, name_en, symbol, flag_emoji, sort_order) VALUES
  ('USD', '米ドル', 'US Dollar', '$', '🇺🇸', 1),
  ('EUR', 'ユーロ', 'Euro', '€', '🇪🇺', 2),
  ('GBP', '英ポンド', 'British Pound', '£', '🇬🇧', 3),
  ('AUD', '豪ドル', 'Australian Dollar', 'A$', '🇦🇺', 4),
  ('CAD', 'カナダドル', 'Canadian Dollar', 'C$', '🇨🇦', 5),
  ('CHF', 'スイスフラン', 'Swiss Franc', 'CHF', '🇨🇭', 6),
  ('CNY', '中国人民元', 'Chinese Yuan', '¥', '🇨🇳', 7),
  ('KRW', '韓国ウォン', 'South Korean Won', '₩', '🇰🇷', 8),
  ('TWD', '台湾ドル', 'Taiwan Dollar', 'NT$', '🇹🇼', 9),
  ('HKD', '香港ドル', 'Hong Kong Dollar', 'HK$', '🇭🇰', 10),
  ('SGD', 'シンガポールドル', 'Singapore Dollar', 'S$', '🇸🇬', 11),
  ('THB', 'タイバーツ', 'Thai Baht', '฿', '🇹🇭', 12),
  ('PHP', 'フィリピンペソ', 'Philippine Peso', '₱', '🇵🇭', 13),
  ('IDR', 'インドネシアルピア', 'Indonesian Rupiah', 'Rp', '🇮🇩', 14),
  ('VND', 'ベトナムドン', 'Vietnamese Dong', '₫', '🇻🇳', 15),
  ('MYR', 'マレーシアリンギット', 'Malaysian Ringgit', 'RM', '🇲🇾', 16);

-- ============================================
-- チェーンマスタ + 店舗データ
-- ============================================
INSERT INTO exchange_chains (id, name, name_en, website_url) VALUES
  (1, '大黒屋', 'Daikokuya', 'https://gaika.e-daikoku.com/'),
  (2, 'トラベレックス', 'Travelex', 'https://www.travelex.co.jp/'),
  (3, 'ワールドカレンシーショップ', 'World Currency Shop', 'https://www.tokyo-card.co.jp/wcs/'),
  (4, 'GPA', 'GPA', 'https://www.gpa-net.co.jp/'),
  (5, 'ドルレンジャー', 'Dollar Ranger', 'https://d-ranger.jp/'),
  (6, 'インターバンク', 'Interbank', 'https://www.interbank.co.jp/'),
  (7, 'エクスチェンジャーズ', 'Exchangers', 'https://www.exchangers.co.jp/'),
  (8, 'SAKURA CURRENCY', 'SAKURA CURRENCY', 'https://sakura-currency.co.jp/'),
  (9, 'チケットレンジャー', 'Ticket Ranger', 'https://www.ticketlife.jp/exchange/'),
  (10, 'J・マーケット', 'J-Market', 'https://j-market.co.jp/gaika'),
  (11, 'アクセスチケット', 'Access Ticket', 'https://www.access-ticket.com/'),
  (12, 'SMART EXCHANGE', 'SMART EXCHANGE', 'https://smartexchange.jp/'),
  (13, 'SBJ銀行', 'SBJ Bank', 'https://www.sbjbank.co.jp/');

INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス グランスタ店', 'Travelex GranSta', '千代田区丸の内1-9-1 JR東京駅地下1階', 'Chiyoda-ku, Marunouchi 1-9-1, JR Tokyo Station B1F', 35.6812, 139.7671, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 丸の内店', 'World Currency Shop Marunouchi', '千代田区丸の内1 三菱UFJ信託銀行本店ビル1階', 'Chiyoda-ku, Marunouchi 1, MUFG Trust Bank HQ Bldg 1F', 35.6825, 139.7648, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (7, 'エクスチェンジャーズ 丸の内店', 'Exchangers Marunouchi', '千代田区丸の内3-3-1 新東京ビル1階', 'Chiyoda-ku, Marunouchi 3-3-1, Shin-Tokyo Bldg 1F', 35.6790, 139.7640, NULL, 'https://www.exchangers.co.jp/', 'specialist'),
  (5, 'ドルレンジャー 東京駅前店', 'Dollar Ranger Tokyo Station', '中央区八重洲1-9-8', 'Chuo-ku, Yaesu 1-9-8', 35.6810, 139.7700, NULL, 'https://d-ranger.jp/', 'specialist'),
  (1, '大黒屋 東京駅前店', 'Daikokuya Tokyo Station', '中央区八重洲1-6-19 第二大黒ビル1F', 'Chuo-ku, Yaesu 1-6-19, Daini Daikoku Bldg 1F', 35.6808, 139.7705, NULL, 'https://gaika.e-daikoku.com/', 'ticket_shop'),
  (10, 'J・マーケット ヤエチカ店', 'J-Market Yaechika', '中央区八重洲2-1 八重洲地下街', 'Chuo-ku, Yaesu 2-1, Yaesu Underground Mall', 35.6795, 139.7710, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (5, 'ドルレンジャー 銀座3丁目店', 'Dollar Ranger Ginza', '中央区銀座3-2-13 江戸常ビル1階', 'Chuo-ku, Ginza 3-2-13, Edotsune Bldg 1F', 35.6720, 139.7660, NULL, 'https://d-ranger.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 松屋銀座店', 'World Currency Shop Matsuya Ginza', '中央区銀座3-6-1 松屋銀座8階', 'Chuo-ku, Ginza 3-6-1, Matsuya Ginza 8F', 35.6715, 139.7680, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ 有楽町店', 'World Currency Shop Yurakucho', '千代田区有楽町2-10-1 東京交通会館2階', 'Chiyoda-ku, Yurakucho 2-10-1, Tokyo Kotsu Kaikan 2F', 35.6745, 139.7630, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (2, 'トラベレックス 京王新宿店', 'Travelex Keio Shinjuku', '新宿区西新宿1 京王モール内', 'Shinjuku-ku, Nishi-Shinjuku 1, Keio Mall', 35.6896, 139.6994, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 新宿西口店', 'World Currency Shop Shinjuku West', '新宿区西新宿1付近', 'Shinjuku-ku, Nishi-Shinjuku 1', 35.6920, 139.6990, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (5, 'ドルレンジャー 新宿西口店', 'Dollar Ranger Shinjuku West', '新宿区西新宿7-1-2 川安ビル1階', 'Shinjuku-ku, Nishi-Shinjuku 7-1-2, Kawayasu Bldg 1F', 35.6940, 139.6980, NULL, 'https://d-ranger.jp/', 'specialist'),
  (6, 'インターバンク 新宿店', 'Interbank Shinjuku', '新宿区西新宿1-2-12 思い出横丁', 'Shinjuku-ku, Nishi-Shinjuku 1-2-12, Omoide Yokocho', 35.6935, 139.6985, NULL, 'https://www.interbank.co.jp/', 'specialist'),
  (1, '大黒屋 質新宿東口店', 'Daikokuya Shinjuku East', '新宿区新宿3-24-7 FK324ビル', 'Shinjuku-ku, Shinjuku 3-24-7, FK324 Bldg', 35.6910, 139.7010, NULL, 'https://gaika.e-daikoku.com/', 'ticket_shop'),
  (10, 'J・マーケット 新宿サブナード店', 'J-Market Shinjuku Subnade', '新宿区歌舞伎町1 新宿サブナード内', 'Shinjuku-ku, Kabukicho 1, Shinjuku Subnade', 35.6930, 139.7030, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (8, 'SAKURA CURRENCY 新宿店', 'SAKURA CURRENCY Shinjuku', '新宿区新宿5-17-11', 'Shinjuku-ku, Shinjuku 5-17-11', 35.6945, 139.7060, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (2, 'トラベレックス 渋谷マークシティ店', 'Travelex Shibuya Mark City', '渋谷区道玄坂1 渋谷マークシティ内', 'Shibuya-ku, Dogenzaka 1, Shibuya Mark City', 35.6580, 139.6985, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 渋谷店', 'SAKURA CURRENCY Shibuya', '渋谷区宇田川町付近', 'Shibuya-ku, Udagawacho', 35.6610, 139.6980, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 上野マルイ店', 'World Currency Shop Ueno Marui', '台東区上野6-15-1 上野マルイ内', 'Taito-ku, Ueno 6-15-1, Ueno Marui', 35.7115, 139.7745, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (2, 'トラベレックス 浅草店', 'Travelex Asakusa', '台東区浅草付近', 'Taito-ku, Asakusa', 35.7120, 139.7965, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 上野アメ横店', 'SAKURA CURRENCY Ueno Ameyoko', '台東区上野付近', 'Taito-ku, Ueno, Ameyoko', 35.7100, 139.7740, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 浅草店', 'SAKURA CURRENCY Asakusa', '台東区花川戸2-3-10 酒井ビル302', 'Taito-ku, Hanakawado 2-3-10, Sakai Bldg 302', 35.7130, 139.7970, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (2, 'ビューカード外貨両替 JR池袋駅店', 'View Card Exchange JR Ikebukuro', '豊島区南池袋1 JR池袋駅中央通路東側', 'Toshima-ku, Minami-Ikebukuro 1, JR Ikebukuro Stn', 35.7295, 139.7109, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (10, 'J・マーケット 池袋店', 'J-Market Ikebukuro', '豊島区西池袋1 池袋ショッピングパーク内', 'Toshima-ku, Nishi-Ikebukuro 1, Ikebukuro SP', 35.7300, 139.7100, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (2, 'トラベレックス 秋葉原店', 'Travelex Akihabara', '千代田区外神田付近', 'Chiyoda-ku, Sotokanda', 35.6984, 139.7731, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (11, 'アクセスチケット 秋葉原店', 'Access Ticket Akihabara', '千代田区外神田付近', 'Chiyoda-ku, Sotokanda', 35.6990, 139.7710, NULL, 'https://www.access-ticket.com/', 'ticket_shop'),
  (10, 'J・マーケット 品川駅前店', 'J-Market Shinagawa', '港区高輪付近', 'Minato-ku, Takanawa', 35.6284, 139.7387, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (7, 'エクスチェンジャーズ 新橋店', 'Exchangers Shinbashi', '港区新橋1-16-6 新橋柳屋ビル3階', 'Minato-ku, Shinbashi 1-16-6, Shinbashi Yanagiya Bldg 3F', 35.6660, 139.7580, NULL, 'https://www.exchangers.co.jp/', 'specialist'),
  (2, 'トラベレックス 羽田空港第3ターミナル店', 'Travelex Haneda T3', '大田区羽田空港2 第3ターミナル', 'Ota-ku, Haneda Airport 2, Terminal 3', 35.5494, 139.7798, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (13, 'SBJ銀行 羽田空港第3ターミナル店', 'SBJ Bank Haneda T3', '大田区羽田空港2 第3ターミナル', 'Ota-ku, Haneda Airport 2, Terminal 3', 35.5494, 139.7798, NULL, 'https://www.sbjbank.co.jp/', 'bank');

-- ============================================
-- 最新レートビュー（レートデータ投入後に使用）
-- ============================================
CREATE MATERIALIZED VIEW exchange_rates_latest AS
SELECT DISTINCT ON (shop_id, currency_code)
  shop_id,
  currency_code,
  buy_rate,
  sell_rate,
  fetched_at
FROM exchange_rates
ORDER BY shop_id, currency_code, fetched_at DESC;

CREATE UNIQUE INDEX idx_rates_latest_shop_currency
  ON exchange_rates_latest(shop_id, currency_code);

-- ============================================
-- PostGIS + 半径検索（20km圏内フィルタ）
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE exchange_shops ADD COLUMN geog geography(POINT, 4326);
UPDATE exchange_shops SET geog = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
CREATE INDEX idx_shops_geog ON exchange_shops USING GIST(geog);

-- lat/lng変更時にgeogを自動同期するトリガー
CREATE OR REPLACE FUNCTION sync_shop_geog()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_shop_geog
  BEFORE INSERT OR UPDATE OF lat, lng ON exchange_shops
  FOR EACH ROW EXECUTE FUNCTION sync_shop_geog();

-- 半径検索RPC関数
CREATE OR REPLACE FUNCTION get_nearby_shop_ids(
  user_lat double precision,
  user_lng double precision,
  radius_m integer DEFAULT 20000
)
RETURNS TABLE(shop_id integer, distance_m double precision) AS $$
  SELECT
    id AS shop_id,
    ST_Distance(geog, ST_MakePoint(user_lng, user_lat)::geography) AS distance_m
  FROM exchange_shops
  WHERE is_active = TRUE
    AND ST_DWithin(geog, ST_MakePoint(user_lng, user_lat)::geography, radius_m)
  ORDER BY distance_m;
$$ LANGUAGE sql STABLE;

-- 完了
SELECT 'Setup complete! Tables: ' || count(*)::text || ' tables created'
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
