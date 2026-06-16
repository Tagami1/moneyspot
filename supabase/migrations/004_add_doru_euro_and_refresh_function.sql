-- ドルユーロ（オンライン専業）をチェーン・店舗マスタに追加
-- + マテリアライズドビューリフレッシュ用RPC関数

-- ドルユーロ チェーン追加
INSERT INTO exchange_chains (id, name, name_en, website_url) VALUES
  (14, 'ドルユーロ', 'Doru Euro', 'https://doru.jp');

-- ドルユーロ 仮想店舗（オンライン専業のため、東京駅を代表地点として登録）
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (14, 'ドルユーロ（オンライン）', 'Doru Euro (Online)', '郵送での両替（オンライン専業）', 'Mail-based exchange (Online only)', 35.6812, 139.7671, NULL, 'https://doru.jp', 'specialist');

-- マテリアライズドビューをリフレッシュするRPC関数
-- Workers から POST /rest/v1/rpc/refresh_rates_latest で呼び出す
CREATE OR REPLACE FUNCTION refresh_rates_latest()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY exchange_rates_latest;
END;
$$;
