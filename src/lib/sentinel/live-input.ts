// 实时数据 → 引擎输入：把行情接口的报价、指数和本地模拟账户转换成 runSentinelCore 认识的结构。
// 纯函数，不读存储、不发请求，服务端接口和浏览器 hook 共用，也方便单测。

import type { MarketQuote } from "@/types/market";
import type { Position } from "@/types/account";
import { parseAmountYi } from "../market-format";
import type { RiskLevel, SentinelAccount, SentinelIndex, SentinelPosition, SentinelSector, SentinelStock } from "./types";

/** 模拟账户的初始资金，累计收益率按它算 */
const INITIAL_CASH = 1_000_000;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** 行情报价 → 引擎个股。量比、涨速、5 分钟涨幅等字段报价里没有，留空，引擎会跳过对应信号。 */
export function quoteToSentinelStock(quote: MarketQuote, sector?: string): SentinelStock {
  const amount = quote.turnoverValue ?? parseAmountYi(quote.turnover) * 100_000_000;
  return {
    code: quote.code,
    name: quote.name,
    price: quote.price,
    prevClose: quote.prevClose,
    changePct: quote.changePercent,
    turnoverRate: quote.turnoverRate,
    amount: amount > 0 ? amount : undefined,
    volume: quote.volumeLots,
    sector,
    isWatchlist: true,
  };
}

export function quoteToSentinelIndex(quote: MarketQuote): SentinelIndex {
  return {
    code: quote.code,
    name: quote.name,
    price: quote.price,
    changePct: quote.changePercent,
    amount: quote.turnoverValue,
  };
}

/** 板块行情由样本里的成分股汇总：平均涨跌幅、上涨/下跌家数、平均换手、领涨股。 */
export function aggregateSectors(stocks: SentinelStock[]): SentinelSector[] {
  const groups = new Map<string, SentinelStock[]>();
  for (const stock of stocks) {
    if (!stock.sector) continue;
    const list = groups.get(stock.sector) ?? [];
    list.push(stock);
    groups.set(stock.sector, list);
  }
  return [...groups.entries()].map(([name, members]) => {
    const leader = members.reduce((best, s) => (s.changePct > best.changePct ? s : best));
    const turnovers = members.map((s) => s.turnoverRate).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    return {
      name,
      changePct: round2(members.reduce((sum, s) => sum + s.changePct, 0) / members.length),
      upCount: members.filter((s) => s.changePct > 0).length,
      downCount: members.filter((s) => s.changePct < 0).length,
      turnoverRate: turnovers.length ? round2(turnovers.reduce((a, b) => a + b, 0) / turnovers.length) : undefined,
      leadingStock: leader.name,
      leadingStockChangePct: leader.changePct,
    };
  });
}

export interface LiveSentinelInput {
  indices: SentinelIndex[];
  stocks: SentinelStock[];
  sectors: SentinelSector[];
}

/**
 * 只用真正来自上游的报价；mock 补位的报价不进引擎，否则「实时」结论里混着假数据。
 * sectorOf 把代码映射成中文板块名（与 sentinel 引擎、本地账户适配器同一套名字）。
 */
export function buildLiveSentinelInput(args: {
  quotes: MarketQuote[];
  indices: MarketQuote[];
  sectorOf: (code: string) => string | undefined;
}): LiveSentinelInput {
  const stocks = args.quotes.filter((q) => q.source !== "mock").map((q) => quoteToSentinelStock(q, args.sectorOf(q.code)));
  return {
    stocks,
    sectors: aggregateSectors(stocks),
    indices: args.indices.filter((q) => q.source !== "mock").map(quoteToSentinelIndex),
  };
}

const RISK: Record<Position["riskLevel"], RiskLevel> = { low: "Low", medium: "Medium", high: "High" };

/**
 * 本地模拟账本 → 引擎账户。有实时价时按实时价重估持仓市值和浮动盈亏；
 * 现金以账本为准（账本的唯一现金来源），总资产 = 现金 + 重估后的市值。
 */
export function toSentinelAccount(args: {
  cash: number;
  positions: Position[];
  sectorNameOf: (sectorId: string) => string | undefined;
  priceOf?: (code: string) => number | undefined;
  /** 有实时昨收时，今日盈亏按（现价 − 昨收）× 数量算；否则用账本里记的值 */
  prevCloseOf?: (code: string) => number | undefined;
}): SentinelAccount {
  const revalued = args.positions.map((p) => {
    const price = args.priceOf?.(p.stockCode) ?? p.currentPrice;
    const marketValue = round2(price * p.quantity);
    const unrealizedPnl = round2((price - p.avgCost) * p.quantity);
    const prevClose = args.prevCloseOf?.(p.stockCode);
    const todayPnl = prevClose !== undefined ? round2((price - prevClose) * p.quantity) : p.todayPnL ?? 0;
    return { p, price, marketValue, unrealizedPnl, todayPnl };
  });
  const marketValue = round2(revalued.reduce((sum, r) => sum + r.marketValue, 0));
  const totalAssets = round2(args.cash + marketValue);
  const positions: SentinelPosition[] = revalued.map(({ p, price, marketValue: mv, unrealizedPnl }) => ({
    code: p.stockCode,
    name: p.stockName,
    quantity: p.quantity,
    costPrice: p.avgCost,
    currentPrice: price,
    marketValue: mv,
    positionRatio: totalAssets > 0 ? mv / totalAssets : 0,
    unrealizedPnl,
    unrealizedPnlPct: p.avgCost > 0 ? round2(((price - p.avgCost) / p.avgCost) * 100) : 0,
    sector: args.sectorNameOf(p.sectorId) ?? p.sectorId,
    riskLevel: RISK[p.riskLevel],
  }));
  return {
    totalAssets,
    cash: args.cash,
    marketValue,
    todayPnl: round2(revalued.reduce((sum, r) => sum + r.todayPnl, 0)),
    totalPnl: round2(totalAssets - INITIAL_CASH),
    totalReturnPct: round2(((totalAssets - INITIAL_CASH) / INITIAL_CASH) * 100),
    positions,
  };
}
