import { describe, expect, it } from "vitest";
import {
  calendarYears,
  isMarketOpen,
  isTradingDay,
  nextTradingDay,
  previousTradingDay,
  sellableFrom,
  tradingSession,
} from "@/lib/trading-calendar";

describe("交易日历：交易日判定", () => {
  it("周末不开市", () => {
    expect(isTradingDay("2026-10-10")).toBe(false); // 周六
    expect(isTradingDay("2026-10-11")).toBe(false); // 周日
    expect(isTradingDay("2026-10-12")).toBe(true);
  });

  it("法定节假日休市", () => {
    expect(isTradingDay("2026-01-01")).toBe(false);
    expect(isTradingDay("2026-02-17")).toBe(false); // 春节
    expect(isTradingDay("2026-04-06")).toBe(false); // 清明（周一）
    expect(isTradingDay("2026-05-05")).toBe(false);
    expect(isTradingDay("2026-10-07")).toBe(false);
  });

  it("调休补班的周末仍然不开市", () => {
    expect(isTradingDay("2026-02-14")).toBe(false); // 周六补班
    expect(isTradingDay("2026-09-20")).toBe(false); // 周日补班
  });

  it("没有休市数据的年份直接报错，不按周末猜", () => {
    expect(() => isTradingDay("2031-03-03")).toThrow(/2031/);
    expect(calendarYears()).toContain(2026);
  });

  it("拒绝格式错误和不存在的日期", () => {
    expect(() => isTradingDay("2026-2-3")).toThrow();
    expect(() => isTradingDay("2026-02-30")).toThrow();
  });
});

describe("交易日历：前后交易日", () => {
  it("周五的下一个交易日是周一", () => {
    expect(nextTradingDay("2026-10-09")).toBe("2026-10-12");
  });

  it("跨国庆长假", () => {
    expect(nextTradingDay("2026-09-30")).toBe("2026-10-08");
    expect(previousTradingDay("2026-10-08")).toBe("2026-09-30");
  });

  it("跨春节长假", () => {
    expect(nextTradingDay("2026-02-13")).toBe("2026-02-24");
  });

  it("T+1 可卖日 = 下一个交易日", () => {
    expect(sellableFrom("2026-04-03")).toBe("2026-04-07"); // 清明连休
    expect(sellableFrom("2026-10-14")).toBe("2026-10-15");
  });
});

describe("交易日历：交易时段（上海时间）", () => {
  const at = (iso: string) => new Date(iso);

  it("按上海时间划分时段", () => {
    expect(tradingSession(at("2026-10-15T01:00:00Z"))).toBe("pre-open"); // 09:00
    expect(tradingSession(at("2026-10-15T01:20:00Z"))).toBe("opening-auction"); // 09:20
    expect(tradingSession(at("2026-10-15T02:00:00Z"))).toBe("morning"); // 10:00
    expect(tradingSession(at("2026-10-15T04:00:00Z"))).toBe("lunch-break"); // 12:00
    expect(tradingSession(at("2026-10-15T06:00:00Z"))).toBe("afternoon"); // 14:00
    expect(tradingSession(at("2026-10-15T06:58:00Z"))).toBe("closing-auction"); // 14:58
    expect(tradingSession(at("2026-10-15T07:01:00Z"))).toBe("closed"); // 15:01
  });

  it("UTC 跨日但上海已是新的一天时按上海日期判断", () => {
    // UTC 10-11（周日）18:00 = 北京时间 10-12（周一）02:00
    expect(tradingSession(at("2026-10-11T18:00:00Z"))).toBe("pre-open");
  });

  it("休市日全天收盘", () => {
    expect(tradingSession(at("2026-10-05T02:00:00Z"))).toBe("closed");
    expect(isMarketOpen(at("2026-10-05T02:00:00Z"))).toBe(false);
    expect(isMarketOpen(at("2026-10-15T02:00:00Z"))).toBe(true);
  });
});
