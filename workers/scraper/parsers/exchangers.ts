/**
 * エクスチェンジャーズ (exchangers.co.jp) パーサー
 *
 * 特徴:
 * - https://www.exchangers.co.jp/rate.php にレート一覧がある
 * - 「購入」(円→外貨) レートのみ掲載（売却は実店舗のみ）
 * - HTMLテーブル形式で通貨名とレートが並ぶ
 * - chain_id: 7
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = 客が外貨を売る）
  sell_rate: number | null; // 円→外貨（店が売る = 客が外貨を買う）
}

// エクスチェンジャーズで使われている通貨名 → 通貨コードのマッピング
const CURRENCY_MAP: Record<string, string> = {
  'アメリカドル': 'USD',
  '米ドル': 'USD',
  'ユーロ': 'EUR',
  '中国元': 'CNY',
  '人民元': 'CNY',
  '韓国ウォン': 'KRW',
  'イギリスポンド': 'GBP',
  '英ポンド': 'GBP',
  'ロシアルーブル': 'RUB',
  'スイスフラン': 'CHF',
  'スウェーデンクローナ': 'SEK',
  'インドネシアルピア': 'IDR',
  '台湾ドル': 'TWD',
  'タイバーツ': 'THB',
  '香港ドル': 'HKD',
  'シンガポールドル': 'SGD',
  'トルコリラ': 'TRY',
  'サウジアラビアリヤル': 'SAR',
  'UAEディルハム': 'AED',
  'カナダドル': 'CAD',
  'オーストラリアドル': 'AUD',
  '豪ドル': 'AUD',
  'ニュージーランドドル': 'NZD',
  'NZドル': 'NZD',
  'フィリピンペソ': 'PHP',
  'マレーシアリンギット': 'MYR',
  'ベトナムドン': 'VND',
};

// MoneySpotで扱う通貨コード一覧
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

export function parseExchangers(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  // エクスチェンジャーズのページでは、各通貨行に通貨名とレートが含まれる
  // パターン: 通貨名の後に数値（レート）が続く
  // 例: "アメリカドル ... 159.810 ... 購入"

  for (const [jaName, code] of Object.entries(CURRENCY_MAP)) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;

    // 通貨名を含む部分を探す
    const nameIdx = html.indexOf(jaName);
    if (nameIdx === -1) continue;

    // 通貨名の後ろ500文字以内でレート数値を探す
    const searchArea = html.substring(nameIdx, nameIdx + 500);

    // 数値パターン: 小数点を含む数値（例: 159.810, 0.1068, 23.380）
    const rateMatch = searchArea.match(/(\d+\.[\d]+)/);
    if (!rateMatch) continue;

    const rate = parseFloat(rateMatch[1]);
    if (isNaN(rate) || rate <= 0) continue;

    // エクスチェンジャーズは「購入」（円→外貨）のみなので sell_rate に設定
    // sell_rate = 店が外貨を売る（客が円を払って外貨を買う）レート
    rates.push({
      currency_code: code,
      buy_rate: null,
      sell_rate: rate,
    });
  }

  return rates;
}

export const EXCHANGERS_URL = 'https://www.exchangers.co.jp/rate.php';
export const EXCHANGERS_CHAIN_ID = 7;
