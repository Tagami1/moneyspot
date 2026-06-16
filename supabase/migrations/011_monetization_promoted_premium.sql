-- =============================================
-- MoneySpot monetization: promoted shops + premium plans
-- =============================================

-- 店舗おすすめ広告: 有料掲載店舗を上位表示するためのフラグ
ALTER TABLE exchange_shops
  ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promoted_rank INTEGER,
  ADD COLUMN IF NOT EXISTS promoted_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_exchange_shops_promoted
  ON exchange_shops (is_promoted, promoted_rank, promoted_until)
  WHERE is_promoted = TRUE;

-- プレミアムプラン: Stripe / RevenueCat 連携前でも状態を保持できる土台
CREATE TABLE IF NOT EXISTS user_premium_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  provider VARCHAR(30) NOT NULL DEFAULT 'manual',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own premium subscription"
  ON user_premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_premium_status
  ON user_premium_subscriptions (status, current_period_end);

DROP TRIGGER IF EXISTS trigger_user_premium_subscriptions_updated_at
  ON user_premium_subscriptions;

CREATE TRIGGER trigger_user_premium_subscriptions_updated_at
  BEFORE UPDATE ON user_premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
