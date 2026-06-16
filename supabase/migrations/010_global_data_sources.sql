-- データソース区別カラム追加
ALTER TABLE exchange_shops ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual';
ALTER TABLE exchange_shops ADD COLUMN IF NOT EXISTS osm_id BIGINT UNIQUE;
ALTER TABLE exchange_shops ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- 既存データは 'scraper' としてマーク
UPDATE exchange_shops SET source = 'scraper' WHERE source = 'manual';

-- レートの種類を区別（実レート vs 参考レート）
ALTER TABLE exchange_rates ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) NOT NULL DEFAULT 'actual';

-- sourceのインデックス
CREATE INDEX IF NOT EXISTS idx_exchange_shops_source ON exchange_shops(source);
CREATE INDEX IF NOT EXISTS idx_exchange_shops_osm_id ON exchange_shops(osm_id) WHERE osm_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exchange_shops_country ON exchange_shops(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exchange_rates_type ON exchange_rates(rate_type);

-- sourceのチェック制約
ALTER TABLE exchange_shops ADD CONSTRAINT chk_shop_source
  CHECK (source IN ('scraper', 'osm', 'manual', 'user'));

-- rate_typeのチェック制約
ALTER TABLE exchange_rates ADD CONSTRAINT chk_rate_type
  CHECK (rate_type IN ('actual', 'reference', 'user_reported'));
