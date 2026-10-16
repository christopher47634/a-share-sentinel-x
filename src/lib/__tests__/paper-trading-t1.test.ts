import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { installBrowserLedger, shanghaiMorning } from "./helpers/browser-ledger";

const storage = installBrowserLedger();
const { executeBuy, executeSell, getAvailableSellQuantity } = await import("@/lib/trade-engine");
const { getPositions, saveAccount, savePositions } = await import("@/lib/account-storage");
const { defaultAccount } = await import("@/mock/account");
const { sellableFrom } = await import("@/lib/trading-calendar");

const MOUTAI = { stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu" };

function buy(quantity: number, price = 100) {
  return executeBuy({ ...MOUTAI, price, quantity });
}
function sell(quantity: number, price = 100) {
  return executeSell({ stockCode: MOUTAI.stockCode, stockName: MOUTAI.stockName, price, quantity });
}

describe("模拟盘 T+1", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage.clear();
    saveAccount(structuredClone(defaultAccount));
    savePositions([]);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("周五买入，下一个交易日（周一）才能卖", () => {
    vi.setSystemTime(shanghaiMorning("2026-10-09"));
    expect(buy(100).success).toBe(true);
    expect(getAvailableSellQuantity(MOUTAI.stockCode)).toBe(0);

    const day = sellableFrom("2026-10-09");
    expect(day).toBe("2026-10-12");
    vi.setSystemTime(shanghaiMorning(day));
    expect(getAvailableSellQuantity(MOUTAI.stockCode)).toBe(100);
    expect(sell(100).success).toBe(true);
  });

  it("节前买入，长假后第一个交易日可卖", () => {
    vi.setSystemTime(shanghaiMorning("2026-09-30"));
    buy(100);
    vi.setSystemTime(shanghaiMorning(sellableFrom("2026-09-30")));
    expect(sell(100).success).toBe(true);
    expect(getPositions()).toHaveLength(0);
  });

  it("老仓位可卖，当日加仓部分锁定", () => {
    vi.setSystemTime(shanghaiMorning("2026-10-14"));
    buy(200);
    vi.setSystemTime(shanghaiMorning("2026-10-15"));
    buy(100);
    expect(getPositions()[0].quantity).toBe(300);
    expect(getAvailableSellQuantity(MOUTAI.stockCode)).toBe(200);

    const tooMany = sell(300);
    expect(tooMany.success).toBe(false);
    expect(tooMany.error).toContain("T+1");
    expect(sell(200).success).toBe(true);
    expect(getPositions()[0].quantity).toBe(100);
    expect(getAvailableSellQuantity(MOUTAI.stockCode)).toBe(0);
  });

  it("当日卖出后再买回，买回部分仍锁定", () => {
    vi.setSystemTime(shanghaiMorning("2026-10-14"));
    buy(100);
    vi.setSystemTime(shanghaiMorning("2026-10-15"));
    expect(sell(100).success).toBe(true);
    expect(buy(100).success).toBe(true);
    expect(sell(100).success).toBe(false);
  });
});
