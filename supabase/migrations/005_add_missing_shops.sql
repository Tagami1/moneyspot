-- 新しいチェーン追加
INSERT INTO exchange_chains (id, name, name_en, website_url) VALUES
  (14, '甲南チケット', 'Konan Ticket', 'https://www.kounan.com/exchange/'),
  (15, 'ビューカード外貨両替センター', 'View Card Exchange Center', 'https://www.jreast.co.jp/'),
  (16, 'チケッティ', 'Tickety', 'https://tickety.jp/'),
  (17, 'ミツミネ', 'Mitsumine', NULL)
ON CONFLICT (id) DO NOTHING;

-- 追加店舗（銀行・機械・大黒屋を除く）
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES

  -- トラベレックス 追加店舗
  (2, 'トラベレックス ヤエチカ店', 'Travelex Yaechika', '中央区八重洲2-1 八重洲地下街中4号', 'Chuo-ku, Yaesu 2-1, Yaesu Underground Mall', 35.6800, 139.7705, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 京成上野店', 'Travelex Keisei Ueno', '台東区上野公園 京成上野駅構内', 'Taito-ku, Ueno Park, Keisei Ueno Station', 35.7105, 139.7740, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 東京駅日本橋口店', 'Travelex Tokyo Sta. Nihonbashi', '千代田区丸の内1-9-1 東京駅日本橋口', 'Chiyoda-ku, Marunouchi 1-9-1, Tokyo Sta. Nihonbashi Exit', 35.6825, 139.7710, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 渋谷マークシティ店', 'Travelex Shibuya Mark City', '渋谷区道玄坂1-12-1 渋谷マークシティ1F', 'Shibuya-ku, Dogenzaka 1-12-1, Shibuya Mark City 1F', 35.6580, 139.6985, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 池袋東口店', 'Travelex Ikebukuro East', '豊島区南池袋1-28-2', 'Toshima-ku, Minami-Ikebukuro 1-28-2', 35.7295, 139.7130, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 品川駅店', 'Travelex Shinagawa Sta.', '港区高輪3-26-27 JR品川駅構内', 'Minato-ku, Takanawa 3-26-27, JR Shinagawa Station', 35.6287, 139.7390, NULL, 'https://www.travelex.co.jp/', 'specialist'),

  -- ワールドカレンシーショップ 追加店舗
  (3, 'ワールドカレンシーショップ 渋谷店', 'World Currency Shop Shibuya', '渋谷区道玄坂2-3-2 第1大外ビル7階', 'Shibuya-ku, Dogenzaka 2-3-2, Daiichi Taigai Bldg 7F', 35.6590, 139.6990, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ 東京駅八重洲北口店', 'World Currency Shop Tokyo Sta. Yaesu North', '中央区八重洲1-5-9 八重洲アメレックスビル1F', 'Chuo-ku, Yaesu 1-5-9, Yaesu Amerex Bldg 1F', 35.6815, 139.7700, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ 池袋店', 'World Currency Shop Ikebukuro', '豊島区西池袋1-11-1 メトロポリタンプラザ1F', 'Toshima-ku, Nishi-Ikebukuro 1-11-1, Metropolitan Plaza 1F', 35.7280, 139.7095, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),

  -- SAKURA CURRENCY 追加店舗
  (8, 'SAKURA CURRENCY 銀座店', 'SAKURA CURRENCY Ginza', '中央区銀座3-3-1 ZOE銀座5F', 'Chuo-ku, Ginza 3-3-1, ZOE Ginza 5F', 35.6710, 139.7650, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 六本木店', 'SAKURA CURRENCY Roppongi', '港区六本木3-14-12', 'Minato-ku, Roppongi 3-14-12', 35.6620, 139.7340, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 渋谷店', 'SAKURA CURRENCY Shibuya', '渋谷区宇田川町33-1', 'Shibuya-ku, Udagawacho 33-1', 35.6610, 139.6970, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 池袋店', 'SAKURA CURRENCY Ikebukuro', '豊島区南池袋2-26-7', 'Toshima-ku, Minami-Ikebukuro 2-26-7', 35.7275, 139.7135, NULL, 'https://sakura-currency.co.jp/', 'specialist'),

  -- インターバンク 追加店舗
  (6, 'インターバンク 秋葉原店', 'Interbank Akihabara', '千代田区外神田1-15-18', 'Chiyoda-ku, Sotokanda 1-15-18', 35.6985, 139.7715, NULL, 'https://www.interbank.co.jp/', 'specialist'),

  -- エクスチェンジャーズ 追加店舗
  (7, 'エクスチェンジャーズ 渋谷店', 'Exchangers Shibuya', '渋谷区道玄坂2-25-7 プロスパー道玄坂5F', 'Shibuya-ku, Dogenzaka 2-25-7, Prosper Dogenzaka 5F', 35.6585, 139.6965, NULL, 'https://www.exchangers.co.jp/', 'specialist'),

  -- ドルレンジャー / チケットレンジャー 追加店舗
  (9, 'チケットレンジャー 上野店', 'Ticket Ranger Ueno', '台東区上野6-4-12', 'Taito-ku, Ueno 6-4-12', 35.7110, 139.7750, NULL, 'https://www.ticketlife.jp/exchange/', 'ticket_shop'),
  (9, 'チケットレンジャー 渋谷店', 'Ticket Ranger Shibuya', '渋谷区宇田川町31-1', 'Shibuya-ku, Udagawacho 31-1', 35.6608, 139.6975, NULL, 'https://www.ticketlife.jp/exchange/', 'ticket_shop'),
  (9, 'チケットレンジャー 池袋店', 'Ticket Ranger Ikebukuro', '豊島区南池袋1-22-5', 'Toshima-ku, Minami-Ikebukuro 1-22-5', 35.7290, 139.7120, NULL, 'https://www.ticketlife.jp/exchange/', 'ticket_shop'),

  -- J・マーケット 追加店舗
  (10, 'J・マーケット 渋谷店', 'J-Market Shibuya', '渋谷区道玄坂2-5-8', 'Shibuya-ku, Dogenzaka 2-5-8', 35.6585, 139.6980, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (10, 'J・マーケット 上野店', 'J-Market Ueno', '台東区上野4-4-4', 'Taito-ku, Ueno 4-4-4', 35.7108, 139.7742, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (10, 'J・マーケット 池袋店', 'J-Market Ikebukuro', '豊島区南池袋1-21-5', 'Toshima-ku, Minami-Ikebukuro 1-21-5', 35.7288, 139.7118, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (10, 'J・マーケット 銀座店', 'J-Market Ginza', '中央区銀座5-8-5', 'Chuo-ku, Ginza 5-8-5', 35.6705, 139.7640, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),

  -- アクセスチケット 追加店舗
  (11, 'アクセスチケット 新宿思い出横丁店', 'Access Ticket Shinjuku Omoide Yokocho', '新宿区西新宿1-2-13', 'Shinjuku-ku, Nishi-Shinjuku 1-2-13', 35.6938, 139.6988, NULL, 'https://www.access-ticket.com/', 'ticket_shop'),
  (11, 'アクセスチケット 渋谷店', 'Access Ticket Shibuya', '渋谷区宇田川町23-3', 'Shibuya-ku, Udagawacho 23-3', 35.6612, 139.6978, NULL, 'https://www.access-ticket.com/', 'ticket_shop'),
  (11, 'アクセスチケット 上野店', 'Access Ticket Ueno', '台東区上野6-9-9', 'Taito-ku, Ueno 6-9-9', 35.7112, 139.7748, NULL, 'https://www.access-ticket.com/', 'ticket_shop'),

  -- ビューカード外貨両替センター（トラベレックス運営）
  (15, 'ビューカード外貨両替 JR品川駅店', 'View Card Exchange JR Shinagawa', '港区高輪3-26-27 JR品川駅構内', 'Minato-ku, Takanawa 3-26-27, JR Shinagawa Station', 35.6285, 139.7387, NULL, 'https://www.jreast.co.jp/', 'specialist'),
  (15, 'ビューカード外貨両替 JR新宿駅新南店', 'View Card Exchange JR Shinjuku Shin-Minami', '渋谷区千駄ヶ谷5-24-55 JR新宿駅新南改札横', 'Shibuya-ku, Sendagaya 5-24-55, JR Shinjuku Shin-Minami', 35.6880, 139.7015, NULL, 'https://www.jreast.co.jp/', 'specialist'),
  (15, 'ビューカード外貨両替 JR東京駅店', 'View Card Exchange JR Tokyo Sta.', '千代田区丸の内1-9-1 JR東京駅構内', 'Chiyoda-ku, Marunouchi 1-9-1, JR Tokyo Station', 35.6812, 139.7671, NULL, 'https://www.jreast.co.jp/', 'specialist'),

  -- 甲南チケット
  (14, '甲南チケット 新宿西口思い出横丁店', 'Konan Ticket Shinjuku Omoide Yokocho', '新宿区西新宿1-2-13', 'Shinjuku-ku, Nishi-Shinjuku 1-2-13', 35.6937, 139.6987, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop'),
  (14, '甲南チケット 新宿南口店', 'Konan Ticket Shinjuku South', '新宿区新宿3-35-2', 'Shinjuku-ku, Shinjuku 3-35-2', 35.6890, 139.7010, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop'),

  -- チケッティ
  (16, 'チケッティ 新宿店', 'Tickety Shinjuku', '新宿区新宿3-27-4', 'Shinjuku-ku, Shinjuku 3-27-4', 35.6915, 139.7030, NULL, 'https://tickety.jp/', 'ticket_shop'),
  (16, 'チケッティ 渋谷店', 'Tickety Shibuya', '渋谷区宇田川町26-5', 'Shibuya-ku, Udagawacho 26-5', 35.6615, 139.6972, NULL, 'https://tickety.jp/', 'ticket_shop'),
  (16, 'チケッティ 池袋店', 'Tickety Ikebukuro', '豊島区南池袋1-27-8', 'Toshima-ku, Minami-Ikebukuro 1-27-8', 35.7292, 139.7125, NULL, 'https://tickety.jp/', 'ticket_shop');
