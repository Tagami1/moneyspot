/**
 * MoneySpot 参考レート取得 Cloudflare Worker
 *
 * 無料の為替レートAPIからミッドマーケットレートを取得し、
 * OSMソースの両替所に参考レート（reference rate）を設定する。
 *
 * - プライマリAPI: open.er-api.com（無料・APIキー不要）
 * - フォールバックAPI: currency-api.pages.dev（無料・APIキー不要）
 * - 対象通貨: 16通貨（currencies テーブルに登録済みのもの）
 * - 対象店舗: source='osm' かつ直近24時間以内に 'actual' レートがない店舗
 * - スプレッド: sell_rate = mid * 1.03, buy_rate = mid * 0.97
 */

// ---------- 型定義 ----------

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

/** open.er-api.com のレスポンス */
interface ErApiResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

/** currency-api.pages.dev のレスポンス */
interface CurrencyApiResponse {
  date: string;
  jpy: Record<string, number>;
}

interface MidRates {
  [currencyCode: string]: number; // JPYあたりの各通貨レート（例: 1 JPY = 0.0067 USD）
}

// ---------- 定数 ----------

const TARGET_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'TWD', 'HKD', 'SGD', 'THB', 'PHP', 'IDR', 'VND', 'MYR',
];

const PRIMARY_API_URL = 'https://open.er-api.com/v6/latest/JPY';
const FALLBACK_API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/jpy.json';

/** sell_rate（店が外貨を売る）のマークアップ率 */
const SELL_SPREAD = 1.03;
/** buy_rate（店が外貨を買う）のディスカウント率 */
const BUY_SPREAD = 0.97;

/** Supabaseへのバッチupsertサイズ */
const BATCH_SIZE = 50;

// ---------- レート取得 ----------

/**
 * プライマリAPI（open.er-api.com）からレート取得
 * 1 JPY = X 外貨 の形式で返す
 */
async function fetchFromPrimaryApi(): Promise<MidRates> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(PRIMARY_API_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MoneySpot-Bot/1.0' },
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`Primary API returned HTTP ${resp.status}`);
    }

    const data: ErApiResponse = await resp.json();
    if (data.result !== 'success') {
      throw new Error(`Primary API result: ${data.result}`);
    }

    // data.rates は 1 JPY = X 外貨 の形式
    const midRates: MidRates = {};
    for (const code of TARGET_CURRENCIES) {
      const rate = data.rates[code];
      if (rate && rate > 0) {
        midRates[code] = rate;
      }
    }
    return midRates;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * フォールバックAPI（currency-api.pages.dev）からレート取得
 * 1 JPY = X 外貨 の形式で返す
 */
async function fetchFromFallbackApi(): Promise<MidRates> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const resp = await fetch(FALLBACK_API_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MoneySpot-Bot/1.0' },
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`Fallback API returned HTTP ${resp.status}`);
    }

    const data: CurrencyApiResponse = await resp.json();

    // data.jpy は 1 JPY = X 外貨 の形式（キーは小文字）
    const midRates: MidRates = {};
    for (const code of TARGET_CURRENCIES) {
      const rate = data.jpy[code.toLowerCase()];
      if (rate && rate > 0) {
        midRates[code] = rate;
      }
    }
    return midRates;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * レートを取得（プライマリ → フォールバック）
 */
async function fetchMidRates(): Promise<MidRates> {
  try {
    console.log('Fetching from primary API...');
    const rates = await fetchFromPrimaryApi();
    if (Object.keys(rates).length >= 10) {
      console.log(`Primary API: got ${Object.keys(rates).length} currencies`);
      return rates;
    }
    console.warn(`Primary API returned only ${Object.keys(rates).length} currencies, trying fallback`);
  } catch (err) {
    console.error(`Primary API failed: ${(err as Error).message}`);
  }

  console.log('Fetching from fallback API...');
  const rates = await fetchFromFallbackApi();
  console.log(`Fallback API: got ${Object.keys(rates).length} currencies`);
  return rates;
}

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
   * source='osm' のアクティブな店舗IDを全取得
   */
  async getOsmShopIds(): Promise<number[]> {
    const resp = await this.request(
      'exchange_shops?source=eq.osm&is_active=eq.true&select=id',
      { method: 'GET', headers: { 'Prefer': '' } }
    );
    if (!resp.ok) {
      throw new Error(`Failed to get OSM shops: ${resp.status} ${await resp.text()}`);
    }
    const shops: { id: number }[] = await resp.json();
    return shops.map(s => s.id);
  }

  /**
   * 直近24時間以内に 'actual' レートがある店舗IDを取得
   */
  async getShopsWithRecentActualRates(): Promise<Set<number>> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const resp = await this.request(
      `exchange_rates?rate_type=eq.actual&fetched_at=gte.${twentyFourHoursAgo}&select=shop_id`,
      { method: 'GET', headers: { 'Prefer': '' } }
    );
    if (!resp.ok) {
      // エラーでも空セットを返して処理続行（全店舗に参考レートを設定）
      console.warn(`Failed to check recent actual rates: ${resp.status}`);
      return new Set();
    }
    const rows: { shop_id: number }[] = await resp.json();
    return new Set(rows.map(r => r.shop_id));
  }

  /**
   * 対象店舗の古い reference レートを削除
   */
  async deleteReferenceRatesForShops(shopIds: number[]): Promise<void> {
    if (shopIds.length === 0) return;

    // shopIds が多い場合、バッチで削除
    const BATCH = 100;
    for (let i = 0; i < shopIds.length; i += BATCH) {
      const batch = shopIds.slice(i, i + BATCH);
      const filter = `shop_id=in.(${batch.join(',')})&rate_type=eq.reference`;
      const resp = await this.request(`exchange_rates?${filter}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        console.warn(`Failed to delete reference rates batch: ${resp.status}`);
      }
    }
  }

  /**
   * レートを一括挿入（バッチサイズ指定）
   */
  async insertRatesBatch(rates: {
    shop_id: number;
    currency_code: string;
    buy_rate: number;
    sell_rate: number;
    rate_type: string;
    fetched_at: string;
  }[]): Promise<void> {
    if (rates.length === 0) return;

    for (let i = 0; i < rates.length; i += BATCH_SIZE) {
      const batch = rates.slice(i, i + BATCH_SIZE);
      const resp = await this.request('exchange_rates', {
        method: 'POST',
        body: JSON.stringify(batch),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to insert reference rates (batch ${i / BATCH_SIZE + 1}): ${resp.status} ${text}`);
      }
    }
  }

  /**
   * マテリアライズドビューをリフレッシュ
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
      console.warn(`Failed to refresh materialized view: ${resp.status}`);
    }
  }
}

// ---------- メインロジック ----------

/**
 * ミッドマーケットレートからスプレッド適用済みレートを計算
 *
 * midRate は 1 JPY = X 外貨 の形式。
 * exchange_rates テーブルの sell_rate/buy_rate は「円建て」で格納する。
 * - sell_rate: 顧客が外貨1単位を買うのに必要な円（= 1/midRate にマークアップ）
 * - buy_rate: 顧客が外貨1単位を売って受け取る円（= 1/midRate にディスカウント）
 */
function calculateShopRates(midRate: number): { sell_rate: number; buy_rate: number } {
  // 1外貨あたりの円レート（ミッドマーケット）
  const midJpyPerUnit = 1 / midRate;

  return {
    sell_rate: Math.round(midJpyPerUnit * SELL_SPREAD * 10000) / 10000,
    buy_rate: Math.round(midJpyPerUnit * BUY_SPREAD * 10000) / 10000,
  };
}

/**
 * 参考レート取得・保存のメイン処理
 */
async function processReferenceRates(env: Env): Promise<{
  currenciesFetched: number;
  targetShops: number;
  ratesInserted: number;
}> {
  const supabase = new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const fetchedAt = new Date().toISOString();

  // 1. ミッドマーケットレートを取得
  const midRates = await fetchMidRates();
  const currenciesFetched = Object.keys(midRates).length;

  if (currenciesFetched === 0) {
    throw new Error('No mid-market rates fetched from any API');
  }

  // 2. OSM店舗を取得
  const osmShopIds = await supabase.getOsmShopIds();
  console.log(`OSM shops found: ${osmShopIds.length}`);

  if (osmShopIds.length === 0) {
    return { currenciesFetched, targetShops: 0, ratesInserted: 0 };
  }

  // 3. 直近24時間以内にactualレートがある店舗を除外
  const recentActualShops = await supabase.getShopsWithRecentActualRates();
  const targetShopIds = osmShopIds.filter(id => !recentActualShops.has(id));
  console.log(`Target shops (excluding ${recentActualShops.size} with recent actual rates): ${targetShopIds.length}`);

  if (targetShopIds.length === 0) {
    return { currenciesFetched, targetShops: 0, ratesInserted: 0 };
  }

  // 4. 古い reference レートを削除
  await supabase.deleteReferenceRatesForShops(targetShopIds);

  // 5. 新しい reference レートを挿入
  const allRates: {
    shop_id: number;
    currency_code: string;
    buy_rate: number;
    sell_rate: number;
    rate_type: string;
    fetched_at: string;
  }[] = [];

  for (const shopId of targetShopIds) {
    for (const [code, midRate] of Object.entries(midRates)) {
      const { sell_rate, buy_rate } = calculateShopRates(midRate);
      allRates.push({
        shop_id: shopId,
        currency_code: code,
        buy_rate,
        sell_rate,
        rate_type: 'reference',
        fetched_at: fetchedAt,
      });
    }
  }

  await supabase.insertRatesBatch(allRates);
  console.log(`Inserted ${allRates.length} reference rate rows for ${targetShopIds.length} shops`);

  // 6. マテリアライズドビューをリフレッシュ
  await supabase.refreshLatestRatesView();

  return {
    currenciesFetched,
    targetShops: targetShopIds.length,
    ratesInserted: allRates.length,
  };
}

// ---------- Worker エクスポート ----------

const worker = {
  /**
   * Cron Trigger ハンドラー
   */
  async scheduled(
    controller: ScheduledController,
    env: Env,
  ): Promise<void> {
    console.log(`[Reference Rates] Cron triggered at ${new Date().toISOString()}`);

    try {
      const result = await processReferenceRates(env);
      console.log(
        `[Reference Rates] Completed: ${result.currenciesFetched} currencies, ` +
        `${result.targetShops} shops, ${result.ratesInserted} rates inserted`
      );
    } catch (err) {
      console.error(`[Reference Rates] Error: ${(err as Error).message}`);
      throw err;
    }
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
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // レート確認（APIから取得したミッドマーケットレートを表示）
    if (url.pathname === '/rates') {
      try {
        const midRates = await fetchMidRates();
        const ratesWithSpread: Record<string, {
          mid_jpy_per_unit: number;
          sell_rate: number;
          buy_rate: number;
        }> = {};

        for (const [code, midRate] of Object.entries(midRates)) {
          const { sell_rate, buy_rate } = calculateShopRates(midRate);
          ratesWithSpread[code] = {
            mid_jpy_per_unit: Math.round((1 / midRate) * 10000) / 10000,
            sell_rate,
            buy_rate,
          };
        }

        return new Response(JSON.stringify({
          currencies: Object.keys(midRates).length,
          rates: ratesWithSpread,
          fetched_at: new Date().toISOString(),
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({
          error: (err as Error).message,
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 手動実行
    if (url.pathname === '/run') {
      const dryRun = url.searchParams.get('dry') === '1';

      try {
        if (dryRun) {
          const midRates = await fetchMidRates();
          return new Response(JSON.stringify({
            dry_run: true,
            currencies_fetched: Object.keys(midRates).length,
            rates: Object.fromEntries(
              Object.entries(midRates).map(([code, mid]) => {
                const { sell_rate, buy_rate } = calculateShopRates(mid);
                return [code, { mid_jpy_per_unit: Math.round((1 / mid) * 10000) / 10000, sell_rate, buy_rate }];
              })
            ),
          }, null, 2), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const result = await processReferenceRates(env);
        return new Response(JSON.stringify({
          status: 'ok',
          ...result,
          executed_at: new Date().toISOString(),
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({
          error: (err as Error).message,
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // デフォルト
    return new Response(JSON.stringify({
      name: 'MoneySpot Reference Rates Worker',
      endpoints: {
        '/health': 'Health check',
        '/rates': 'View current mid-market rates with spread',
        '/run': 'Run reference rate update',
        '/run?dry=1': 'Dry run (fetch rates only, no DB save)',
      },
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

export default worker;
