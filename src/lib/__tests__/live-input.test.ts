import { describe, expect, it } from "vitest";
import { aggregateSectors, buildLiveSentinelInput, runSentinelCore, toSentinelAccount } from "@/lib/sentinel-core";
import type { MarketQuote } from "@/types/market";
import type { Position } from "@/types/account";

function quote(code: string, changePercent: number, source: MarketQuote["source"] = "tencent"): MarketQuote {
  const prevClose = 10;
  const price = Math.round(prevClose * (1 + changePercent / 100) * 100) / 100;
  return {
    code,
    name: `股票${code}`,
    price,
    changePercent,
    changeAmount: price - prevClose,
    volume: "1.0M lots",
    turnover: "12.5 CNY 100M",
    turnoverRate: 2,
    marketCap: "N/A",
    pe: 20,
    high: price,
    low: price,
    open: prevClose,
    prevClose,
    source,
    sourceLabel: source,
    updatedAt: "2026-10-16T02:00:00.000Z",
    tradeStatus: source === "mock" ? "unknown" : "trading",
  };
}

const SECTOR: Record<string, string> = { "600001": "半导体", "600002": "半导体", "600003": "白酒", "600004": "白酒" };

describe("buildLiveSentinelInput", () => {
  const input = buildLiveSentinelInput({
    quotes: [quote("600001", 3), quote("600002", -1), quote("600003", 1), quote("600004", 2, "mock")],
    indices: [quote("000001", 0.5), quote("399001", 0.2, "mock")],
    sectorOf: (code) => SECTOR[code],
  });

  it("drops quotes that were filled in from mock data", () => {
    expect(input.stocks.map((s) => s.code)).toEqual(["600001", "600002", "600003"]);
    expect(input.indices.map((i) => i.code)).toEqual(["000001"]);
  });

  it("parses turnover strings into yuan when the numeric field is missing", () => {
    expect(input.stocks[0].amount).toBe(1_250_000_000);
  });

  it("aggregates sectors from their constituents", () => {
    const semi = input.sectors.find((s) => s.name === "半导体")!;
    expect(semi).toMatchObject({ changePct: 1, upCount: 1, downCount: 1, leadingStock: "股票600001", leadingStockChangePct: 3 });
    expect(input.sectors.find((s) => s.name === "白酒")).toMatchObject({ upCount: 1, downCount: 0 });
  });

  it("ignores stocks without a sector when aggregating", () => {
    expect(aggregateSectors([{ code: "1", name: "x", price: 1, changePct: 1 }])).toEqual([]);
  });

  it("feeds the engine without crashing even though volume ratio and speed are missing", () => {
    const result = runSentinelCore({ ...input, newsEvents: [] });
    expect(result.marketRadar.upCount).toBe(2);
    expect(result.causalityReports.length).toBeGreaterThan(0);
  });
});

describe("toSentinelAccount", () => {
  const position = (code: string, quantity: number, avgCost: number, currentPrice: number): Position => ({
    stockCode: code,
    stockName: `股票${code}`,
    sectorId: "semiconductor",
    quantity,
    availableQuantity: quantity,
    avgCost,
    openPrice: avgCost,
    currentPrice,
    marketValue: currentPrice * quantity,
    unrealizedPnL: 0,
    unrealizedPnLPercent: 0,
    todayPnL: 123,
    positionRatio: 0,
    riskLevel: "high",
  });

  it("revalues positions at live prices and keeps totalAssets === cash + marketValue", () => {
    const account = toSentinelAccount({
      cash: 900_000,
      positions: [position("600001", 1000, 10, 10), position("600002", 500, 20, 20)],
      sectorNameOf: (id) => (id === "semiconductor" ? "半导体" : undefined),
      priceOf: (code) => (code === "600001" ? 11 : undefined),
      prevCloseOf: (code) => (code === "600001" ? 10.5 : undefined),
    });
    expect(account.marketValue).toBe(11_000 + 10_000);
    expect(account.totalAssets).toBe(account.cash + account.marketValue);
    expect(account.positions[0]).toMatchObject({ currentPrice: 11, unrealizedPnl: 1000, sector: "半导体", riskLevel: "High" });
    // 有实时昨收按 (11 − 10.5) × 1000，没有就用账本里记的 123
    expect(account.todayPnl).toBe(500 + 123);
    expect(account.positions.reduce((sum, p) => sum + p.positionRatio, 0)).toBeCloseTo(account.marketValue / account.totalAssets, 10);
    expect(account.totalReturnPct).toBeCloseTo(((921_000 - 1_000_000) / 1_000_000) * 100, 2);
  });
});
