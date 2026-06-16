/**
 * ドルレンジャー (d-ranger.jp) パーサー
 *
 * 特徴:
 * - 店舗ごとのページにレートがある（例: /shop/shinjuku/）
 * - 新宿西口店のレートを代表値として全店舗に適用
 * - HTMLテーブル: cell-buy（円→外貨）/ cell-sell（外貨→円）
 * - chain_id: 5
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = cell-sell）
  sell_rate: number | null; // 円→外貨（店が売る = cell-buy）
}

// ドルレンジャーのフラグ画像ファイル名 → 通貨コード
const FLAG_CURRENCY_MAP: Record<string, string> = {
  'usa': 'USD',
  'us': 'USD',
  'eu': 'EUR',
  'euro': 'EUR',
  'gb': 'GBP',
  'uk': 'GBP',
  'au': 'AUD',
  'ca': 'CAD',
  'ch': 'CHF',
  'cn': 'CNY',
  'kr': 'KRW',
  'tw': 'TWD',
  'hk': 'HKD',
  'sg': 'SGD',
  'th': 'THB',
  'ph': 'PHP',
  'id': 'IDR',
  'vn': 'VND',
  'my': 'MYR',
  'nz': 'NZD',
};

// 通貨名 → コード
const NAME_CURRENCY_MAP: Record<string, string> = {
  'アメリカドル': 'USD',
  '米ドル': 'USD',
  'ドル': 'USD',
  'ユーロ': 'EUR',
  'イギリスポンド': 'GBP',
  '英ポンド': 'GBP',
  'オーストラリアドル': 'AUD',
  '豪ドル': 'AUD',
  'カナダドル': 'CAD',
  'スイスフラン': 'CHF',
  '中国元': 'CNY',
  '人民元': 'CNY',
  '韓国ウォン': 'KRW',
  '台湾ドル': 'TWD',
  '香港ドル': 'HKD',
  'シンガポールドル': 'SGD',
  'タイバーツ': 'THB',
  'フィリピンペソ': 'PHP',
  'インドネシアルピア': 'IDR',
  'ベトナムドン': 'VND',
  'マレーシアリンギット': 'MYR',
  'ニュージーランドドル': 'NZD',
  'NZドル': 'NZD',
};

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * ドルレンジャーの店舗ページHTMLからレートを抽出
 *
 * テーブル構造:
 *   <td class="cell-buy">158.80<span> 円</span></td>   ← 購入(円→外貨) = sell_rate
 *   <td class="cell-sell">156.70<span> 円</span></td>  ← 売却(外貨→円) = buy_rate
 */
export function parseDollarRanger(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // 行ごとに分割して処理
  // shoprate-table 内の各 <tr> を探す
  const rows = html.split(/<tr[^>]*>/i);

  for (const row of rows) {
    if (!row.includes('cell-buy') && !row.includes('cell-sell')) continue;

    // 通貨コードを特定
    let currencyCode: string | null = null;

    // フラグ画像から特定を試みる
    const flagMatch = row.match(/flag[_-]?([a-z]{2,4})\.(?:png|jpg|svg|gif|webp)/i);
    if (flagMatch) {
      const flagKey = flagMatch[1].toLowerCase();
      currencyCode = FLAG_CURRENCY_MAP[flagKey] || null;
    }

    // 通貨名から特定（フラグで見つからなかった場合）
    if (!currencyCode) {
      const cleanRow = row.replace(/<[^>]+>/g, ' ');
      for (const [name, code] of Object.entries(NAME_CURRENCY_MAP)) {
        if (cleanRow.includes(name)) {
          currencyCode = code;
          break;
        }
      }
    }

    if (!currencyCode || !SUPPORTED_CURRENCIES.includes(currencyCode)) continue;
    if (found.has(currencyCode)) continue;

    // cell-buy（購入 = 円→外貨 = sell_rate）
    const buyMatch = row.match(/cell-buy[^>]*>([^<]*?)(\d+\.?\d*)/);
    let sellRate: number | null = null;
    if (buyMatch) {
      const val = parseFloat(buyMatch[2]);
      if (!isNaN(val) && val > 0) sellRate = val;
    }

    // cell-sell（売却 = 外貨→円 = buy_rate）
    const sellMatch = row.match(/cell-sell[^>]*>([^<]*?)(\d+\.?\d*)/);
    let buyRate: number | null = null;
    if (sellMatch) {
      const val = parseFloat(sellMatch[2]);
      if (!isNaN(val) && val > 0) buyRate = val;
    }

    if (sellRate !== null || buyRate !== null) {
      found.add(currencyCode);
      rates.push({
        currency_code: currencyCode,
        buy_rate: buyRate,
        sell_rate: sellRate,
      });
    }
  }

  return rates;
}

// 新宿西口店を代表ページとして使用
export const DOLLAR_RANGER_URL = 'https://d-ranger.jp/shop/shinjuku/';
export const DOLLAR_RANGER_CHAIN_ID = 5;
