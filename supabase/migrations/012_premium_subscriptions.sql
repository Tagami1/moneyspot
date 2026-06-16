-- プレミアムサブスクリプション管理テーブル
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'trial', 'cancelled')),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  revenuecat_customer_id VARCHAR(255),
  revenuecat_original_transaction_id VARCHAR(255),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON user_subscriptions(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_revenuecat
  ON user_subscriptions(revenuecat_customer_id)
  WHERE revenuecat_customer_id IS NOT NULL;

-- RLS: ユーザーは自分のサブスクリプションのみ参照可能
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- レートアラート設定テーブル（Premium機能）
CREATE TABLE IF NOT EXISTS rate_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code VARCHAR(10) NOT NULL,
  threshold_rate NUMERIC(12, 4) NOT NULL,
  direction VARCHAR(10) NOT NULL DEFAULT 'below' CHECK (direction IN ('below', 'above')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_alerts_user
  ON rate_alerts(user_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_rate_alerts_currency
  ON rate_alerts(currency_code)
  WHERE is_active = true;

ALTER TABLE rate_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON rate_alerts FOR ALL
  USING (auth.uid() = user_id);
