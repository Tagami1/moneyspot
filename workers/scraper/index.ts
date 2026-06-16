/**
 * MoneySpot レート自動取得 Cloudflare Worker
 *
 * Cron Triggers で定期実行し、各両替所サイトからレートをスクレイピングして
 * Supabase に保存する。
 *
 * 対応店舗:
 * 1. エクスチェンジャーズ (chain_id: 7) - 購入レートのみ
 * 2. ドルユーロ (chain_id: 14) - 買い・売り両方
 * 3. インターバンク (chain_id: 6) - 買い・売り両方
 * 4. J・マーケット (chain_id: 10) - 買い・売り両方
 * 5. ドルレンジャー (chain_id: 5) - 買い・売り両方
 * 6. ワールドカレンシーショップ (chain_id: 3) - 買い・売り両方
 * 7. GPA (chain_id: 4/19) - 買い・売り両方
 * 8. トラベレックス (chain_id: 2) - 売りレートのみ（JSON API）
 * 9. チケッティ (chain_id: 16) - 買いレートのみ
 * ※ チケットレンジャー (chain_id: 9) はドルレンジャーと同系列でレート共有
 */

import { parseExchangers, EXCHANGERS_URL, EXCHANGERS_CHAIN_ID } from './parsers/exchangers';
import { parseDoruEuro, DORU_EURO_URL, DORU_EURO_CHAIN_ID } from './parsers/doru-euro';
import { parseInterbank, INTERBANK_URL, INTERBANK_CHAIN_ID } from './parsers/interbank';
import { parseJMarket, J_MARKET_URL, J_MARKET_CHAIN_ID } from './parsers/j-market';
import { parseDollarRanger, DOLLAR_RANGER_URL, DOLLAR_RANGER_CHAIN_ID } from './parsers/dollar-ranger';
import { parseWorldCurrencyShop, WORLD_CURRENCY_SHOP_URL, WORLD_CURRENCY_SHOP_CHAIN_ID } from './parsers/world-currency-shop';
import { parseGPA, GPA_URL, GPA_CHAIN_ID, GPA_CHAIN_ID_ALT } from './parsers/gpa';
import { parseTravelex, TRAVELEX_URL, TRAVELEX_CHAIN_ID } from './parsers/travelex';

// チケットレンジャー(chain_id:9)はドルレンジャー(chain_id:5)と同系列 → レート共有
const TICKET_RANGER_CHAIN_ID = 9;

// ---------- 型定義 ----------

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface ParsedRate {
  currency_code: string;
  buy_rate: number | null;
  sell_rate: number | null;
}

interface ShopConfig {
  name: string;
  chain_id: number;
  url: string;
  parser: (html: string) => ParsedRate[];
}

interface ScrapeResult {
  shop_name: string;
  chain_id: number;
  status: 'success' | 'error' | 'timeout' | 'parse_error';
  rates: ParsedRate[];
  error_message?: string;
  duration_ms: number;
}

// ---------- 店舗設定 ----------

const SHOPS: ShopConfig[] = [
  {
    name: 'エクスチェンジャーズ',
    chain_id: EXCHANGERS_CHAIN_ID,
    url: EXCHANGERS_URL,
    parser: parseExchangers,
  },
  {
    name: 'ドルユーロ',
    chain_id: DORU_EURO_CHAIN_ID,
    url: DORU_EURO_URL,
    parser: parseDoruEuro,
  },
  {
    name: 'インターバンク',
    chain_id: INTERBANK_CHAIN_ID,
    url: INTERBANK_URL,
    parser: parseInterbank,
  },
  {
    name: 'J・マーケット',
    chain_id: J_MARKET_CHAIN_ID,
    url: J_MARKET_URL,
    parser: parseJMarket,
  },
  {
    name: 'ドルレンジャー',
    chain_id: DOLLAR_RANGER_CHAIN_ID,
    url: DOLLAR_RANGER_URL,
    parser: parseDollarRanger,
  },
  {
    name: 'ワールドカレンシーショップ',
    chain_id: WORLD_CURRENCY_SHOP_CHAIN_ID,
    url: WORLD_CURRENCY_SHOP_URL,
    parser: parseWorldCurrencyShop,
  },
  {
    name: 'GPA',
    chain_id: GPA_CHAIN_ID,
    url: GPA_URL,
    parser: parseGPA,
  },
  {
    name: 'トラベレックス',
    chain_id: TRAVELEX_CHAIN_ID,
    url: TRAVELEX_URL,
    parser: parseTravelex,
  },
  // チケッティは個別通貨ページのため、subrequest制限で一括取得困難。スキップ。
];

// ---------- Supabase クライアント ----------

class SupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url.replace(/\/$/, '');
    this.key = key;
  }

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.url}/rest/v1/${path}`;
    const headers: Record<string, string> = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...(options.headers as Record<string, string> || {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * chain_id から shop_id 一覧を取得
   */
  async getShopIdsByChainId(chainId: number): Promise<number[]> {
    const resp = await this.request(
      `exchange_shops?chain_id=eq.${chainId}&is_active=eq.true&select=id`,
      { method: 'GET', headers: { 'Prefer': '' } }
    );
    if (!resp.ok) {
      throw new Error(`Failed to get shops for chain ${chainId}: ${resp.status}`);
    }
    const shops: { id: number }[] = await resp.json();
    return shops.map(s => s.id);
  }

  /**
   * 複数のchain_idからshop_id一覧を一括取得（1リクエスト）
   */
  async getShopIdsByChainIds(chainIds: number[]): Promise<Map<number, number[]>> {
    const filter = `chain_id=in.(${chainIds.join(',')})&is_active=eq.true&select=id,chain_id`;
    const resp = await this.request(
      `exchange_shops?${filter}`,
      { method: 'GET', headers: { 'Prefer': '' } }
    );
    if (!resp.ok) {
      throw new Error(`Failed to get shops: ${resp.status}`);
    }
    const shops: { id: number; chain_id: number }[] = await resp.json();
    const result = new Map<number, number[]>();
    for (const shop of shops) {
      const ids = result.get(shop.chain_id) || [];
      ids.push(shop.id);
      result.set(shop.chain_id, ids);
    }
    return result;
  }

  /**
   * 指定した店舗IDの古いレートを削除
   */
  async deleteRatesForShops(shopIds: number[]): Promise<void> {
    if (shopIds.length === 0) return;
    const filter = `shop_id=in.(${shopIds.join(',')})`;
    const resp = await this.request(`exchange_rates?${filter}`, {
      method: 'DELETE',
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.warn(`Failed to delete old rates: ${resp.status} ${text}`);
    }
  }

  /**
   * レートを一括挿入
   */
  async insertRates(rates: {
    shop_id: number;
    currency_code: string;
    buy_rate: number | null;
    sell_rate: number | null;
    fetched_at: string;
  }[]): Promise<void> {
    if (rates.length === 0) return;

    const resp = await this.request('exchange_rates', {
      method: 'POST',
      body: JSON.stringify(rates),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Failed to insert rates: ${resp.status} ${text}`);
    }
  }

  /**
   * スクレイピングログを記録
   */
  async insertScrapingLog(log: {
    shop_id: number;
    status: string;
    currencies_count: number;
    error_message?: string;
    duration_ms: number;
  }): Promise<void> {
    const resp = await this.request('scraping_logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });

    if (!resp.ok) {
      console.error(`Failed to insert scraping log: ${resp.status}`);
    }
  }

  /**
   * マテリアライズドビューをリフレッシュ（RPC経由）
   */
  async refreshLatestRatesView(): Promise<void> {
    const resp = await fetch(`${this.url}/rest/v1/rpc/refresh_rates_latest`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    if (!resp.ok) {
      // RPC関数が未作成の場合は警告のみ
      console.warn(`Failed to refresh materialized view: ${resp.status}`);
    }
  }
}

// ---------- スクレイピング実行 ----------

/**
 * 1店舗のスクレイピングを実行
 */
async function scrapeShop(shop: ShopConfig): Promise<ScrapeResult> {
  const startTime = Date.now();

  try {
    // HTML取得（タイムアウト10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(shop.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MoneySpot-Bot/1.0 (rate aggregation service)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        shop_name: shop.name,
        chain_id: shop.chain_id,
        status: 'error',
        rates: [],
        error_message: `HTTP ${response.status}: ${response.statusText}`,
        duration_ms: Date.now() - startTime,
      };
    }

    const html = await response.text();

    // パース実行
    const rates = shop.parser(html);

    if (rates.length === 0) {
      return {
        shop_name: shop.name,
        chain_id: shop.chain_id,
        status: 'parse_error',
        rates: [],
        error_message: 'No rates parsed from HTML',
        duration_ms: Date.now() - startTime,
      };
    }

    return {
      shop_name: shop.name,
      chain_id: shop.chain_id,
      status: 'success',
      rates,
      duration_ms: Date.now() - startTime,
    };

  } catch (err) {
    const error = err as Error;
    const isTimeout = error.name === 'AbortError';

    return {
      shop_name: shop.name,
      chain_id: shop.chain_id,
      status: isTimeout ? 'timeout' : 'error',
      rates: [],
      error_message: error.message,
      duration_ms: Date.now() - startTime,
    };
  }
}

/**
 * 全店舗のスクレイピング結果をSupabaseに保存
 * Cloudflare Workers の subrequest 制限（50/invocation）を考慮し、
 * リクエスト数を最小化する
 */
async function saveResults(
  supabase: SupabaseClient,
  results: ScrapeResult[],
  fetchedAt: string,
): Promise<void> {
  // 全チェーンのshop_idを一括取得するために、必要なchain_idを集める
  const allChainIds = new Set<number>();
  for (const result of results) {
    allChainIds.add(result.chain_id);
    if (result.chain_id === GPA_CHAIN_ID) {
      allChainIds.add(GPA_CHAIN_ID_ALT);
    }
    if (result.chain_id === DOLLAR_RANGER_CHAIN_ID) {
      allChainIds.add(TICKET_RANGER_CHAIN_ID);
    }
  }

  // 全chain_idのshop_idを一括取得（1リクエスト）
  const allShopIds = await supabase.getShopIdsByChainIds([...allChainIds]);

  // 全レートを1つの配列にまとめて一括挿入
  const allRateRows: {
    shop_id: number;
    currency_code: string;
    buy_rate: number | null;
    sell_rate: number | null;
    fetched_at: string;
  }[] = [];

  for (const result of results) {
    if (result.status !== 'success' || result.rates.length === 0) continue;

    // このチェーンに属する店舗IDを取得
    let shopIds = allShopIds.get(result.chain_id) || [];
    if (result.chain_id === GPA_CHAIN_ID) {
      const altIds = allShopIds.get(GPA_CHAIN_ID_ALT) || [];
      shopIds = [...shopIds, ...altIds];
    }
    if (result.chain_id === DOLLAR_RANGER_CHAIN_ID) {
      const trIds = allShopIds.get(TICKET_RANGER_CHAIN_ID) || [];
      shopIds = [...shopIds, ...trIds];
    }

    if (shopIds.length === 0) {
      console.warn(`No active shops for chain_id: ${result.chain_id} (${result.shop_name})`);
      continue;
    }

    for (const shopId of shopIds) {
      for (const rate of result.rates) {
        allRateRows.push({
          shop_id: shopId,
          currency_code: rate.currency_code,
          buy_rate: rate.buy_rate,
          sell_rate: rate.sell_rate,
          fetched_at: fetchedAt,
        });
      }
    }
  }

  // レートがある店舗の古いデータを削除してから新規挿入
  if (allRateRows.length > 0) {
    const affectedShopIds = [...new Set(allRateRows.map(r => r.shop_id))];
    await supabase.deleteRatesForShops(affectedShopIds);

    const BATCH_SIZE = 500;
    for (let i = 0; i < allRateRows.length; i += BATCH_SIZE) {
      const batch = allRateRows.slice(i, i + BATCH_SIZE);
      await supabase.insertRates(batch);
    }
    console.log(`Inserted ${allRateRows.length} rate rows for ${affectedShopIds.length} shops`);
  }
}

// ---------- Worker エクスポート ----------

const worker = {
  /**
   * Cron Trigger ハンドラー
   * 定期実行時に全店舗のレートを取得してSupabaseに保存する
   */
  async scheduled(
    controller: ScheduledController,
    env: Env,
  ): Promise<void> {
    console.log(`[MoneySpot Scraper] Cron triggered at ${new Date().toISOString()}`);

    const supabase = new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    const fetchedAt = new Date().toISOString();

    // 全店舗を並行してスクレイピング
    const results = await Promise.all(SHOPS.map(shop => scrapeShop(shop)));

    // 結果のサマリーをログ出力
    for (const result of results) {
      const rateCount = result.rates.length;
      console.log(
        `[${result.shop_name}] ${result.status} - ${rateCount} currencies` +
        (result.error_message ? ` (${result.error_message})` : '')
      );
    }

    // Supabaseに保存
    await saveResults(supabase, results, fetchedAt);

    // マテリアライズドビューをリフレッシュ
    await supabase.refreshLatestRatesView();

    console.log(`[MoneySpot Scraper] Completed at ${new Date().toISOString()}`);
  },

  /**
   * HTTP リクエストハンドラー（手動実行・デバッグ用）
   */
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const url = new URL(request.url);

    // ヘルスチェック
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 手動実行（/scrape）
    if (url.pathname === '/scrape') {
      const supabase = new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
      const fetchedAt = new Date().toISOString();

      // 特定店舗のみ実行する場合: /scrape?shop=exchangers
      const shopParam = url.searchParams.get('shop');
      let targetShops = SHOPS;

      if (shopParam) {
        const shopMap: Record<string, ShopConfig> = {
          'exchangers': SHOPS[0],
          'doru-euro': SHOPS[1],
          'doru': SHOPS[1],
          'interbank': SHOPS[2],
          'j-market': SHOPS[3],
          'jmarket': SHOPS[3],
          'dollar-ranger': SHOPS[4],
          'ranger': SHOPS[4],
          'wcs': SHOPS[5],
          'world-currency': SHOPS[5],
          'gpa': SHOPS[6],
          'travelex': SHOPS[7],
        };
        const target = shopMap[shopParam.toLowerCase()];
        if (target) {
          targetShops = [target];
        } else {
          return new Response(JSON.stringify({
            error: 'Unknown shop',
            available: Object.keys(shopMap),
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      const results = await Promise.all(targetShops.map(shop => scrapeShop(shop)));

      // dry-runモード: DBに保存せずに結果だけ返す
      const dryRun = url.searchParams.get('dry') === '1';
      if (!dryRun) {
        await saveResults(supabase, results, fetchedAt);
        await supabase.refreshLatestRatesView();
      }

      // レスポンスを整形
      const response = results.map(r => ({
        shop: r.shop_name,
        status: r.status,
        currencies_count: r.rates.length,
        rates: r.rates,
        error: r.error_message || null,
        duration_ms: r.duration_ms,
        dry_run: dryRun,
      }));

      return new Response(JSON.stringify(response, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // デフォルト
    return new Response(JSON.stringify({
      name: 'MoneySpot Rate Scraper',
      endpoints: {
        '/health': 'Health check',
        '/scrape': 'Run scraping (all shops)',
        '/scrape?shop=exchangers': 'Run scraping (specific shop)',
        '/scrape?dry=1': 'Dry run (no DB save)',
      },
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

export default worker;
