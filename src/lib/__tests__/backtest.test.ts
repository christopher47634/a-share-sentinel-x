import { describe, expect, it } from "vitest";
import { runKlineSignalBacktest, type HistoricalBar } from "@/lib/sentinel/backtest";

function makeCalmBars(count: number, basePrice = 100, baseVol = 1000): HistoricalBar[] {
  return Array.from({ length: count }, (_, idx) => ({
    date: `2026-01-${String(idx + 1).padStart(2, "0")}`,
    open: basePrice,
    high: basePrice * 1.01,
    low: basePrice * 0.99,
    close: basePrice,
    volume: baseVol,
  }));
}

describe("runKlineSignalBacktest 历史 K 线信号回放评测", () => {
  it("能够识别放量突破 20 日高点并统计后续 T+1 / T+5 收益", () => {
    const bars: HistoricalBar[] = [
      ...makeCalmBars(20, 100, 1000),
      // 第 21 天：放量突破 20 日高点（101）且涨幅 +6%
      { date: "2026-01-21", open: 100, high: 107, low: 100, close: 106, volume: 3200 },
      { date: "2026-01-22", open: 106, high: 109, low: 105, close: 108, volume: 1500 },
      { date: "2026-01-23", open: 108, high: 111, low: 107, close: 110, volume: 1400 },
      { date: "2026-01-24", open: 110, high: 112, low: 108, close: 111, volume: 1300 },
      { date: "2026-01-25", open: 111, high: 113, low: 109, close: 112, volume: 1200 },
      { date: "2026-01-26", open: 112, high: 115, low: 110, close: 114, volume: 1200 },
    ];

    const summary = runKlineSignalBacktest({ code: "300308", name: "中际旭创", bars });
    const breakout = summary.events.find((e) => e.date === "2026-01-21");
    expect(breakout).toBeDefined();
    expect(breakout?.signals).toContain("突破近20日高点");
    expect(breakout?.signals).toContain("放量异动");
    expect(breakout?.forward1dPct).toBeCloseTo(1.89, 1);
    expect(breakout?.forward5dPct).toBeCloseTo(7.55, 1);
    expect(summary.totalAlerts).toBeGreaterThanOrEqual(1);
  });

  it("持仓放量下跌触发 Risk 提醒后次日续跌记为 hit，并计算 Precision/Recall/F1", () => {
    const bars: HistoricalBar[] = [
      ...makeCalmBars(10, 100, 1000),
      // 放量下跌 -5%
      { date: "2026-01-11", open: 99, high: 100, low: 94, close: 95, volume: 3000 },
      // 次日续跌 -3.16%
      { date: "2026-01-12", open: 95, high: 95, low: 91, close: 92, volume: 1500 },
    ];

    const summary = runKlineSignalBacktest({
      code: "002594",
      name: "比亚迪",
      bars,
      position: { costPrice: 102, positionRatio: 0.2 },
    });
    const riskDay = summary.events.find((e) => e.date === "2026-01-11");
    expect(riskDay?.level).toBe("Risk");
    expect(riskDay?.verdict).toBe("hit");
    expect(summary.hits).toBe(1);
    expect(summary.missed).toBe(1); // 第 10 天平盘后次日大跌 -5% 记为漏报
    expect(summary.riskPrecision).toBe(1);
    expect(summary.riskRecall).toBe(0.5);
    expect(summary.riskF1).toBe(0.667);
  });
});
