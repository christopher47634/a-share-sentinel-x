import { describe, expect, it } from "vitest";
import { normalizeCode, secidFor, tencentSymbolFor } from "@/lib/market-provider";
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
