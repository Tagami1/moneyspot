export type AreaSlug =
  | "shinjuku"
  | "shibuya"
  | "ginza"
  | "ueno-akihabara"
  | "tokyo-station"
  | "narita"
  | "haneda"
  | "ikebukuro"
  | "yokohama"
  | "nagoya"
  | "fukuoka"
  | "sapporo"
  | "osaka"
  | "kyoto";

export type AreaPage = {
  slug: AreaSlug;
  nameJa: string;
  nameEn: string;
  searchLabel: string;
  descriptionJa: string;
  descriptionEn: string;
  lat: number;
  lng: number;
  radiusKm: number;
  searchKeywords: string[];
  nearbyHints: string[];
};

export const areaPages: AreaPage[] = [
  {
    slug: "shinjuku",
    nameJa: "新宿",
    nameEn: "Shinjuku",
    searchLabel: "新宿",
    descriptionJa:
      "新宿駅・歌舞伎町・西新宿周辺で、外貨両替所のレートと営業時間を比較できます。",
    descriptionEn:
      "Compare currency exchange rates and opening hours around Shinjuku Station, Kabukicho, and Nishi-Shinjuku.",
    lat: 35.6909,
    lng: 139.7003,
    radiusKm: 5,
    searchKeywords: ["新宿 両替", "Shinjuku currency exchange", "新宿 外貨両替"],
    nearbyHints: ["新宿駅", "歌舞伎町", "西新宿", "新宿三丁目"],
  },
  {
    slug: "shibuya",
    nameJa: "渋谷",
    nameEn: "Shibuya",
    searchLabel: "渋谷",
    descriptionJa:
      "渋谷駅・道玄坂・表参道方面で、観光や買い物前に使いやすい両替所を探せます。",
    descriptionEn:
      "Find convenient money exchange shops near Shibuya Station, Dogenzaka, and the Omotesando side.",
    lat: 35.658,
    lng: 139.7016,
    radiusKm: 5,
    searchKeywords: ["渋谷 両替", "Shibuya money exchange", "渋谷 外貨両替"],
    nearbyHints: ["渋谷駅", "道玄坂", "宮益坂", "表参道"],
  },
  {
    slug: "ginza",
    nameJa: "銀座",
    nameEn: "Ginza",
    searchLabel: "銀座",
    descriptionJa:
      "銀座・有楽町・日比谷周辺の両替レートを比較し、買い物やホテル移動の前に確認できます。",
    descriptionEn:
      "Check money exchange options around Ginza, Yurakucho, and Hibiya before shopping or hotel transfers.",
    lat: 35.6717,
    lng: 139.765,
    radiusKm: 4,
    searchKeywords: ["銀座 両替", "Ginza currency exchange", "有楽町 両替"],
    nearbyHints: ["銀座駅", "有楽町", "日比谷", "東銀座"],
  },
  {
    slug: "ueno-akihabara",
    nameJa: "上野・秋葉原",
    nameEn: "Ueno and Akihabara",
    searchLabel: "上野 秋葉原",
    descriptionJa:
      "上野・御徒町・秋葉原エリアで、観光客にも使いやすい外貨両替所を比較できます。",
    descriptionEn:
      "Compare traveler-friendly exchange shops around Ueno, Okachimachi, and Akihabara.",
    lat: 35.7056,
    lng: 139.7745,
    radiusKm: 5,
    searchKeywords: ["上野 両替", "秋葉原 両替", "Akihabara money exchange"],
    nearbyHints: ["上野駅", "御徒町", "秋葉原", "アメ横"],
  },
  {
    slug: "tokyo-station",
    nameJa: "東京駅",
    nameEn: "Tokyo Station",
    searchLabel: "東京駅",
    descriptionJa:
      "東京駅・丸の内・日本橋周辺で、移動前に近い両替所と参考レートを確認できます。",
    descriptionEn:
      "Compare nearby exchange shops and reference rates around Tokyo Station, Marunouchi, and Nihonbashi.",
    lat: 35.6812,
    lng: 139.7671,
    radiusKm: 4,
    searchKeywords: ["東京駅 両替", "Tokyo Station currency exchange", "日本橋 両替"],
    nearbyHints: ["東京駅", "丸の内", "八重洲", "日本橋"],
  },
  {
    slug: "narita",
    nameJa: "成田空港",
    nameEn: "Narita Airport",
    searchLabel: "成田",
    descriptionJa:
      "成田空港と周辺エリアで、到着後・出発前に確認したい外貨両替情報をまとめています。",
    descriptionEn:
      "Review exchange options around Narita Airport before departure or after arrival.",
    lat: 35.772,
    lng: 140.3929,
    radiusKm: 8,
    searchKeywords: ["成田空港 両替", "Narita Airport exchange", "成田 外貨両替"],
    nearbyHints: ["第1ターミナル", "第2ターミナル", "空港第2ビル", "成田"],
  },
  {
    slug: "haneda",
    nameJa: "羽田空港",
    nameEn: "Haneda Airport",
    searchLabel: "羽田",
    descriptionJa:
      "羽田空港・京急蒲田方面で、空港利用前後の両替レートを比較できます。",
    descriptionEn:
      "Compare exchange rates around Haneda Airport and the Keikyu Kamata side.",
    lat: 35.5494,
    lng: 139.7798,
    radiusKm: 8,
    searchKeywords: ["羽田空港 両替", "Haneda Airport exchange", "羽田 外貨両替"],
    nearbyHints: ["第3ターミナル", "国内線ターミナル", "天空橋", "京急蒲田"],
  },
  {
    slug: "ikebukuro",
    nameJa: "池袋",
    nameEn: "Ikebukuro",
    searchLabel: "池袋",
    descriptionJa:
      "池袋駅・東口・西口周辺で、買い物や移動前に外貨両替レートを比較できます。",
    descriptionEn:
      "Compare exchange rates around Ikebukuro Station, the East Exit, and the West Exit.",
    lat: 35.7289,
    lng: 139.7104,
    radiusKm: 5,
    searchKeywords: ["池袋 両替", "Ikebukuro currency exchange", "池袋 外貨両替"],
    nearbyHints: ["池袋駅", "東口", "西口", "サンシャインシティ"],
  },
  {
    slug: "yokohama",
    nameJa: "横浜",
    nameEn: "Yokohama",
    searchLabel: "横浜",
    descriptionJa:
      "横浜駅・みなとみらい・中華街周辺で、観光前に確認しやすい両替所情報をまとめています。",
    descriptionEn:
      "Review exchange shops around Yokohama Station, Minato Mirai, and Chinatown.",
    lat: 35.4658,
    lng: 139.6223,
    radiusKm: 8,
    searchKeywords: ["横浜 両替", "Yokohama currency exchange", "みなとみらい 両替"],
    nearbyHints: ["横浜駅", "みなとみらい", "中華街", "桜木町"],
  },
  {
    slug: "osaka",
    nameJa: "大阪",
    nameEn: "Osaka",
    searchLabel: "大阪",
    descriptionJa:
      "梅田・難波・心斎橋など、大阪中心部の外貨両替レート比較に対応しやすいページです。",
    descriptionEn:
      "Compare exchange options across central Osaka, including Umeda, Namba, and Shinsaibashi.",
    lat: 34.7025,
    lng: 135.4959,
    radiusKm: 8,
    searchKeywords: ["大阪 両替", "Osaka currency exchange", "難波 両替"],
    nearbyHints: ["梅田", "難波", "心斎橋", "大阪駅"],
  },
  {
    slug: "nagoya",
    nameJa: "名古屋",
    nameEn: "Nagoya",
    searchLabel: "名古屋",
    descriptionJa:
      "名古屋駅・栄・金山周辺で、出張や観光前に外貨両替レートを比較できます。",
    descriptionEn:
      "Compare exchange rates around Nagoya Station, Sakae, and Kanayama before business or sightseeing.",
    lat: 35.1709,
    lng: 136.8815,
    radiusKm: 8,
    searchKeywords: ["名古屋 両替", "Nagoya currency exchange", "栄 外貨両替"],
    nearbyHints: ["名古屋駅", "栄", "金山", "伏見"],
  },
  {
    slug: "fukuoka",
    nameJa: "福岡",
    nameEn: "Fukuoka",
    searchLabel: "福岡",
    descriptionJa:
      "博多・天神・福岡空港周辺で、旅行者が使いやすい外貨両替所を探せます。",
    descriptionEn:
      "Find traveler-friendly exchange shops around Hakata, Tenjin, and Fukuoka Airport.",
    lat: 33.5902,
    lng: 130.4017,
    radiusKm: 8,
    searchKeywords: ["福岡 両替", "Fukuoka currency exchange", "博多 外貨両替"],
    nearbyHints: ["博多", "天神", "福岡空港", "中洲"],
  },
  {
    slug: "sapporo",
    nameJa: "札幌",
    nameEn: "Sapporo",
    searchLabel: "札幌",
    descriptionJa:
      "札幌駅・大通・すすきの周辺で、北海道旅行前後の両替レートを比較できます。",
    descriptionEn:
      "Compare exchange rates around Sapporo Station, Odori, and Susukino before or after travel in Hokkaido.",
    lat: 43.0618,
    lng: 141.3545,
    radiusKm: 8,
    searchKeywords: ["札幌 両替", "Sapporo currency exchange", "北海道 外貨両替"],
    nearbyHints: ["札幌駅", "大通", "すすきの", "新千歳空港方面"],
  },
  {
    slug: "kyoto",
    nameJa: "京都",
    nameEn: "Kyoto",
    searchLabel: "京都",
    descriptionJa:
      "京都駅・四条河原町周辺で、観光前に確認しやすい両替所情報をまとめています。",
    descriptionEn:
      "Review exchange shops around Kyoto Station and Shijo-Kawaramachi before sightseeing.",
    lat: 35.0116,
    lng: 135.7681,
    radiusKm: 7,
    searchKeywords: ["京都 両替", "Kyoto currency exchange", "京都駅 外貨両替"],
    nearbyHints: ["京都駅", "四条河原町", "祇園", "烏丸"],
  },
];

export function getAreaPage(slug: string): AreaPage | undefined {
  return areaPages.find((area) => area.slug === slug);
}
