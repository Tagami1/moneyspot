-- MoneySpot 初期データベース構築

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
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=日曜
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
  buy_rate DECIMAL(12,4),  -- 外貨→円（店が買う）
  sell_rate DECIMAL(12,4), -- 円→外貨（店が売る）
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

-- 最新レートビュー
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

-- 読み取り専用ポリシー（anon key用）
CREATE POLICY "Allow public read" ON currencies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_chains FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_shops FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shop_business_hours FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shop_currencies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON exchange_rates FOR SELECT USING (true);
