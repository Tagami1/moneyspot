/**
 * GPA (gpa-net.co.jp) パーサー
 *
 * 特徴:
 * - /ja/passenger-service/rate/ にレート一覧がある
 * - HTMLテーブル形式（tableArea クラス）
 * - 円→外貨（sell）と 外貨→円（buy）の2列
 * - 34通貨対応
 * - 成田空港の両替専門店
 * - chain_id: 4 (003_seed_shops.sqlでは元々GPAだが、007でchain_id:19として再追加)
 *   → 実際のchain_idはDB確認が必要
 */

export interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;  // 外貨→円（店が買う）
  sell_rate: number | null; // 円→外貨（店が売る）
}

// GPAで使われる通貨名 → コード
const CURRENCY_MAP: Record<string, string> = {
  'アメリカ ドル': 'USD',
  'アメリカドル': 'USD',
  '米ドル': 'USD',
  'ユーロ': 'EUR',
  '英国 ポンド': 'GBP',
  'イギリスポンド': 'GBP',
  '英ポンド': 'GBP',
  'オーストラリア ドル': 'AUD',
  'オーストラリアドル': 'AUD',
  '豪ドル': 'AUD',
  'カナダ ドル': 'CAD',
  'カナダドル': 'CAD',
  'スイス フラン': 'CHF',
  'スイスフラン': 'CHF',
  '中国 元': 'CNY',
  '中国元': 'CNY',
  '人民元': 'CNY',
  '韓国 ウォン': 'KRW',
  '韓国ウォン': 'KRW',
  '台湾 ドル': 'TWD',
  '台湾ドル': 'TWD',
  '香港 ドル': 'HKD',
  '香港ドル': 'HKD',
  'シンガポール ドル': 'SGD',
  'シンガポールドル': 'SGD',
  'タイ バーツ': 'THB',
  'タイバーツ': 'THB',
  'フィリピン ペソ': 'PHP',
  'フィリピンペソ': 'PHP',
  'インドネシア ルピア': 'IDR',
  'インドネシアルピア': 'IDR',
  'ベトナム ドン': 'VND',
  'ベトナムドン': 'VND',
  'マレーシア リンギット': 'MYR',
  'マレーシアリンギット': 'MYR',
  'ニュージーランド ドル': 'NZD',
  'ニュージーランドドル': 'NZD',
  'NZドル': 'NZD',
};

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

/**
 * GPAのHTMLからレートを抽出
 *
 * テーブル構造:
 *   <td class="table-td2">アメリカ ドル</td>
 *   <td class="table-td3">162.22</td>  ← 円→外貨 = sell_rate
 *   <td class="table-td4">155.52</td>  ← 外貨→円 = buy_rate
 */
export function parseGPA(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();

  // テーブル行を分割
  const rows = html.split(/<tr[^>]*>/i);

  for (const row of rows) {
    // table-td2（通貨名）を含む行のみ処理
    if (!row.includes('table-td2') && !row.includes('table-td3')) continue;

    // 通貨名を取得
    const nameMatch = row.match(/table-td2[^>]*>([^<]+)</);
    if (!nameMatch) continue;

    const currencyName = nameMatch[1].trim();
    let currencyCode: string | null = null;

    // 通貨名からコードを特定
    for (const [name, code] of Object.entries(CURRENCY_MAP)) {
      if (currencyName.includes(name) || name.includes(currencyName)) {
        currencyCode = code;
        break;
      }
    }

    if (!currencyCode || !SUPPORTED_CURRENCIES.includes(currencyCode)) continue;
    if (found.has(currencyCode)) continue;

    // sell_rate (table-td3: 円→外貨)
    const sellMatch = row.match(/table-td3[^>]*>([\d,.]+)/);
    let sellRate: number | null = null;
    if (sellMatch) {
      const val = parseFloat(sellMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) sellRate = val;
    }

    // buy_rate (table-td4: 外貨→円)
    const buyMatch = row.match(/table-td4[^>]*>([\d,.]+)/);
    let buyRate: number | null = null;
    if (buyMatch) {
      const val = parseFloat(buyMatch[1].replace(/,/g, ''));
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

  // フォールバック: テーブル以外の形式
  if (rates.length < 3) {
    return parseGPAFallback(html);
  }

  return rates;
}

/**
 * フォールバック: テキストベースの抽出
 */
function parseGPAFallback(html: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  const found = new Set<string>();
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  for (const [name, code] of Object.entries(CURRENCY_MAP)) {
    if (!SUPPORTED_CURRENCIES.includes(code)) continue;
    if (found.has(code)) continue;

    const idx = text.indexOf(name);
    if (idx === -1) continue;

    const afterName = text.substring(idx + name.length, idx + name.length + 200);
    const numbers: number[] = [];
    const numPattern = /([\d,]+\.?\d*)/g;
    let match;
    while ((match = numPattern.exec(afterName)) !== null) {
      const n = parseFloat(match[1].replace(/,/g, ''));
      if (n >= 0.001 && n < 100000) {
        numbers.push(n);
      }
      if (numbers.length >= 2) break;
    }

    if (numbers.length >= 2) {
      found.add(code);
      rates.push({
        currency_code: code,
        sell_rate: numbers[0],
        buy_rate: numbers[1],
      });
    }
  }

  return rates;
}

export const GPA_URL = 'https://www.gpa-net.co.jp/ja/passenger-service/rate/';
// GPAは003ではchain_id:4、007ではchain_id:19で追加
// 両方の店舗に同じレートを適用する
export const GPA_CHAIN_ID = 4;
export const GPA_CHAIN_ID_ALT = 19;
