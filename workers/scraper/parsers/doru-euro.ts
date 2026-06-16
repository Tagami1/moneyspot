/**
 * ドルユーロ (doru.jp) パーサー
 *
 * 特徴:
 * - トップページにレート表がある
 * - 毎営業日 11:00 更新
 * - レートA/B/C の3ティアがある（金額による優遇）→ レートAを採用
 * - sell（客が外貨を購入）と buy（客が外貨を売却）の両方がある
 * - IDパターン: sellrateA_USD, buyrateA_USD 等
 * - chain_id: DBに要追加（ドルユーロはオンライン専業）
 *
 * 注意: ドルユーロはオンライン専業で実店舗なし。
 *       exchange_shopsには「ドルユーロ（オンライン）」として登録想定。
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う）
  sell_rate: number | null; // 円→外貨（店が売る）
}

// ドルユーロで扱われている通貨コード
const DORU_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CNY', 'KRW', 'AUD', 'CAD', 'CHF',
  'HKD', 'SGD', 'THB', 'TWD', 'PHP', 'IDR', 'MYR', 'VND',
  'NZD', 'SEK', 'NOK', 'DKK', 'INR',
];

// MoneySpotで扱う通貨コード一覧
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * ドルユーロのHTMLからレートを抽出
 *
 * HTMLには以下のようなIDを持つ要素がある:
 *   <span id="sellrateA_USD">161.63</span>
 *   <span id="buyrateA_USD">154.99</span>
 *
 * sell = 客が外貨を購入する価格（= 店のsell_rate）
 * buy  = 客が外貨を売却する価格（= 店のbuy_rate）
 */
export function parseDoruEuro(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  for (const code of DORU_CURRENCIES) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;

    // 方法1: sellTimesale_XXX / buyTimesale_XXX のブロックから golinka_XXX の値を取得
    const sellRate = extractRateFromTimesale(html, `sellTimesale_${code}`)
      || extractRateById(html, `golinka_${code}`)
      || extractRateById(html, `sellrateA_${code}`);

    const buyRate = extractRateFromTimesale(html, `buyTimesale_${code}`)
      || extractRateById(html, `buyrateA_${code}`);

    if (sellRate === null && buyRate === null) continue;

    rates.push({
      currency_code: code,
      buy_rate: buyRate,
      sell_rate: sellRate,
    });
  }

  return rates;
}

/**
 * sellTimesale_USD / buyTimesale_USD ブロック内の最初の数値を取得
 */
function extractRateFromTimesale(html: string, id: string): number | null {
  const idIdx = html.indexOf(`id="${id}"`);
  if (idIdx === -1) return null;

  // ブロック内の最初の rateA div の数値を取得
  const block = html.substring(idIdx, idIdx + 500);
  const match = block.match(/rateA[^>]*>.*?(\d+\.?\d+)/s);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
}

/**
 * HTMLから特定IDの要素の数値を抽出
 * パターン: id="sellrateA_USD">161.63< や id="sellrateA_USD">161.63</span>
 */
function extractRateById(html: string, id: string): number | null {
  // パターン1: id="xxx">数値<
  const pattern1 = new RegExp(`id=["']${id}["'][^>]*>([\\d,.]+)<`, 'i');
  const match1 = html.match(pattern1);
  if (match1) {
    const val = parseFloat(match1[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) return val;
  }

  // パターン2: id="xxx" の後に数値が来る（途中にタグがある場合）
  const idIdx = html.indexOf(`id="${id}"`);
  if (idIdx === -1) return null;

  const afterId = html.substring(idIdx, idIdx + 200);
  const match2 = afterId.match(/>([0-9]+(?:\.[0-9]+)?)</);
  if (match2) {
    const val = parseFloat(match2[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

export const DORU_EURO_URL = 'https://doru.jp';
// ドルユーロのchain_idは新規追加が必要
// マイグレーションで追加後、ここを更新する
export const DORU_EURO_CHAIN_ID = 14;
