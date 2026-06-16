/**
 * J・マーケット (j-market.co.jp/gaika) パーサー
 *
 * 特徴:
 * - /gaika ページにレート一覧がある
 * - 「円→外貨（売却）」と「外貨→円（買取）」の2列
 * - 最終更新日時がページ上に表示される
 * - 17通貨を扱う
 * - chain_id: 10
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う = 買取）
  sell_rate: number | null; // 円→外貨（店が売る = 売却）
}

// J・マーケットで使われる通貨名 → コードマッピング
const CURRENCY_MAP: Record<string, string> = {
  'アメリカドル': 'USD',
  '米ドル': 'USD',
  'EUユーロ': 'EUR',
  'ユーロ': 'EUR',
  '中国元': 'CNY',
  '人民元': 'CNY',
  '韓国ウォン': 'KRW',
  '香港ドル': 'HKD',
  'タイバーツ': 'THB',
  'カナダドル': 'CAD',
  'イギリスポンド': 'GBP',
  '英ポンド': 'GBP',
  'スイスフラン': 'CHF',
  'オーストラリアドル': 'AUD',
  '豪ドル': 'AUD',
  '台湾ドル': 'TWD',
  'ニュージーランドドル': 'NZD',
  'NZドル': 'NZD',
  'シンガポールドル': 'SGD',
  'フィリピンペソ': 'PHP',
  'インドネシアルピア': 'IDR',
  'マレーシアリンギット': 'MYR',
  'ベトナムドン': 'VND',
};

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * J・マーケットのHTMLからレートを抽出
 *
 * ページ構造:
 * - 通貨コード（USD等）と通貨名の後に、売却レートと買取レートが並ぶ
 * - 「円→外貨」= 売却（店のsell_rate）
 * - 「外貨→円」= 買取（店のbuy_rate）
 */
export function parseJMarket(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // gaikatable 部分だけを抽出して検索する
  const tableStart = html.indexOf('gaikatable');
  if (tableStart === -1) return parseJMarketByName(html);
  const tableSection = html.substring(tableStart);

  // テーブル行を分割して処理
  const rows = tableSection.split(/<tr[^>]*class="gaikatable__row"[^>]*>/i);

  for (const row of rows) {
    // <td> の中身を全て取得
    const tdContents: string[] = [];
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let match;
    while ((match = tdPattern.exec(row)) !== null) {
      tdContents.push(match[1].replace(/<[^>]+>/g, '').trim());
    }

    // 最低5列必要: flag, code, name, sell, buy
    if (tdContents.length < 4) continue;

    // 通貨コードを探す（2番目か1番目のtd）
    let code: string | null = null;
    for (const td of tdContents) {
      if (SUPPORTED_CURRENCIES.includes(td)) {
        code = td;
        break;
      }
    }
    if (!code || found.has(code)) continue;

    // 最後の2つの数値列を sell, buy とする
    const numbers: number[] = [];
    for (const td of tdContents) {
      const n = parseFloat(td.replace(/,/g, ''));
      if (!isNaN(n) && n > 0 && n < 100000) {
        numbers.push(n);
      }
    }

    if (numbers.length >= 2) {
      found.add(code);
      rates.push({
        currency_code: code,
        sell_rate: numbers[numbers.length - 2], // 円→外貨
        buy_rate: numbers[numbers.length - 1],  // 外貨→円
      });
    }
  }

  // テーブルパースで不足した場合は名前ベースで補完
  if (rates.length < 5) {
    const byName = parseJMarketByName(html);
    for (const r of byName) {
      if (!found.has(r.currency_code)) {
        rates.push(r);
      }
    }
  }

  return rates;
}

/**
 * 通貨名ベースのフォールバックパーサー
 */
function parseJMarketByName(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // HTMLタグを除去したテキストで探す
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  for (const [jaName, code] of Object.entries(CURRENCY_MAP)) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;
    if (found.has(code)) continue;

    const nameIdx = text.indexOf(jaName);
    if (nameIdx === -1) continue;

    const afterName = text.substring(nameIdx + jaName.length, nameIdx + jaName.length + 200);
    const numbers = extractNumbersFromText(afterName);

    if (numbers.length >= 2) {
      found.add(code);
      rates.push({
        currency_code: code,
        sell_rate: numbers[0], // 円→外貨
        buy_rate: numbers[1],  // 外貨→円
      });
    }
  }

  return rates;
}

/**
 * プレーンテキストから数値を抽出
 */
function extractNumbersFromText(text: string): number[] {
  const numbers: number[] = [];
  const pattern = /(\d+\.?\d*)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const n = parseFloat(match[1]);
    if (n >= 0.001 && n < 100000) {
      numbers.push(n);
    }
    if (numbers.length >= 2) break;
  }

  return numbers;
}

export const J_MARKET_URL = 'https://www.j-market.co.jp/gaika';
export const J_MARKET_CHAIN_ID = 10;
