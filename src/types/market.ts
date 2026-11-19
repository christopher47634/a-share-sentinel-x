export type MarketDataSource = "eastmoney" | "tencent" | "mock";
export type MarketTimeframe = "minute" | "day" | "week" | "month";

export interface MarketQuote {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  volume: string;
  turnover: string;
  turnoverRate: number;
  marketCap: string;
  /** 成交额（元）。实时行情才有；mock 只有格式化字符串 turnover */
  turnoverValue?: number;
  /** 成交量（手）。实时行情才有 */
  volumeLots?: number;
  /** 量比。实时行情才有（东财 f50/f10 或腾讯第 50 段） */
  volumeRatio?: number;
  /** 涨速（%/分钟）。东财实时行情提供 */
  speed?: number;
  /** 5 分钟涨跌幅（%）。东财批量行情提供 */
  fiveMinChangePct?: number;
  /** 近 20 日最高价（由历史日 K 派生，供信号引擎使用） */
  high20?: number;
  /** 近 20 日最低价（由历史日 K 派生，供信号引擎使用） */
  low20?: number;
  /** 近 20 日均量（手，由历史日 K 派生，供信号引擎使用） */
  avg20Volume?: number;
  pe: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  source: MarketDataSource;
  sourceLabel: string;
  updatedAt: string;
  tradeStatus: "trading" | "closed" | "unknown";
}

export interface MarketCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndicatorSnapshot {
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
  ma60: number | null;
  rsi14: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  atr14: number | null;
  drawdownPercent: number;
  volumeRatio: number | null;
  trendScore: number;
  riskScore: number;
  trendLabel: string;
  riskLabel: string;
  summary: string;
  bullets: string[];
}

export interface MarketStockDetail {
  quote: MarketQuote;
  candles: MarketCandle[];
  analysis: MarketIndicatorSnapshot;
  timeframe: MarketTimeframe;
  fallbackUsed: boolean;
}

export interface MarketSnapshot {
  quotes: MarketQuote[];
  source: MarketDataSource;
  sourceLabel: string;
  updatedAt: string;
  fallbackUsed: boolean;
}


export interface MarketBreadth {
  upCount: number;
  downCount: number;
  flatCount: number;
  sampleSize: number;
  totalTurnover: string;
}

export interface MarketIndexSnapshot {
  indices: MarketQuote[];
  breadth: MarketBreadth;
  source: MarketDataSource;
  sourceLabel: string;
  updatedAt: string;
  fallbackUsed: boolean;
}
