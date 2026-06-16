-- PostGIS拡張の有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- geographyカラム追加
ALTER TABLE exchange_shops ADD COLUMN geog geography(POINT, 4326);

-- 既存のlat/lngデータからgeographyカラムを生成
UPDATE exchange_shops
SET geog = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;

-- 空間インデックス（GISTインデックスで高速な半径検索）
CREATE INDEX idx_shops_geog ON exchange_shops USING GIST(geog);

-- 今後のINSERT/UPDATEでgeogを自動更新するトリガー
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
-- ユーザーの位置から指定半径（デフォルト20km）以内のアクティブなショップIDを返す
-- 距離順にソート済み
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
