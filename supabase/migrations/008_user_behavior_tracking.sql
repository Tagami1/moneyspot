-- =============================================
-- ユーザー行動記録テーブル
-- =============================================

-- 1. お気に入り（localStorageからDB保存へ移行）
CREATE TABLE user_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, shop_id)
);

-- 2. 店舗閲覧履歴（localStorageからDB保存へ移行）
CREATE TABLE user_view_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id INT NOT NULL REFERENCES exchange_shops(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_view_history_user_time ON user_view_history(user_id, viewed_at DESC);

-- 3. ユーザーイベント（検索、フィルター、ページビュー等の軽量アナリティクス）
CREATE TABLE user_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  -- event_type: 'currency_select', 'filter_change', 'search',
  --             'shop_detail_open', 'page_view', 'simulation_open'
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_events_user ON user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_type ON user_events(event_type, created_at DESC);

-- RLSポリシー
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_view_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ操作可能
CREATE POLICY "Users manage own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own view history"
  ON user_view_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);
