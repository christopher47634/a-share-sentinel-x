import { getKlineData } from "@/mock/kline";
import { getStockByCode, stocks } from "@/mock/stocks";
import { marketIndices } from "@/mock/market";
import { buildMarketAnalysis } from "@/lib/market-indicators";
import type {
  MarketBreadth,
  MarketCandle,
  MarketDataSource,
  MarketIndexSnapshot,
  MarketQuote,
  MarketSnapshot,
  MarketStockDetail,
  MarketTimeframe,
} from "@/types/market";

const EASTMONEY_REFERER = "https://quote.eastmoney.com/";
const TENCENT_REFERER = "https://gu.qq.com/";
const EASTMONEY_TIMEOUT_MS = 3500;
const TENCENT_TIMEOUT_MS = 5000;

const SOURCE_LABELS: Record<MarketDataSource, string> = {
  eastmoney: "Eastmoney live",
  tencent: "Tencent live",
  mock: "Mock fallback",
};

const QUOTE_FIELDS = [
  "f43",
  "f44",
  "f45",
  "f46",
  "f47",
  "f48",
  "f57",
  "f58",
  "f60",
  "f116",
  "f168",
  "f169",
  "f170",
  "f9",
].join(",");

export const DEFAULT_INDEX_CODES = ["000001", "399001", "399006", "000688", "899050"];

const INDEX_SECIDS: Record<string, string> = {
  "000001": "1.000001",
  "399001": "0.399001",
  "399006": "0.399006",
  "000688": "1.000688",
  "899050": "0.899050",
};

const TENCENT_INDEX_SYMBOLS: Record<string, string> = {
  "000001": "sh000001",
  "399001": "sz399001",
  "399006": "sz399006",
  "000688": "sh000688",
  "899050": "bj899050",
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function secidFor(code: string): string {
  const normalized = code.trim();
  const indexSecid = INDEX_SECIDS[normalized];
  if (indexSecid) return indexSecid;
  if (/^(5|6|9)/.test(normalized)) return `1.${normalized}`;
  return `0.${normalized}`;
}

function tencentSymbolFor(code: string): string {
  const normalized = code.trim();
  const indexSymbol = TENCENT_INDEX_SYMBOLS[normalized];
  if (indexSymbol) return indexSymbol;
  if (/^8/.test(normalized)) return `bj${normalized}`;
  if (/^(5|6|9)/.test(normalized)) return `sh${normalized}`;
  return `sz${normalized}`;
}

function normalizeScaled(value: unknown, scale = 100): number | null {
  if (value === null || value === undefined || value === "-") return null;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return round2(num / scale);
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "-") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value === "-") return null;
  const num = Number(value.replace(/,/g, ""));
  return Number.isFinite(num) ? num : null;
}

function formatCny100M(value: number | null): string {
  if (value === null) return "N/A";
  return `${(value / 100_000_000).toFixed(1)} CNY 100M`;
}

function formatCny100MFromUnit(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)} CNY 100M`;
}

function formatLots(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}B lots`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}M lots`;
  return `${Math.round(value)} lots`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

function beginDateFor(timeframe: MarketTimeframe): string {
  const begin = new Date();
  if (timeframe === "minute") {
    begin.setDate(begin.getDate() - 10);
  } else {
    begin.setFullYear(begin.getFullYear() - 3);
    begin.setDate(begin.getDate() - 7);
  }
  return formatDateYYYYMMDD(begin);
}

function mockQuote(code: string): MarketQuote | null {
  const stock = getStockByCode(code);
  if (!stock) return null;
  return {
    ...stock,
    source: "mock",
    sourceLabel: SOURCE_LABELS.mock,
    updatedAt: nowIso(),
    tradeStatus: "unknown",
  };
}

function mockIndexQuote(code: string): MarketQuote | null {
  const index = marketIndices.find((item) => item.code === code);
  if (!index) return null;
  const prevClose = index.price - index.changeAmount;
  return {
    code: index.code,
    name: index.name,
    price: index.price,
    changePercent: index.changePercent,
    changeAmount: index.changeAmount,
    volume: index.volume,
    turnover: index.turnover,
    turnoverRate: 0,
    marketCap: "N/A",
    pe: 0,
    high: index.high,
    low: index.low,
    open: prevClose,
    prevClose,
    source: "mock",
    sourceLabel: SOURCE_LABELS.mock,
    updatedAt: nowIso(),
    tradeStatus: "unknown",
  };
}

function fallbackQuoteFor(code: string): MarketQuote | null {
  return mockQuote(code) ?? mockIndexQuote(code);
}

function mockCandles(code: string): MarketCandle[] {
  return getKlineData(code).map((item) => ({ ...item }));
}

function bucketKeyFor(candle: MarketCandle, timeframe: MarketTimeframe): string {
  const date = new Date(candle.time * 1000);
  if (timeframe === "month") {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = monday.getDay() || 7;
  monday.setDate(monday.getDate() - day + 1);
  return formatDateYYYYMMDD(monday);
}

function aggregateCandles(candles: MarketCandle[], timeframe: MarketTimeframe): MarketCandle[] {
  if (timeframe !== "week" && timeframe !== "month") return candles;

  const buckets = new Map<string, MarketCandle>();
  for (const candle of [...candles].sort((a, b) => a.time - b.time)) {
    const key = bucketKeyFor(candle, timeframe);
    const current = buckets.get(key);
    if (!current) {
      buckets.set(key, { ...candle });
      continue;
    }

    current.high = Math.max(current.high, candle.high);
    current.low = Math.min(current.low, candle.low);
    current.close = candle.close;
    current.volume += candle.volume;
    current.time = candle.time;
  }

  return [...buckets.values()];
}

function fallbackCandles(code: string, timeframe: MarketTimeframe): MarketCandle[] {
  return aggregateCandles(mockCandles(code), timeframe);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { next?: { revalidate: number } },
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson<T>(url: string, revalidateSeconds = 30): Promise<T> {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Referer: EASTMONEY_REFERER,
        "User-Agent": "Mozilla/5.0 A-Share-Sentinel-X/1.0",
      },
      next: { revalidate: revalidateSeconds },
    },
    EASTMONEY_TIMEOUT_MS
  );
  if (!response.ok) {
    throw new Error(`Eastmoney request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

async function fetchTencentText(url: string, revalidateSeconds = 15): Promise<string> {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Referer: TENCENT_REFERER,
        "User-Agent": "Mozilla/5.0 A-Share-Sentinel-X/1.0",
      },
      next: { revalidate: revalidateSeconds },
    },
    TENCENT_TIMEOUT_MS
  );
  if (!response.ok) {
    throw new Error(`Tencent request failed: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  try {
    return new TextDecoder("gbk").decode(buffer);
  } catch {
    return new TextDecoder().decode(buffer);
  }
}

interface EastmoneyQuoteResponse {
  rc: number;
  data?: Record<string, unknown>;
}

async function fetchEastmoneyQuote(code: string): Promise<MarketQuote | null> {
  const secid = secidFor(code);
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${QUOTE_FIELDS}`;
  const json = await fetchJson<EastmoneyQuoteResponse>(url);
  const data = json.data;
  if (!data || json.rc !== 0) return null;

  const fallback = fallbackQuoteFor(code);
  const price = normalizeScaled(data.f43) ?? fallback?.price;
  const prevClose = normalizeScaled(data.f60) ?? fallback?.prevClose;
  if (!price || !prevClose) return null;

  const name = String(data.f58 ?? fallback?.name ?? code);
  const high = normalizeScaled(data.f44) ?? fallback?.high ?? price;
  const low = normalizeScaled(data.f45) ?? fallback?.low ?? price;
  const open = normalizeScaled(data.f46) ?? fallback?.open ?? price;
  const changeAmount = normalizeScaled(data.f169) ?? price - prevClose;
  const changePercent = normalizeScaled(data.f170) ?? ((price - prevClose) / prevClose) * 100;
  const turnoverRate = normalizeScaled(data.f168) ?? fallback?.turnoverRate ?? 0;
  const pe = normalizeScaled(data.f9) ?? fallback?.pe ?? 0;
  const turnoverValue = normalizeNumber(data.f48);
  const volumeHands = normalizeNumber(data.f47);
  const marketCapValue = normalizeNumber(data.f116);

  return {
    code,
    name,
    price,
    changePercent: round2(changePercent),
    changeAmount: round2(changeAmount),
    volume: formatLots(volumeHands),
    turnover: formatCny100M(turnoverValue),
    turnoverRate,
    marketCap: formatCny100M(marketCapValue),
    pe,
    high,
    low,
    open,
    prevClose,
    source: "eastmoney",
    sourceLabel: SOURCE_LABELS.eastmoney,
    updatedAt: nowIso(),
    tradeStatus: "trading",
  };
}

function parseTencentTradeTime(value: string | undefined): string {
  if (!value || value.length < 14) return nowIso();
  const isoLike = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}+08:00`;
  const timestamp = new Date(isoLike).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : nowIso();
}

function parseTencentAmountCny(parts: string[]): number | null {
  const amountFromCompound = parseNumber(parts[35]?.split("/")[2]);
  if (amountFromCompound !== null) return amountFromCompound;
  const amountWan = parseNumber(parts[37]);
  return amountWan === null ? null : amountWan * 10_000;
}

async function fetchTencentQuote(code: string): Promise<MarketQuote | null> {
  const symbol = tencentSymbolFor(code);
  const url = `https://qt.gtimg.cn/q=${symbol}`;
  const text = await fetchTencentText(url);
  const match = text.match(new RegExp(`v_${symbol}="([^"]+)"`));
  if (!match) return null;

  const parts = match[1].split("~");
  const fallback = fallbackQuoteFor(code);
  const price = parseNumber(parts[3]) ?? fallback?.price;
  const prevClose = parseNumber(parts[4]) ?? fallback?.prevClose;
  if (!price || !prevClose) return null;

  const open = parseNumber(parts[5]) ?? fallback?.open ?? price;
  const high = parseNumber(parts[33]) ?? fallback?.high ?? price;
  const low = parseNumber(parts[34]) ?? fallback?.low ?? price;
  const changeAmount = parseNumber(parts[31]) ?? price - prevClose;
  const changePercent = parseNumber(parts[32]) ?? ((price - prevClose) / prevClose) * 100;
  const volumeHands = parseNumber(parts[36]) ?? parseNumber(parts[6]);
  const turnoverValue = parseTencentAmountCny(parts);
  const turnoverRate = parseNumber(parts[38]) ?? fallback?.turnoverRate ?? 0;
  const pe = parseNumber(parts[39]) ?? fallback?.pe ?? 0;
  const marketCap100M = parseNumber(parts[45]) ?? null;

  return {
    code,
    name: parts[1] || fallback?.name || code,
    price,
    changePercent: round2(changePercent),
    changeAmount: round2(changeAmount),
    volume: formatLots(volumeHands),
    turnover: formatCny100M(turnoverValue),
    turnoverRate,
    marketCap: marketCap100M === null ? "N/A" : formatCny100MFromUnit(marketCap100M),
    pe,
    high,
    low,
    open,
    prevClose,
    source: "tencent",
    sourceLabel: SOURCE_LABELS.tencent,
    updatedAt: parseTencentTradeTime(parts[30]),
    tradeStatus: "trading",
  };
}

export async function fetchLiveQuote(code: string): Promise<MarketQuote | null> {
  try {
    const quote = await fetchEastmoneyQuote(code);
    if (quote) return quote;
  } catch {
    // Try the secondary source below. The local WSL network often cuts Eastmoney HTTPS.
  }

  try {
    return await fetchTencentQuote(code);
  } catch {
    return null;
  }
}

interface EastmoneyKlineResponse {
  rc: number;
  data?: {
    klines?: string[];
  };
}

function kltFor(timeframe: MarketTimeframe): string {
  switch (timeframe) {
    case "minute":
      return "1";
    case "week":
      return "102";
    case "month":
      return "103";
    default:
      return "101";
  }
}

function maxCandleCountFor(timeframe: MarketTimeframe): number {
  switch (timeframe) {
    case "minute":
      return 260;
    case "week":
      return 180;
    case "month":
      return 48;
    default:
      return 850;
  }
}

function minLiveCandlesFor(timeframe: MarketTimeframe): number {
  switch (timeframe) {
    case "minute":
      return 20;
    case "week":
      return 80;
    case "month":
      return 24;
    default:
      return 360;
  }
}

export async function fetchLiveCandles(code: string, timeframe: MarketTimeframe = "day"): Promise<MarketCandle[]> {
  const secid = secidFor(code);
  const klt = kltFor(timeframe);
  const end = "20500101";
  const begin = beginDateFor(timeframe);
  const url =
    `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&klt=${klt}&fqt=1&beg=${begin}&end=${end}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61`;
  const json = await fetchJson<EastmoneyKlineResponse>(url, timeframe === "minute" ? 15 : 300);
  const klines = json.data?.klines ?? [];
  if (json.rc !== 0 || klines.length === 0) return [];
  const sliced = klines.slice(-maxCandleCountFor(timeframe));
  const latestMinuteDate =
    timeframe === "minute" ? sliced[sliced.length - 1]?.split(",")[0]?.slice(0, 10) : undefined;
  const scoped =
    timeframe === "minute" && latestMinuteDate
      ? sliced.filter((line) => line.startsWith(latestMinuteDate))
      : sliced;

  return scoped.map((line) => {
    const [date, open, close, high, low, volume] = line.split(",");
    const timestamp = Math.floor(
      new Date(`${date.length > 10 ? date.replace(" ", "T") : `${date}T00:00:00`}+08:00`).getTime() / 1000
    );
    return {
      time: timestamp,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
    };
  });
}

export async function getMarketStockDetail(
  code: string,
  timeframe: MarketTimeframe = "day"
): Promise<MarketStockDetail | null> {
  const fallbackQuote = mockQuote(code);
  if (!fallbackQuote) return null;

  try {
    const [quoteResult, candlesResult] = await Promise.allSettled([
      fetchLiveQuote(code),
      fetchLiveCandles(code, timeframe),
    ]);
    const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
    const candles = candlesResult.status === "fulfilled" ? candlesResult.value : [];
    const minLiveCandles = minLiveCandlesFor(timeframe);
    const liveCandles = candles.length >= minLiveCandles ? candles : fallbackCandles(code, timeframe);
    return {
      quote: quote ?? fallbackQuote,
      candles: liveCandles,
      analysis: buildMarketAnalysis(liveCandles),
      timeframe,
      fallbackUsed: !quote || candles.length < minLiveCandles,
    };
  } catch {
    const candles = fallbackCandles(code, timeframe);
    return {
      quote: fallbackQuote,
      candles,
      analysis: buildMarketAnalysis(candles),
      timeframe,
      fallbackUsed: true,
    };
  }
}

function snapshotSourceFor(quotes: MarketQuote[]): MarketDataSource {
  if (quotes.some((item) => item.source === "eastmoney")) return "eastmoney";
  if (quotes.some((item) => item.source === "tencent")) return "tencent";
  return "mock";
}

export async function getMarketSnapshot(codes?: string[]): Promise<MarketSnapshot> {
  const selectedCodes = (codes?.length ? codes : stocks.slice(0, 24).map((item) => item.code)).slice(0, 40);
  const settled = await Promise.allSettled(selectedCodes.map((code) => fetchLiveQuote(code)));
  const quotes = settled
    .map((result, index) => {
      if (result.status === "fulfilled" && result.value) return result.value;
      return mockQuote(selectedCodes[index]);
    })
    .filter(Boolean) as MarketQuote[];
  const liveCount = quotes.filter((item) => item.source !== "mock").length;
  const source = snapshotSourceFor(quotes);
  return {
    quotes,
    source,
    sourceLabel: SOURCE_LABELS[source],
    updatedAt: nowIso(),
    fallbackUsed: liveCount < quotes.length,
  };
}

function parseTurnoverYi(value: string): number {
  const num = Number.parseFloat(value.replace(/,/g, ""));
  if (!Number.isFinite(num)) return 0;
  if (/\u4e07/.test(value)) return num / 10_000;
  return num;
}

function buildBreadthFromQuotes(quotes: MarketQuote[]): MarketBreadth {
  const upCount = quotes.filter((item) => item.changePercent > 0).length;
  const downCount = quotes.filter((item) => item.changePercent < 0).length;
  const flatCount = quotes.length - upCount - downCount;
  const turnoverYi = quotes.reduce((sum, item) => sum + parseTurnoverYi(item.turnover), 0);
  return {
    upCount,
    downCount,
    flatCount,
    sampleSize: quotes.length,
    totalTurnover: turnoverYi > 0 ? `${turnoverYi.toFixed(1)} CNY 100M` : "N/A",
  };
}

export async function getMarketIndexSnapshot(): Promise<MarketIndexSnapshot> {
  const settled = await Promise.allSettled(DEFAULT_INDEX_CODES.map((code) => fetchLiveQuote(code)));
  const indices = settled
    .map((result, index) => {
      if (result.status === "fulfilled" && result.value) return result.value;
      return mockIndexQuote(DEFAULT_INDEX_CODES[index]);
    })
    .filter(Boolean) as MarketQuote[];
  const liveCount = indices.filter((item) => item.source !== "mock").length;
  const source = snapshotSourceFor(indices);
  return {
    indices,
    breadth: buildBreadthFromQuotes(indices),
    source,
    sourceLabel: SOURCE_LABELS[source],
    updatedAt: nowIso(),
    fallbackUsed: liveCount < indices.length,
  };
}
