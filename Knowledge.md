# Knowledge（参考情報）

## 関連ファイル・コード
- `supabase/migrations/` — DBマイグレーション（新カラム追加先）
- `workers/scraper/` — 既存のスクレイパー（日本の店舗用）
- `src/app/page.tsx` — フロントのデータ取得（get_nearby_shop_ids RPC使用）
- `supabase/migrations/009_postgis_nearby_shops.sql` — PostGIS + 20km圏内フィルタ

## 技術的な判断とその理由
- OpenStreetMap選択 → 無料で世界中の両替ショップ位置データが取れる。Google Maps APIだと月額費用がかかる
- Overpass API → OSMデータをクエリするための標準API。地域ごとに分割リクエストすればレート制限内で運用可能
- データソース区別 → 既存の日本店舗（スクレイピング）とOSM店舗を混在させるため、source カラムで区別
- 参考レート → 実店舗レートがない店舗でも「だいたいのレート」を表示することでユーザー体験を維持

## 前提・想定
- OSM Overpass APIのデータ（確認済み）: 東京43件、ロンドン153件、バンコク97件、パリ90件
- Travelexは30カ国以上に展開、Webサイトでレートを公開している
- 参考レートAPI（open.er-api.com）は無料で1日1500リクエスト
- 既存のPostGIS get_nearby_shop_ids関数はそのまま使える（geogカラム + GISTインデックス）

## 収益化実装メモ
- `exchange_shops.is_promoted`, `promoted_rank`, `promoted_until` でおすすめ店舗を制御する
- Web/Expoともおすすめ店舗を上位表示し、カードに「おすすめ」バッジを出す
- `user_premium_subscriptions` はPremium状態の保存用。Stripe / RevenueCat連携時に provider 系IDを入れる
- Expo版はRevenueCat本番連携前のため、現状はAsyncStorageベースの購入テスト用プレースホルダー
- Web版は `user_premium_subscriptions` を読んでPremiumなら広告を非表示にする

## 参考リンク
- Overpass API: https://overpass-api.de/
- OSM wiki bureau_de_change: https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbureau_de_change
- open.er-api.com: https://open.er-api.com/
