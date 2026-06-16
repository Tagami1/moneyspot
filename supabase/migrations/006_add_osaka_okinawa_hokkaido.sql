-- 大阪・沖縄・北海道の両替店追加（銀行・機械・大黒屋を除く）

-- ============================================================
-- 大阪エリア
-- ============================================================

-- トラベレックス 大阪
INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
  (2, 'トラベレックス TiS大阪店', 'Travelex TiS Osaka', '大阪市北区梅田3-1-1 JR大阪駅構内', 'Kita-ku, Umeda 3-1-1, JR Osaka Station', 34.7024, 135.4959, '06-4797-9685', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 大阪メトロなんば駅店', 'Travelex Osaka Metro Namba', '大阪市中央区難波1-9-7', 'Chuo-ku, Namba 1-9-7', 34.6654, 135.5012, '06-4394-7911', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス TiS天王寺店', 'Travelex TiS Tennoji', '大阪市天王寺区悲田院町10-45 JR天王寺駅構内', 'Tennoji-ku, Hittain-cho 10-45, JR Tennoji Station', 34.6470, 135.5138, '06-6772-6826', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 関西空港駅前店', 'Travelex Kansai Airport Station', '大阪府泉佐野市りんくう往来北1 関西国際空港駅前', 'Rinku Orai Kita 1, Izumisano, Kansai Airport Station', 34.4320, 135.2440, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 関西空港国際線出発南店', 'Travelex Kansai Airport Departure South', '大阪府泉佐野市りんくう往来北1 関西国際空港国際線出発ロビー', 'Kansai International Airport Departure Lobby', 34.4340, 135.2440, NULL, 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 関西空港国際線到着店', 'Travelex Kansai Airport Arrival', '大阪府泉佐野市りんくう往来北1 関西国際空港国際線到着ロビー', 'Kansai International Airport Arrival Lobby', 34.4335, 135.2445, NULL, 'https://www.travelex.co.jp/', 'specialist'),

-- ワールドカレンシーショップ 大阪
  (3, 'ワールドカレンシーショップ 梅田阪急三番街店', 'World Currency Shop Umeda Hankyu Sanbangai', '大阪市北区芝田1-1-3 阪急三番街南館1F', 'Kita-ku, Shibata 1-1-3, Hankyu Sanbangai 1F', 34.7055, 135.4985, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),
  (3, 'ワールドカレンシーショップ なんばシティ店', 'World Currency Shop Namba City', '大阪市中央区難波5-1-60 なんばシティ1F', 'Chuo-ku, Namba 5-1-60, Namba City 1F', 34.6640, 135.5005, NULL, 'https://www.tokyo-card.co.jp/wcs/', 'specialist'),

-- SAKURA CURRENCY 大阪
  (8, 'SAKURA CURRENCY 道頓堀御堂筋店', 'SAKURA CURRENCY Dotonbori Midosuji', '大阪市中央区心斎橋筋2-4-2 グルカシュシティ4F', 'Chuo-ku, Shinsaibashi-suji 2-4-2, 4F', 34.6690, 135.5020, NULL, 'https://sakura-currency.co.jp/', 'specialist'),

-- エクスチェンジャーズ 大阪
  (7, 'エクスチェンジャーズ 心斎橋店', 'Exchangers Shinsaibashi', '大阪市中央区心斎橋筋2-3-12 ダイヤモンドビル1F', 'Chuo-ku, Shinsaibashi-suji 2-3-12, Diamond Bldg 1F', 34.6695, 135.5025, '050-1720-9822', 'https://www.exchangers.co.jp/', 'specialist'),

-- J・マーケット 大阪
  (10, 'J・マーケット ekimo梅田店', 'J-Market Ekimo Umeda', '大阪市北区角田町 ekimo梅田', 'Kita-ku, Kadota-cho, Ekimo Umeda', 34.7040, 135.4990, '06-7494-3471', 'https://j-market.co.jp/gaika', 'ticket_shop'),

-- 甲南チケット 大阪
  (14, '甲南チケット 大阪駅前第3ビル店', 'Konan Ticket Osaka Ekimae Bldg 3', '大阪市北区梅田1-1-3 大阪駅前第3ビルB2F', 'Kita-ku, Umeda 1-1-3, Osaka Ekimae Bldg 3 B2F', 34.7010, 135.4975, '06-6147-9111', 'https://www.kounan.com/exchange/', 'ticket_shop'),
  (14, '甲南チケット なんば店', 'Konan Ticket Namba', '大阪市中央区難波3-2-22', 'Chuo-ku, Namba 3-2-22', 34.6660, 135.5010, '06-6567-8093', 'https://www.kounan.com/exchange/', 'ticket_shop'),
  (14, '甲南チケット 御堂筋なんば店', 'Konan Ticket Midosuji Namba', '大阪市中央区難波4-2-5 オギノビル1F', 'Chuo-ku, Namba 4-2-5, Ogino Bldg 1F', 34.6648, 135.5008, NULL, 'https://www.kounan.com/exchange/', 'ticket_shop'),

-- アクセスチケット 大阪
  (11, 'アクセスチケット 大阪駅前第2ビル店', 'Access Ticket Osaka Ekimae Bldg 2', '大阪市北区梅田1-2-2 大阪駅前第2ビルB2F', 'Kita-ku, Umeda 1-2-2, Osaka Ekimae Bldg 2 B2F', 34.7015, 135.4980, '06-6343-8199', 'https://www.access-ticket.com/', 'ticket_shop'),
  (11, 'アクセスチケット なんば本店', 'Access Ticket Namba Main', '大阪市中央区難波3-2-17', 'Chuo-ku, Namba 3-2-17', 34.6658, 135.5015, '06-6644-7633', 'https://www.access-ticket.com/', 'ticket_shop');

-- ============================================================
-- 北海道エリア
-- ============================================================

INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
-- トラベレックス 札幌
  (2, 'トラベレックス 札幌店', 'Travelex Sapporo', '札幌市中央区北4条西5-1 アスティ45ビル1階', 'Chuo-ku, Kita 4-jo Nishi 5-1, Asty 45 Bldg 1F', 43.0641, 141.3468, '011-252-6368', 'https://www.travelex.co.jp/', 'specialist'),

-- トラベレックス 新千歳空港
  (2, 'トラベレックス 新千歳空港国内線ANA店', 'Travelex New Chitose Domestic ANA', '千歳市美々 新千歳空港国内線旅客ターミナル1階', 'Bibi, Chitose, New Chitose Airport Domestic Terminal 1F', 42.7752, 141.6925, '0123-46-3311', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 新千歳空港国内線JAL店', 'Travelex New Chitose Domestic JAL', '千歳市美々 新千歳空港国内線旅客ターミナル1階', 'Bibi, Chitose, New Chitose Airport Domestic Terminal 1F', 42.7750, 141.6920, '0123-45-5656', 'https://www.travelex.co.jp/', 'specialist'),
  (2, 'トラベレックス 新千歳空港国際線到着店', 'Travelex New Chitose International Arrival', '千歳市美々 新千歳空港国際線ターミナル', 'Bibi, Chitose, New Chitose Airport International Terminal', 42.7748, 141.6930, '0123-45-2790', 'https://www.travelex.co.jp/', 'specialist'),

-- ワールドカレンシーショップ 札幌
  (3, 'ワールドカレンシーショップ 札幌店', 'World Currency Shop Sapporo', '札幌市中央区大通西1 さっぽろ地下街オーロラタウン', 'Chuo-ku, Odori Nishi 1, Sapporo Aurora Town', 43.0607, 141.3544, '011-272-6290', 'https://www.tokyo-card.co.jp/wcs/', 'specialist');

-- ============================================================
-- 沖縄エリア
-- ============================================================

INSERT INTO exchange_shops (chain_id, name, name_en, address, address_en, lat, lng, phone, website_url, shop_type) VALUES
-- トラベレックス 那覇空港
  (2, 'トラベレックス 那覇空港国際線到着ロビー店', 'Travelex Naha Airport International Arrival', '那覇市字鏡水150 那覇空港旅客ターミナルビル国際線エリア1階', 'Kagamimizu 150, Naha, Naha Airport International Terminal 1F', 26.2104, 127.6506, '098-987-0865', 'https://www.travelex.co.jp/', 'specialist');
