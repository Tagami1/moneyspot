/**
 * ワールドカレンシーショップ (tokyo-card.co.jp/wcs) パーサー
 *
 * 特徴:
 * - /wcs/rate.php にレートがある
 * - JavaScriptオブジェクトとしてレートが埋め込まれている
 *   window.context.rate['USD'] = { sell: { cash: 162.52 }, buy: { cash: 156.02 } }
 * - HTMLテーブルにもレートがある（フォールバック用）
 * - chain_id: 3
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = buy.cash）
  sell_rate: number | null; // 円→外貨（店が売る = sell.cash）
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * ワールドカレンシーショップのHTMLからレートを抽出
 *
 * 方法1: window.context.rate['XXX'] の JS オブジェクトをパース
 * 方法2: HTMLテーブルから数値を抽出（フォールバック）
 */
export function parseWorldCurrencyShop(html: string): ParsedRate[] {
  // 方法1: JSオブジェクトをパース
  const rates = parseFromJSObject(html);
  if (rates.length >= 3) return rates;

  // 方法2: フォールバック
  return parseFromTable(html);
}

/**
 * window.context.rate['USD'] = { ... sell: { cash: 162.52 }, buy: { cash: 156.02 } ... }
 * のパターンからレートを抽出
 */
function parseFromJSObject(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  for (const code of SUPPORTED_CURRENCIES) {
    // パターン: window.context.rate[ 'USD' ] = { ... }
    // 実際のHTML: rate[ 'USD' ] = { currencyName: '...', sell: { cash: 161.60, tc: 159.60 }, buy: { cash: 155.10, tc: 157.19 } ... }
    const rateBlockPattern = new RegExp(
      `rate\\[\\s*'${code}'\\s*\\]\\s*=\\s*\\{([^;]+)\\}\\s*;`,
      's'
    );
    const blockMatch = html.match(rateBlockPattern);
    if (!blockMatch) continue;

    const block = blockMatch[1];

    // sell: { cash: 161.60, tc: 159.60 } を探す
    const sellMatch = block.match(/sell\s*:\s*\{\s*cash\s*:\s*([\d.]+)/);
    const sellRate = sellMatch ? parseFloat(sellMatch[1]) : null;

    // buy: { cash: 155.10, tc: 157.19 } を探す
    const buyMatch = block.match(/buy\s*:\s*\{\s*cash\s*:\s*([\d.]+)/);
    const buyRate = buyMatch ? parseFloat(buyMatch[1]) : null;

    if ((sellRate && sellRate > 0) || (buyRate && buyRate > 0)) {
      rates.push({
        currency_code: code,
        buy_rate: buyRate && buyRate > 0 ? buyRate : null,
        sell_rate: sellRate && sellRate > 0 ? sellRate : null,
      });
    }
  }

  return rates;
}

/**
 * HTMLテーブルからのフォールバックパース
 */
function parseFromTable(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // 通貨名マッピング
  const nameMap: Record<string, string> = {
    'ドル': 'USD', '米ドル': 'USD',
    'ユーロ': 'EUR',
    'ポンド': 'GBP', '英ポンド': 'GBP',
    '豪ドル': 'AUD', 'オーストラリアドル': 'AUD',
    'カナダドル': 'CAD',
    'スイスフラン': 'CHF',
    '中国元': 'CNY', '人民元': 'CNY',
    '韓国ウォン': 'KRW',
    '台湾ドル': 'TWD',
    '香港ドル': 'HKD',
    'シンガポールドル': 'SGD',
    'タイバーツ': 'THB',
    'フィリピンペソ': 'PHP',
    'インドネシアルピア': 'IDR',
    'ベトナムドン': 'VND',
    'マレーシアリンギット': 'MYR',
  };

  const textHtml = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  for (const [name, code] of Object.entries(nameMap)) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;
    if (found.has(code)) continue;

    const idx = textHtml.indexOf(name);
    if (idx === -1) continue;

    const afterName = textHtml.substring(idx + name.length, idx + name.length + 300);
    const numbers: number[] = [];
    const numPattern = /(\d+\.?\d*)/g;
    let match;
    while ((match = numPattern.exec(afterName)) !== null) {
      const n = parseFloat(match[1]);
      if (n >= 0.001 && n < 100000) {
        numbers.push(n);
      }
      if (numbers.length >= 2) break;
    }

    if (numbers.length >= 2) {
      found.add(code);
      rates.push({
        currency_code: code,
        sell_rate: numbers[0], // 販売レート
        buy_rate: numbers[1],  // 買取レート
      });
    }
  }

  return rates;
}

export const WORLD_CURRENCY_SHOP_URL = 'https://www.tokyo-card.co.jp/wcs/rate.php';
export const WORLD_CURRENCY_SHOP_CHAIN_ID = 3;
