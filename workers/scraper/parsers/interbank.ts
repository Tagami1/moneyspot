/**
 * インターバンク (interbank.co.jp) パーサー
 *
 * 特徴:
 * - トップページに「本日の両替価格　手数料込み」セクションがある
 * - 各通貨カードに「ご購入」(we sell) と「ご売却」(we buy) がある
 * - 平日 10:30頃 更新
 * - chain_id: 6
 * - /rate/ ページはJS動的読み込み（Investing.comウィジェット）なので使えない
 * - トップページの静的HTMLからレートを取得する
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = ご売却）
  sell_rate: number | null; // 円→外貨（店が売る = ご購入）
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * インターバンクのトップページHTMLからレートを抽出
 *
 * トップページの構造:
 * 各通貨カードに「ご購入 1$ XXX.XX」「ご売却 1$ XXX.XX」のような
 * テキストが含まれている
 */
export function parseInterbank(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // 通貨コード（USD, EUR等）を直接探す方法
  // パターン: "USD" や通貨名の近くに「ご購入」「ご売却」+数値がある

  // 方法1: 通貨コードをキーにして前後の数値を取得
  for (const code of SUPPORTED_CURRENCIES) {
    const codeIdx = html.indexOf(code);
    if (codeIdx === -1) continue;

    // 通貨コードの前後1000文字を検索対象にする
    const start = Math.max(0, codeIdx - 200);
    const end = Math.min(html.length, codeIdx + 800);
    const section = html.substring(start, end);

    const sellRate = extractPurchaseRate(section);
    const buyRate = extractSellbackRate(section);

    if (sellRate !== null || buyRate !== null) {
      if (!found.has(code)) {
        found.add(code);
        rates.push({
          currency_code: code,
          buy_rate: buyRate,   // ご売却 = 客が外貨を売る = 店が買う
          sell_rate: sellRate,  // ご購入 = 客が外貨を買う = 店が売る
        });
      }
    }
  }

  // 方法1で取れなかった通貨は方法2で: 数値ペアのパターンマッチ
  if (rates.length === 0) {
    return parseInterbankFallback(html);
  }

  return rates;
}

/**
 * 「ご購入」の後の数値を抽出（店がsell = 客がbuy）
 *
 * HTML構造:
 *   <p>ご購入 1＄</p>
 *   <dl class="clearfix"><dt>159.38</dt><dd>we sell</dd></dl>
 *
 * 注意: "1＄" の "1" を誤検出しないよう、<dt>タグ内の数値を取る
 */
function extractPurchaseRate(section: string): number | null {
  // パターン1: ご購入...の後の<dt>タグ内の数値
  const match1 = section.match(/ご購入[\s\S]*?<dt[^>]*>\s*([\d,.]+)\s*<\/dt>/);
  if (match1) {
    const val = parseFloat(match1[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 1) return val;
  }

  // パターン2: "we sell" の前の数値
  const match2 = section.match(/([\d,.]+)\s*<\/dt>\s*<dd[^>]*>\s*we\s+sell/i);
  if (match2) {
    const val = parseFloat(match2[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 1) return val;
  }

  return null;
}

/**
 * 「ご売却」の後の数値を抽出（店がbuy = 客がsell）
 */
function extractSellbackRate(section: string): number | null {
  // パターン1: ご売却...の後の<dt>タグ内の数値
  const match1 = section.match(/ご売却[\s\S]*?<dt[^>]*>\s*([\d,.]+)\s*<\/dt>/);
  if (match1) {
    const val = parseFloat(match1[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 1) return val;
  }

  // パターン2: "we buy" の前の数値
  const match2 = section.match(/([\d,.]+)\s*<\/dt>\s*<dd[^>]*>\s*we\s+buy/i);
  if (match2) {
    const val = parseFloat(match2[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 1) return val;
  }

  return null;
}

/**
 * フォールバック: 連続する2つの数値ペアを通貨レートとして抽出
 * インターバンクのHTMLが想定と異なる場合の代替パース
 */
function parseInterbankFallback(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];

  // 通貨コードの並びに沿って、2つの数値を取得
  const currencyOrder = ['USD', 'EUR', 'CNY', 'KRW', 'HKD', 'TWD', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'THB', 'PHP', 'VND', 'MYR', 'CHF', 'IDR'];

  for (const code of currencyOrder) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;

    // HTMLから通貨コードの位置を探す
    const searchFrom = 0;
    const idx = html.indexOf(code, searchFrom);
    if (idx === -1) continue;

    // 通貨コードの後の範囲でレート数値ペアを探す
    const afterCode = html.substring(idx, idx + 600);

    // 2つの連続した数値パターン（ご購入・ご売却）
    const numPattern = /(\d+\.?\d+)/g;
    const numbers: number[] = [];
    let numMatch;
    while ((numMatch = numPattern.exec(afterCode)) !== null) {
      const n = parseFloat(numMatch[1]);
      if (n > 0 && n < 100000) {
        numbers.push(n);
      }
      if (numbers.length >= 2) break;
    }

    if (numbers.length >= 2) {
      // 通常: 最初がご購入（sell_rate）、次がご売却（buy_rate）
      rates.push({
        currency_code: code,
        buy_rate: numbers[1],
        sell_rate: numbers[0],
      });
    }
  }

  return rates;
}

export const INTERBANK_URL = 'https://www.interbank.co.jp';
export const INTERBANK_CHAIN_ID = 6;
