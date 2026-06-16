-- 両替チェーンマスタ
INSERT INTO exchange_chains (id, name, name_en, website_url) VALUES
  (1, '大黒屋', 'Daikokuya', 'https://gaika.e-daikoku.com/'),
  (2, 'トラベレックス', 'Travelex', 'https://www.travelex.co.jp/'),
  (3, 'ワールドカレンシーショップ', 'World Currency Shop', 'https://www.tokyo-card.co.jp/wcs/'),
  (4, 'GPA', 'GPA', 'https://www.gpa-net.co.jp/'),
  (5, 'ドルレンジャー', 'Dollar Ranger', 'https://d-ranger.jp/'),
  (6, 'インターバンク', 'Interbank', 'https://www.interbank.co.jp/'),
  (7, 'エクスチェンジャーズ', 'Exchangers', 'https://www.exchangers.co.jp/'),
  (8, 'SAKURA CURRENCY', 'SAKURA CURRENCY', 'https://sakura-currency.co.jp/'),
  (9, 'チケットレンジャー', 'Ticket Ranger', 'https://www.ticketlife.jp/exchange/'),
  (10, 'J・マーケット', 'J-Market', 'https://j-market.co.jp/gaika'),
  (11, 'アクセスチケット', 'Access Ticket', 'https://www.access-ticket.com/'),
  (12, 'SMART EXCHANGE', 'SMART EXCHANGE', 'https://smartexchange.jp/'),
  (13, 'SBJ銀行', 'SBJ Bank', 'https://www.sbjbank.co.jp/');

-- 両替所マスタ（主要店舗）
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  -- 東京駅・丸の内エリア
  (2, 'トラベレックス グランスタ店', 'Travelex GranSta', '千代田区丸の内1-9-1 JR東京駅地下1階', 'Chiyoda-ku, Marunouchi 1-9-1, JR Tokyo Station B1F', 35.6812, 139.7671, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 丸の内店', 'World Currency Shop Marunouchi', '千代田区丸の内1 三菱UFJ信託銀行本店ビル1階', 'Chiyoda-ku, Marunouchi 1, MUFG Trust Bank HQ Bldg 1F', 35.6825, 139.7648, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (7, 'エクスチェンジャーズ 丸の内店', 'Exchangers Marunouchi', '千代田区丸の内3-3-1 新東京ビル1階', 'Chiyoda-ku, Marunouchi 3-3-1, Shin-Tokyo Bldg 1F', 35.6790, 139.7640, NULL, 'https://www.exchangers.co.jp/', 'specialist'),
  (5, 'ドルレンジャー 東京駅前店', 'Dollar Ranger Tokyo Station', '中央区八重洲1-9-8', 'Chuo-ku, Yaesu 1-9-8', 35.6810, 139.7700, NULL, 'https://d-ranger.jp/', 'specialist'),
  (1, '大黒屋 東京駅前店', 'Daikokuya Tokyo Station', '中央区八重洲1-6-19 第二大黒ビル1F', 'Chuo-ku, Yaesu 1-6-19, Daini Daikoku Bldg 1F', 35.6808, 139.7705, NULL, 'https://gaika.e-daikoku.com/', 'ticket_shop'),
  (10, 'J・マーケット ヤエチカ店', 'J-Market Yaechika', '中央区八重洲2-1 八重洲地下街', 'Chuo-ku, Yaesu 2-1, Yaesu Underground Mall', 35.6795, 139.7710, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),

  -- 銀座・有楽町エリア
  (5, 'ドルレンジャー 銀座3丁目店', 'Dollar Ranger Ginza', '中央区銀座3-2-13 江戸常ビル1階', 'Chuo-ku, Ginza 3-2-13, Edotsune Bldg 1F', 35.6720, 139.7660, NULL, 'https://d-ranger.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 松屋銀座店', 'World Currency Shop Matsuya Ginza', '中央区銀座3-6-1 松屋銀座8階', 'Chuo-ku, Ginza 3-6-1, Matsuya Ginza 8F', 35.6715, 139.7680, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ 有楽町店', 'World Currency Shop Yurakucho', '千代田区有楽町2-10-1 東京交通会館2階', 'Chiyoda-ku, Yurakucho 2-10-1, Tokyo Kotsu Kaikan 2F', 35.6745, 139.7630, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),

  -- 新宿エリア
  (2, 'トラベレックス 京王新宿店', 'Travelex Keio Shinjuku', '新宿区西新宿1 京王モール内', 'Shinjuku-ku, Nishi-Shinjuku 1, Keio Mall', 35.6896, 139.6994, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 新宿西口店', 'World Currency Shop Shinjuku West', '新宿区西新宿1付近', 'Shinjuku-ku, Nishi-Shinjuku 1', 35.6920, 139.6990, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (5, 'ドルレンジャー 新宿西口店', 'Dollar Ranger Shinjuku West', '新宿区西新宿7-1-2 川安ビル1階', 'Shinjuku-ku, Nishi-Shinjuku 7-1-2, Kawayasu Bldg 1F', 35.6940, 139.6980, NULL, 'https://d-ranger.jp/', 'specialist'),
  (6, 'インターバンク 新宿店', 'Interbank Shinjuku', '新宿区西新宿1-2-12 思い出横丁', 'Shinjuku-ku, Nishi-Shinjuku 1-2-12, Omoide Yokocho', 35.6935, 139.6985, NULL, 'https://www.interbank.co.jp/', 'specialist'),
  (1, '大黒屋 質新宿東口店', 'Daikokuya Shinjuku East', '新宿区新宿3-24-7 FK324ビル', 'Shinjuku-ku, Shinjuku 3-24-7, FK324 Bldg', 35.6910, 139.7010, NULL, 'https://gaika.e-daikoku.com/', 'ticket_shop'),
  (10, 'J・マーケット 新宿サブナード店', 'J-Market Shinjuku Subnade', '新宿区歌舞伎町1 新宿サブナード内', 'Shinjuku-ku, Kabukicho 1, Shinjuku Subnade', 35.6930, 139.7030, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (8, 'SAKURA CURRENCY 新宿店', 'SAKURA CURRENCY Shinjuku', '新宿区新宿5-17-11', 'Shinjuku-ku, Shinjuku 5-17-11', 35.6945, 139.7060, NULL, 'https://sakura-currency.co.jp/', 'specialist'),

  -- 渋谷エリア
  (2, 'トラベレックス 渋谷マークシティ店', 'Travelex Shibuya Mark City', '渋谷区道玄坂1 渋谷マークシティ内', 'Shibuya-ku, Dogenzaka 1, Shibuya Mark City', 35.6580, 139.6985, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 渋谷店', 'SAKURA CURRENCY Shibuya', '渋谷区宇田川町付近', 'Shibuya-ku, Udagawacho', 35.6610, 139.6980, NULL, 'https://sakura-currency.co.jp/', 'specialist'),

  -- 上野・浅草エリア
  (3, 'ワールドカレンシーショップ 上野マルイ店', 'World Currency Shop Ueno Marui', '台東区上野6-15-1 上野マルイ内', 'Taito-ku, Ueno 6-15-1, Ueno Marui', 35.7115, 139.7745, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (2, 'トラベレックス 浅草店', 'Travelex Asakusa', '台東区浅草付近', 'Taito-ku, Asakusa', 35.7120, 139.7965, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 上野アメ横店', 'SAKURA CURRENCY Ueno Ameyoko', '台東区上野付近', 'Taito-ku, Ueno, Ameyoko', 35.7100, 139.7740, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (8, 'SAKURA CURRENCY 浅草店', 'SAKURA CURRENCY Asakusa', '台東区花川戸2-3-10 酒井ビル302', 'Taito-ku, Hanakawado 2-3-10, Sakai Bldg 302', 35.7130, 139.7970, NULL, 'https://sakura-currency.co.jp/', 'specialist'),

  -- 池袋エリア
  (2, 'ビューカード外貨両替 JR池袋駅店', 'View Card Exchange JR Ikebukuro', '豊島区南池袋1 JR池袋駅中央通路東側', 'Toshima-ku, Minami-Ikebukuro 1, JR Ikebukuro Stn', 35.7295, 139.7109, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (10, 'J・マーケット 池袋店', 'J-Market Ikebukuro', '豊島区西池袋1 池袋ショッピングパーク内', 'Toshima-ku, Nishi-Ikebukuro 1, Ikebukuro SP', 35.7300, 139.7100, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),

  -- 秋葉原エリア
  (2, 'トラベレックス 秋葉原店', 'Travelex Akihabara', '千代田区外神田付近', 'Chiyoda-ku, Sotokanda', 35.6984, 139.7731, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (11, 'アクセスチケット 秋葉原店', 'Access Ticket Akihabara', '千代田区外神田付近', 'Chiyoda-ku, Sotokanda', 35.6990, 139.7710, NULL, 'https://www.access-ticket.com/', 'ticket_shop'),

  -- 品川エリア
  (10, 'J・マーケット 品川駅前店', 'J-Market Shinagawa', '港区高輪付近', 'Minato-ku, Takanawa', 35.6284, 139.7387, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),

  -- 新橋エリア
  (7, 'エクスチェンジャーズ 新橋店', 'Exchangers Shinbashi', '港区新橋1-16-6 新橋柳屋ビル3階', 'Minato-ku, Shinbashi 1-16-6, Shinbashi Yanagiya Bldg 3F', 35.6660, 139.7580, NULL, 'https://www.exchangers.co.jp/', 'specialist'),

  -- 羽田空港
  (2, 'トラベレックス 羽田空港第3ターミナル店', 'Travelex Haneda T3', '大田区羽田空港2 第3ターミナル', 'Ota-ku, Haneda Airport 2, Terminal 3', 35.5494, 139.7798, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (13, 'SBJ銀行 羽田空港第3ターミナル店', 'SBJ Bank Haneda T3', '大田区羽田空港2 第3ターミナル', 'Ota-ku, Haneda Airport 2, Terminal 3', 35.5494, 139.7798, NULL, 'https://www.sbjbank.co.jp/', 'bank');
