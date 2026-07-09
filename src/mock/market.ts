// ─── Market Mock Data ─────────────────────────────────────────────
// Consistent snapshot: positive indices → upCount > downCount,
// limitUp/limitDown correlate with sentiment, northbound flow
// correlates with large-cap (baijiu / new-energy) performance.

/** Consistent market date used across all mock data */
export const MARKET_DATE = "2026-06-18";

export interface MarketIndex {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  volume: string;
  turnover: string;
  high: number;
  low: number;
  lastUpdated: string;
}

export interface MarketStats {
  upCount: number;
  downCount: number;
  flatCount: number;
  limitUp: number;
  limitDown: number;
  totalTurnover: string;
  northboundFlow: string;
  lastUpdated: string;
}

export interface MarketSentiment {
  fearGreedIndex: number; // 0-100
  label: string;
  shortTrend: "bullish" | "bearish" | "neutral";
  midTrend: "bullish" | "bearish" | "neutral";
  lastUpdated: string;
  signals: {
    name: string;
    value: string;
    signal: "buy" | "sell" | "neutral";
  }[];
}

// ─── Indices: all positive (科创50 strongest → risk-on / growth tilt) ──
export const marketIndices: MarketIndex[] = [
  {
    code: "000001",
    name: "上证指数",
    price: 3267.89,
    changePercent: 0.56,
    changeAmount: 18.23,
    volume: "3.2亿",
    turnover: "4567.8亿",
    high: 3275.12,
    low: 3245.67,
    lastUpdated: `${MARKET_DATE} 15:00:00`,
  },
  {
    code: "399001",
    name: "深证成指",
    price: 10234.56,
    changePercent: 0.78,
    changeAmount: 79.12,
    volume: "4.5亿",
    turnover: "5678.9亿",
    high: 10256.78,
    low: 10145.23,
    lastUpdated: `${MARKET_DATE} 15:00:00`,
  },
  {
    code: "399006",
    name: "创业板指",
    price: 2045.67,
    changePercent: 1.23,
    changeAmount: 24.89,
    volume: "2.1亿",
    turnover: "2345.6亿",
    high: 2052.34,
    low: 2018.45,
    lastUpdated: `${MARKET_DATE} 15:00:00`,
  },
  {
    code: "000688",
    name: "科创50",
    price: 987.34,
    changePercent: 1.56,
    changeAmount: 15.23,
    volume: "0.8亿",
    turnover: "876.5亿",
    high: 992.56,
    low: 970.12,
    lastUpdated: `${MARKET_DATE} 15:00:00`,
  },
  {
    code: "899050",
    name: "北证50",
    price: 1123.45,
    changePercent: -0.34,
    changeAmount: -3.84,
    volume: "0.3亿",
    turnover: "234.5亿",
    high: 1130.67,
    low: 1118.23,
    lastUpdated: `${MARKET_DATE} 15:00:00`,
  },
];

// ─── Market stats consistent with positive indices ───────────────
// upCount (3245) > downCount (1678) — ~63% up, consistent with
// weighted-average index change ≈ +0.56%
// limitUp 68 > limitDown 12 — risk-on day, matches fearGreed 62
// northbound +56.78亿 — foreign money buying large-caps (茅台、宁德、五粮液)
export const marketStats: MarketStats = {
  upCount: 3245,
  downCount: 1678,
  flatCount: 189,
  limitUp: 68,
  limitDown: 12,
  totalTurnover: "12834.5亿",
  northboundFlow: "+56.78亿",
  lastUpdated: `${MARKET_DATE} 15:00:00`,
};

// ─── Sentiment: fearGreed 62 → "偏贪婪" ──────────────────────────
// Signals are derived from the same underlying data as sectors/stats:
//   市场广度 65.8%  = upCount / total ≈ 3245 / 5112 → "buy"
//   量价关系 温和放量 = totalTurnover normal for this market cap → "buy"
//   资金流向 净流入   = northboundFlow +56.78亿 → "buy"
//   波动率   偏低     = VIX proxy, major indices range < 1% intraday → "neutral"
//   情绪指标 偏贪婪   = fearGreed 62 nearing "greed" zone → "sell" (contrarian)
export const marketSentiment: MarketSentiment = {
  fearGreedIndex: 62,
  label: "偏贪婪",
  shortTrend: "bullish",
  midTrend: "neutral",
  lastUpdated: `${MARKET_DATE} 15:00:00`,
  signals: [
    { name: "市场广度", value: "65.8%", signal: "buy" },
    { name: "量价关系", value: "温和放量", signal: "buy" },
    { name: "资金流向", value: "净流入", signal: "buy" },
    { name: "波动率", value: "偏低", signal: "neutral" },
    { name: "情绪指标", value: "偏贪婪", signal: "sell" },
  ],
};

// ─── Watchlist with realistic intraday sparkline (30 points) ──────
// Each sparkline simulates 30 five-minute bars from 09:30 to 15:00.
// The path is generated with a slight random walk that ends at the
// current price, ensuring visual consistency with changePercent.

function generateIntradaySparkline(
  prevClose: number,
  currentPrice: number,
  points: number = 30,
  volatility: number = 0.003
): number[] {
  const sparkline: number[] = [];
  let price = prevClose;
  const drift = (currentPrice - prevClose) / points;

  for (let i = 0; i < points - 1; i++) {
    const noise = (Math.random() - 0.5) * 2 * volatility * prevClose;
    price = price + drift + noise;
    price = Math.max(prevClose * 0.97, Math.min(prevClose * 1.03, price));
    sparkline.push(parseFloat(price.toFixed(2)));
  }
  sparkline.push(currentPrice);
  return sparkline;
}

export interface WatchlistStock {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline: number[];
}

export const watchlist: WatchlistStock[] = [
  {
    code: "600519",
    name: "贵州茅台",
    price: 1688.0,
    changePercent: 0.98,
    sparkline: generateIntradaySparkline(1671.6, 1688.0, 30, 0.002),
  },
  {
    code: "300750",
    name: "宁德时代",
    price: 198.56,
    changePercent: 2.12,
    sparkline: generateIntradaySparkline(194.44, 198.56, 30, 0.004),
  },
  {
    code: "688256",
    name: "寒武纪",
    price: 268.90,
    changePercent: 4.56,
    sparkline: generateIntradaySparkline(257.2, 268.9, 30, 0.006),
  },
  {
    code: "000977",
    name: "浪潮信息",
    price: 35.67,
    changePercent: 3.45,
    sparkline: generateIntradaySparkline(34.48, 35.67, 30, 0.005),
  },
  {
    code: "300124",
    name: "汇川技术",
    price: 62.34,
    changePercent: 3.56,
    sparkline: generateIntradaySparkline(60.2, 62.34, 30, 0.004),
  },
];
