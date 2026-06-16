-- レート履歴テーブル（プレミアムユーザーのグラフ表示用）
-- スクレイパーが定期実行時に INSERT するテーブル
CREATE TABLE IF NOT EXISTS rate_history (
  id BIGSERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  currency_code VARCHAR(10) NOT NULL,
  sell_rate NUMERIC(12, 4),
  buy_rate NUMERIC(12, 4),
  rate_type VARCHAR(20) NOT NULL DEFAULT 'actual',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- パーティションの代わりにインデックスで高速化
CREATE INDEX IF NOT EXISTS idx_rate_history_shop_currency
  ON rate_history(shop_id, currency_code, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_history_currency_recent
  ON rate_history(currency_code, recorded_at DESC);

-- 古いデータの自動削除（90日以上前を削除）
-- Supabase pg_cron 拡張を使う場合：
-- SELECT cron.schedule('delete-old-rate-history', '0 3 * * *',
--   'DELETE FROM rate_history WHERE recorded_at < now() - interval ''90 days''');

-- プレミアムユーザーのみ参照可能にする関数
CREATE OR REPLACE FUNCTION is_premium(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = uid
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS: プレミアムユーザーのみアクセス可能（将来的に制限する場合）
-- 現状は全ユーザーに公開（グラフデータは読み取り専用）
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rate history"
  ON rate_history FOR SELECT
  USING (true);
