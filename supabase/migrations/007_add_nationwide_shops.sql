-- 日本全国の両替店追加（銀行・機械・大黒屋を除く）
-- 名古屋・福岡・京都・神戸・仙台・広島・横浜・成田空港・羽田空港

-- 新チェーン追加
INSERT INTO exchange_chains (id, name, name_en, website_url) VALUES
  (18, '京都チケットショップトーカイ', 'Kyoto Ticket Shop Tokai', 'https://www.tokai-ticket.co.jp/'),
  (19, 'GPA', 'GPA', 'https://www.gpa-net.co.jp/')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 名古屋エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 名古屋ユニモール店', 'Travelex Nagoya Unimall', '名古屋市中村区名駅4-5-26先 ユニモール内', 'Nakamura-ku, Meieki 4-5-26, Unimall', 35.1700, 136.8830, '052-533-6260', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 名古屋栄サカエチカ店', 'Travelex Nagoya Sakae Sakaechika', '名古屋市中区栄3-4-6先 サカエチカ', 'Naka-ku, Sakae 3-4-6, Sakaechika', 35.1680, 136.9085, '052-684-4751', 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 名古屋駅前店', 'World Currency Shop Nagoya Ekimae', '名古屋市中村区名駅3-28-12', 'Nakamura-ku, Meieki 3-28-12', 35.1710, 136.8840, '052-589-3090', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  -- セントレア
  (2, 'トラベレックス セントレアアクセスプラザ店', 'Travelex Centrair Access Plaza', '常滑市セントレア1-1 アクセスプラザ2階', 'Centrair 1-1, Tokoname, Access Plaza 2F', 34.8585, 136.8125, '0569-38-8421', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス セントレアセンターピア店', 'Travelex Centrair Center Pier', '常滑市セントレア1-1 国際線出発ロビー3階', 'Centrair 1-1, Tokoname, Departure Lobby 3F', 34.8583, 136.8128, '0569-38-9550', 'https://www.travelex.co.jp/', 'specialist');

-- ============================================================
-- 福岡エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (3, 'ワールドカレンシーショップ 福岡店', 'World Currency Shop Fukuoka', '福岡市中央区天神1-12-7 福岡ダイヤモンドビル1階', 'Chuo-ku, Tenjin 1-12-7, Fukuoka Diamond Bldg 1F', 33.5910, 130.3990, '092-739-1620', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (2, 'トラベレックス 福岡空港国際線到着ロビー店', 'Travelex Fukuoka Airport International Arrival', '福岡市博多区青木739 福岡空港国際線ターミナル1階', 'Aoki 739, Hakata-ku, Fukuoka Airport International Terminal 1F', 33.5860, 130.4510, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 福岡空港国際線出発南ゲート店', 'Travelex Fukuoka Airport Departure South Gate', '福岡市博多区青木739 福岡空港国際線ターミナル3階', 'Aoki 739, Hakata-ku, Fukuoka Airport International Terminal 3F', 33.5858, 130.4512, '092-415-5570', 'https://www.travelex.co.jp/', 'specialist');

-- ============================================================
-- 京都エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 京都西口店', 'Travelex Kyoto West Exit', '京都市下京区烏丸通塩小路下ル東塩小路町 JR京都駅構内2階', 'Shimogyo-ku, JR Kyoto Station 2F', 34.9855, 135.7585, '075-351-5613', 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 京都駅ビル店', 'World Currency Shop Kyoto Station Bldg', '京都市下京区烏丸通塩小路下る東塩小路町 京都駅ビル内', 'Shimogyo-ku, Kyoto Station Building', 34.9852, 135.7590, '075-365-7750', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (8, 'SAKURA CURRENCY 京都四条店', 'SAKURA CURRENCY Kyoto Shijo', '京都市下京区四条通 四条大橋付近', 'Shimogyo-ku, Shijo-dori, near Shijo Bridge', 35.0035, 135.7710, NULL, 'https://sakura-currency.co.jp/', 'specialist'),
  (18, '京都チケットショップトーカイ 四条河原町店', 'Kyoto Ticket Shop Tokai Shijo-Kawaramachi', '京都市下京区貞安前之町610-4-1 トーカイ四条ビル1F', 'Shimogyo-ku, Tokai Shijo Bldg 1F', 35.0030, 135.7700, '075-213-4884', 'https://www.tokai-ticket.co.jp/', 'ticket_shop'),
  (18, '京都チケットショップトーカイ 京都駅前店', 'Kyoto Ticket Shop Tokai Kyoto Ekimae', '京都市下京区東塩小路町 京都駅前', 'Shimogyo-ku, Kyoto Station area', 34.9858, 135.7588, NULL, 'https://www.tokai-ticket.co.jp/', 'ticket_shop');

-- ============================================================
-- 神戸エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス TiS三ノ宮店', 'Travelex TiS Sannomiya', '神戸市中央区布引町4-1-1 JR三ノ宮駅構内', 'Chuo-ku, Nunobiki-cho 4-1-1, JR Sannomiya Station', 34.6945, 135.1960, '078-265-6715', 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 神戸店', 'World Currency Shop Kobe', '神戸市中央区明石町48', 'Chuo-ku, Akashi-machi 48', 34.6880, 135.1925, '078-326-2361', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (14, '甲南チケット 三宮ダイエー店', 'Konan Ticket Sannomiya Daiei', '神戸市中央区三宮 ダイエー三宮駅前店付近', 'Chuo-ku, Sannomiya, near Daiei', 34.6940, 135.1955, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop'),
  (14, '甲南チケット 元町店', 'Konan Ticket Motomachi', '神戸市中央区元町通付近', 'Chuo-ku, near Motomachi Station', 34.6900, 135.1880, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop'),
  (14, '甲南チケット 生田ロード店', 'Konan Ticket Ikuta Road', '神戸市中央区下山手通 生田ロード沿い', 'Chuo-ku, Shimoyamate-dori, Ikuta Road', 34.6935, 135.1935, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop');

-- ============================================================
-- 仙台エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 仙台店', 'Travelex Sendai', '仙台市青葉区中央1-8-22 グランドゥ1階', 'Aoba-ku, Chuo 1-8-22, Grand-u 1F', 38.2602, 140.8820, '022-716-2128', 'https://www.travelex.co.jp/', 'specialist');

-- ============================================================
-- 広島エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 広島紙屋町シャレオ店', 'Travelex Hiroshima Kamiyacho Shareo', '広島市中区紙屋町2-500 紙屋町シャレオ', 'Naka-ku, Kamiyacho 2-500, Kamiyacho Shareo', 34.3955, 132.4590, '082-546-3150', 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 広島店', 'World Currency Shop Hiroshima', '広島市中区紙屋町付近', 'Naka-ku, Kamiyacho area', 34.3950, 132.4585, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist');

-- ============================================================
-- 横浜エリア
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 横浜ポルタ店', 'Travelex Yokohama Porta', '横浜市西区高島2-16 横浜駅東口地下街ポルタB1', 'Nishi-ku, Takashima 2-16, Yokohama Porta B1', 35.4660, 139.6225, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 京急横浜駅店', 'Travelex Keikyu Yokohama', '横浜市西区高島2-16-1 京急横浜駅構内', 'Nishi-ku, Takashima 2-16-1, Keikyu Yokohama Station', 35.4655, 139.6220, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (3, 'ワールドカレンシーショップ 横浜西口店', 'World Currency Shop Yokohama West', '横浜市西区北幸1-1-8 横浜西口地下街ザ・ダイヤモンド北4', 'Nishi-ku, Kitasaiwai 1-1-8, The Diamond Kita 4', 35.4665, 139.6195, '045-331-7271', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ 横浜そごう店', 'World Currency Shop Yokohama Sogo', '横浜市西区高島2-18-1 横浜そごう', 'Nishi-ku, Takashima 2-18-1, Yokohama Sogo', 35.4668, 139.6230, '045-451-9600', 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (10, 'J・マーケット 横浜ジョイナス店', 'J-Market Yokohama Joinus', '横浜市西区南幸1-4 ジョイナスB1', 'Nishi-ku, Minamisaiwai 1-4, Joinus B1', 35.4650, 139.6200, NULL, 'https://j-market.co.jp/gaika', 'ticket_shop'),
  (11, 'アクセスチケット 横浜北口店', 'Access Ticket Yokohama North', '横浜市西区北幸1-1-1', 'Nishi-ku, Kitasaiwai 1-1-1', 35.4670, 139.6198, '045-312-4049', 'https://www.access-ticket.com/', 'ticket_shop');

-- ============================================================
-- 成田空港
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 成田空港第1ターミナル店', 'Travelex Narita Airport Terminal 1', '成田市三里塚御料牧場1-1 成田空港第1ターミナル', 'Narita Airport Terminal 1', 35.7720, 140.3930, '0476-32-0980', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 成田空港第2ターミナル店', 'Travelex Narita Airport Terminal 2', '成田市三里塚御料牧場1-1 成田空港第2ターミナル', 'Narita Airport Terminal 2', 35.7690, 140.3860, '0476-34-6268', 'https://www.travelex.co.jp/', 'specialist'),
  (19, 'GPA 成田空港第2ターミナル出発ロビー店', 'GPA Narita Terminal 2 Departure', '成田市三里塚御料牧場1-1 成田空港第2ターミナル3階', 'Narita Airport Terminal 2, 3F Departure Lobby', 35.7692, 140.3862, NULL, 'https://www.gpa-net.co.jp/', 'specialist'),
  (19, 'GPA 成田空港第2ターミナル到着ロビー店', 'GPA Narita Terminal 2 Arrival', '成田市三里塚御料牧場1-1 成田空港第2ターミナル1階', 'Narita Airport Terminal 2, 1F Arrival Lobby', 35.7688, 140.3858, NULL, 'https://www.gpa-net.co.jp/', 'specialist');

-- ============================================================
-- 羽田空港
-- ============================================================
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス 羽田空港第1ターミナル店', 'Travelex Haneda Airport Terminal 1', '大田区羽田空港3-3-2 第1旅客ターミナル', 'Ota-ku, Haneda Airport Terminal 1', 35.5495, 139.7838, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 羽田空港第2ターミナル出発ゲート店', 'Travelex Haneda Terminal 2 Departure Gate', '大田区羽田空港3-4-2 第2旅客ターミナル出発ゲート', 'Ota-ku, Haneda Airport Terminal 2 Departure Gate', 35.5490, 139.7850, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 羽田空港第3ターミナル駅店', 'Travelex Haneda Terminal 3 Station', '大田区羽田空港2-6-5 第3旅客ターミナル駅', 'Ota-ku, Haneda Airport Terminal 3 Station', 35.5470, 139.7795, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 羽田空港第3ターミナル出発ゲート店', 'Travelex Haneda Terminal 3 Departure Gate', '大田区羽田空港2-6-5 第3旅客ターミナル出発ゲート', 'Ota-ku, Haneda Airport Terminal 3 Departure Gate', 35.5472, 139.7798, NULL, 'https://www.travelex.co.jp/', 'specialist');
