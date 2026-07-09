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
