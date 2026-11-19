import { describe, expect, it } from "vitest";
import { computeDailyBaseline, normalizeCode, secidFor, tencentSymbolFor } from "@/lib/market-provider";
import { rsi } from "@/lib/market-indicators";

describe("code normalization", () => {
  it.each([
    // [input, kind, eastmoney secid, tencent symbol]
    ["000001", "stock", "0.000001", "sz000001"], // 平安银行
    ["000001", "index", "1.000001", "sh000001"], // 上证指数
    ["000688", "stock", "0.000688", "sz000688"], // 国城矿业
    ["000688", "index", "1.000688", "sh000688"], // 科创50
    ["920001", "stock", "0.920001", "bj920001"], // 北交所
    ["830799", "stock", "0.830799", "bj830799"],
    ["510300", "stock", "1.510300", "sh510300"], // 沪深300ETF
    ["600519", "stock", "1.600519", "sh600519"],
    ["sz300750", "stock", "0.300750", "sz300750"],
  ] as const)("%s as %s", (code, kind, secid, symbol) => {
    expect(secidFor(code, kind)).toBe(secid);
    expect(tencentSymbolFor(code, kind)).toBe(symbol);
  });

  it.each(["600519&x=1", "600519&fields=f1", "60051", "6005190", "abc", "", "sh60051a", "(.*)+"])(
    "rejects %j",
    (code) => {
      expect(normalizeCode(code)).toBeNull();
      expect(secidFor(code)).toBeNull();
      expect(tencentSymbolFor(code)).toBeNull();
    }
  );
});

describe("rsi (Wilder)", () => {
  it("returns 100 when there are no losses", () => {
    expect(rsi(Array.from({ length: 20 }, (_, i) => 10 + i))).toBe(100);
  });

  it("matches the Wilder reference value", () => {
    // StockCharts 的 RSI 教学示例，第 15 根收盘后 14 日 RSI = 70.53
    const closes = [
      44.3389, 44.0902, 44.1497, 43.6124, 44.2778, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328,
      45.614, 46.282, 46.282,
    ];
    expect(rsi(closes)).toBeCloseTo(70.53, 1);
  });
});

describe("computeDailyBaseline", () => {
  it("returns null when fewer than 5 daily candles exist", () => {
    expect(computeDailyBaseline([])).toBeNull();
    expect(
      computeDailyBaseline([
        { time: 1, open: 10, high: 11, low: 9, close: 10, volume: 100 },
        { time: 2, open: 10, high: 12, low: 9.5, close: 11, volume: 120 },
      ])
    ).toBeNull();
  });

  it("computes high20, low20, and avg20Volume excluding the latest bar when >20 candles exist", () => {
    const candles = Array.from({ length: 21 }, (_, idx) => ({
      time: 1_700_000_000 + idx * 86_400,
      open: 10 + idx,
      high: idx === 20 ? 999 : 20 + idx,
      low: idx === 20 ? 1 : 10 + idx,
      close: 15 + idx,
      volume: idx === 20 ? 9_999_999 : 1000,
    }));
    expect(computeDailyBaseline(candles)).toEqual({
      high20: 39,
      low20: 10,
      avg20Volume: 1000,
    });
  });
});
