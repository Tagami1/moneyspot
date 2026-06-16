/**
 * トラベレックス (travelex.co.jp) パーサー
 *
 * 特徴:
 * - JSON APIでレート取得可能（認証不要）
 * - https://api.travelex.net/salt/config/multi?key=Travelex&site=/jajp&options=abhikzl
 * - rates.rates オブジェクトに通貨コード→レートのマッピング
 * - foreignCurrencyAsBase: true → 1外貨あたりの円価格
 * - 売りレート（客が外貨を買う価格）のみ
 * - 30通貨対応
 * - chain_id: 2
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;
  sell_rate: number | null;
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * トラベレックスのJSON APIレスポンスからレートを抽出
 * HTMLではなくJSONを直接パースする
 */
export function parseTravelex(jsonText: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  try {
    const data = JSON.parse(jsonText);
    const ratesObj = data?.rates?.rates;
    if (!ratesObj || typeof ratesObj !== 'object') return rates;

    for (const code of SUPPORTED_CURRENCIES) {
      const rate = ratesObj[code];
      if (typeof rate !== 'number' || rate <= 0) continue;

      // トラベレックスは売りレートのみ（客が外貨を購入する価格）
      rates.push({
        currency_code: code,
        buy_rate: null,
        sell_rate: rate,
      });
    }
  } catch {
    // JSONパースエラー時はHTMLフォールバックを試す
    return parseTravelexFromHtml(jsonText);
  }

  return rates;
}

/**
 * HTMLフォールバック（APIが失敗した場合）
 */
function parseTravelexFromHtml(html: string): ParsedRate[] {
  // APIが使えない場合のフォールバック - レート数値を探す
  const rates: ParsedRate[] = [];
  for (const code of SUPPORTED_CURRENCIES) {
    const pattern = new RegExp(`"${code}"\\s*:\\s*([\\d.]+)`);
    const match = html.match(pattern);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        rates.push({
          currency_code: code,
          buy_rate: null,
          sell_rate: val,
        });
      }
    }
  }
  return rates;
}

// JSON APIのURL（HTMLスクレイピングではなくAPI直接）
export const TRAVELEX_URL = 'https://api.travelex.net/salt/config/multi?key=Travelex&site=/jajp&options=abhikzl';
export const TRAVELEX_CHAIN_ID = 2;
