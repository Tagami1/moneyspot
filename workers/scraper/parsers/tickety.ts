/**
 * チケッティ (tickety.jp) パーサー
 *
 * 特徴:
 * - 通貨別ページにレートがある（例: /buy/exchange/exchange/usd/single.php）
 * - 一覧ページ: /buy/exchange/exchange/s_list.php
 * - 買取価格（外貨→円）が各額面ごとに表示される
 * - 100ドル札の買取価格÷100 でレートを算出
 * - chain_id: 16
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = 買取）
  sell_rate: number | null; // 円→外貨（店が売る）
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB',
];

// 通貨コード → URLパス
const CURRENCY_PATHS: Record<string, string> = {
  'USD': 'usd', 'EUR': 'eur', 'GBP': 'gbp', 'AUD': 'aud',
  'CAD': 'cad', 'CNY': 'cny', 'KRW': 'krw', 'TWD': 'twd',
  'HKD': 'hkd', 'SGD': 'sgd', 'THB': 'thb',
};

/**
 * チケッティの一覧ページ or 個別ページからレートを抽出
 *
 * 一覧ページの構造:
 *   <p class="price-sell">買取価格:155</p> (1ドルの買取価格)
 *   or <p class="price-sell">買取価格:15,527</p> (100ドルの買取価格)
 */
export function parseTickety(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  // 一覧ページから各通貨の買取価格を探す
  // パターン: 通貨名の後に買取価格がある
  for (const code of SUPPORTED_CURRENCIES) {
    const path = CURRENCY_PATHS[code];
    if (!path) continue;

    // 通貨コードまたはパスで検索エリアを特定
    const codeUpper = code.toUpperCase();

    // 方法1: "USD 100ドル" or "100 dollars" の買取価格を探す（最も正確）
    const hundredPattern = new RegExp(
      `${codeUpper}[\\s\\S]{0,200}?100[^0-9][\\s\\S]{0,200}?買取価格[：:]?\\s*([\\d,]+)`,
      'i'
    );
    const hundredMatch = html.match(hundredPattern);
    if (hundredMatch) {
      const price = parseFloat(hundredMatch[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        rates.push({
          currency_code: code,
          buy_rate: price / 100,
          sell_rate: null,
        });
        continue;
      }
    }

    // 方法2: "USD 1ドル" の買取価格
    const onePattern = new RegExp(
      `${codeUpper}[\\s]*1[ドル円ユーロポンド\\s][\\s\\S]{0,200}?買取価格[：:]?\\s*([\\d,]+)`,
      'i'
    );
    const oneMatch = html.match(onePattern);
    if (oneMatch) {
      const price = parseFloat(oneMatch[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        rates.push({
          currency_code: code,
          buy_rate: price,
          sell_rate: null,
        });
        continue;
      }
    }

    // 方法3: price-sell クラスから価格を取得
    const pricePattern = new RegExp(
      `${codeUpper}[\\s\\S]{0,500}?price-sell[^>]*>買取価格[：:]?\\s*([\\d,]+)`,
      'i'
    );
    const priceMatch = html.match(pricePattern);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        rates.push({
          currency_code: code,
          buy_rate: price,
          sell_rate: null,
        });
      }
    }
  }

  return rates;
}

export const TICKETY_URL = 'https://www.tickety.jp/buy/exchange/exchange/s_list.php';
export const TICKETY_CHAIN_ID = 16;
