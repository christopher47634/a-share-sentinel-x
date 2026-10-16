// 演示数据：5 只股票、6 个板块和一个写死的模拟账户。页面接入真实数据前用它兜底。

import type { SentinelStock, SentinelSector, SentinelIndex, SentinelPosition, SentinelAccount } from "./types";

/**
 * 8. Demo 数据生成器
 */
export function generateSentinelDemoData(): {
  indices: SentinelIndex[];
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account: SentinelAccount;
  newsEvents: Array<{
    title: string;
    relatedCodes?: string[];
    relatedSectors?: string[];
    sentiment?: "positive" | "negative" | "neutral";
    source?: string;
    time?: string;
  }>;
} {
  const sectors: SentinelSector[] = [
    { name: "半导体", changePct: 3.2, upCount: 48, downCount: 9, turnoverRate: 4.8, leadingStock: "寒武纪", leadingStockChangePct: 7.6 },
    { name: "人工智能", changePct: 2.7, upCount: 55, downCount: 16, turnoverRate: 5.1, leadingStock: "科大讯飞", leadingStockChangePct: 5.8 },
    { name: "新能源", changePct: 1.1, upCount: 38, downCount: 24, turnoverRate: 2.9, leadingStock: "宁德时代", leadingStockChangePct: 1.9 },
    { name: "白酒", changePct: -0.8, upCount: 9, downCount: 23, turnoverRate: 1.2, leadingStock: "贵州茅台", leadingStockChangePct: -1.1 },
    { name: "银行", changePct: -0.4, upCount: 12, downCount: 28, turnoverRate: 0.8, leadingStock: "平安银行", leadingStockChangePct: -0.7 },
    { name: "通信设备", changePct: 2.2, upCount: 36, downCount: 11, turnoverRate: 3.9, leadingStock: "中际旭创", leadingStockChangePct: 6.2 },
  ];

  const stocks: SentinelStock[] = [
    {
      code: "688256", name: "寒武纪", price: 668, prevClose: 621, changePct: 7.6,
      fiveMinChangePct: 2.6, tenMinChangePct: 3.7, speed: -0.2, volumeRatio: 3.4,
      turnoverRate: 9.8, amount: 8_200_000_000, volume: 820_000, avg20Volume: 350_000,
      high20: 660, low20: 540, sector: "半导体", concepts: ["人工智能", "算力", "芯片"], isWatchlist: true,
    },
    {
      code: "002230", name: "科大讯飞", price: 51.2, prevClose: 48.4, changePct: 5.8,
      fiveMinChangePct: 1.9, tenMinChangePct: 3.1, speed: 0.4, volumeRatio: 2.8,
      turnoverRate: 7.2, amount: 4_900_000_000, volume: 1_200_000, avg20Volume: 590_000,
      high20: 52, low20: 43, sector: "人工智能", concepts: ["AI 应用", "教育信息化"], isWatchlist: true,
    },
    {
      code: "300750", name: "宁德时代", price: 193.6, prevClose: 190, changePct: 1.9,
      fiveMinChangePct: 0.4, tenMinChangePct: 0.7, speed: 0.1, volumeRatio: 1.6,
      turnoverRate: 2.4, amount: 7_100_000_000, volume: 900_000, avg20Volume: 760_000,
      high20: 205, low20: 176, sector: "新能源", concepts: ["锂电池", "储能"], isWatchlist: true,
    },
    {
      code: "600519", name: "贵州茅台", price: 1432, prevClose: 1448, changePct: -1.1,
      fiveMinChangePct: -0.2, tenMinChangePct: -0.4, speed: -0.1, volumeRatio: 1.1,
      turnoverRate: 0.6, amount: 3_800_000_000, volume: 180_000, avg20Volume: 170_000,
      high20: 1510, low20: 1410, sector: "白酒", concepts: ["消费", "白酒"], isWatchlist: true,
    },
    {
      code: "000001", name: "平安银行", price: 11.1, prevClose: 11.18, changePct: -0.7,
      fiveMinChangePct: -0.1, tenMinChangePct: -0.2, speed: 0, volumeRatio: 0.9,
      turnoverRate: 0.8, amount: 1_200_000_000, volume: 780_000, avg20Volume: 820_000,
      high20: 11.9, low20: 10.8, sector: "银行", concepts: ["金融", "低估值"], isWatchlist: false,
    },
  ];

  const positions: SentinelPosition[] = [
    { code: "688256", name: "寒武纪", quantity: 200, costPrice: 620, currentPrice: 668, marketValue: 133_600, unrealizedPnl: 9_600, unrealizedPnlPct: 7.74, positionRatio: 0.133, sector: "半导体", concepts: ["人工智能", "算力", "芯片"], plan: "高波动观察，不追高，只观察回调后的持续性", riskLevel: "High", watchReason: "AI 算力方向核心观察标的", stopLossPrice: 585, targetPrice: 680 },
    { code: "300750", name: "宁德时代", quantity: 900, costPrice: 190, currentPrice: 193.6, marketValue: 174_240, unrealizedPnl: 3_240, unrealizedPnlPct: 1.89, positionRatio: 0.174, sector: "新能源", concepts: ["锂电池", "储能"], plan: "中线持有，观察新能源板块修复", riskLevel: "Medium", watchReason: "新能源龙头", stopLossPrice: 178, targetPrice: 210 },
    { code: "600519", name: "贵州茅台", quantity: 100, costPrice: 1450, currentPrice: 1432, marketValue: 143_200, unrealizedPnl: -1_800, unrealizedPnlPct: -1.24, positionRatio: 0.143, sector: "白酒", concepts: ["消费", "白酒"], plan: "稳定配置，观察消费防御属性", riskLevel: "Low", watchReason: "消费龙头", stopLossPrice: 1380, targetPrice: 1520 },
    { code: "002230", name: "科大讯飞", quantity: 2500, costPrice: 48, currentPrice: 51.2, marketValue: 128_000, unrealizedPnl: 8_000, unrealizedPnlPct: 6.67, positionRatio: 0.128, sector: "人工智能", concepts: ["AI 应用", "教育信息化"], plan: "关注 AI 应用板块共振，不追高", riskLevel: "High", watchReason: "AI 应用方向", stopLossPrice: 45, targetPrice: 55 },
  ];

  const marketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const cash = 420_000;
  const totalAssets = cash + marketValue;

  const account: SentinelAccount = {
    totalAssets, cash, marketValue, todayPnl: 3_800, totalPnl: 8_800, totalReturnPct: 0.88,
    maxDrawdownPct: -3.2, positions,
    trades: [{ id: "trade-1", code: "688256", name: "寒武纪", side: "BUY", quantity: 50, price: 620, amount: 31_000, fee: 7.75, createdAt: new Date().toISOString() }],
  };

  return {
    indices: [
      { code: "000001", name: "上证指数", price: 3188.2, changePct: 0.42, amount: 390_000_000_000 },
      { code: "399001", name: "深证成指", price: 10242.8, changePct: 0.83, amount: 510_000_000_000 },
      { code: "399006", name: "创业板指", price: 2044.6, changePct: 1.12, amount: 250_000_000_000 },
    ],
    stocks, sectors, account,
    newsEvents: [
      { title: "模拟事件：AI 算力方向盘中热度提升，半导体与人工智能板块同步走强", relatedCodes: ["688256", "002230"], relatedSectors: ["半导体", "人工智能"], sentiment: "positive", source: "mock", time: new Date().toISOString() },
    ],
  };
}
