-- 主要通貨マスタデータ
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
