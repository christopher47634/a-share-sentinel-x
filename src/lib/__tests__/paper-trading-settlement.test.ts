import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { installBrowserLedger, shanghaiMorning } from "./helpers/browser-ledger";

const storage = installBrowserLedger();
const { executeBuy, executeSell, commissionCents, stampTaxCents, getMaxBuyQuantity } = await import("@/lib/trade-engine");
const { getAccount, getTransactions, saveAccount, savePositions } = await import("@/lib/account-storage");
const { defaultAccount } = await import("@/mock/account");

const MOUTAI = { stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu" };

describe("模拟盘结算：费用", () => {
  it("佣金万 2.5，最低 5 元", () => {
    expect(commissionCents(1_000_000)).toBe(500); // 1 万元 → 2.5 元，按 5 元收
    expect(commissionCents(2_000_000)).toBe(500); // 2 万元 → 正好 5 元
    expect(commissionCents(4_000_000)).toBe(1000); // 4 万元 → 10 元
  });

  it("印花税万 5，只在卖出时收", () => {
    expect(stampTaxCents(1_200_000)).toBe(600);
  });
});

describe("模拟盘结算：资金与已实现盈亏", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    storage.clear();
    saveAccount(structuredClone(defaultAccount));
    savePositions([]);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("买入扣成交额 + 佣金，不收印花税", () => {
    vi.setSystemTime(shanghaiMorning("2026-10-14"));
    executeBuy({ ...MOUTAI, price: 400, quantity: 100 }); // 4 万元
    expect(getAccount().availableCash).toBe(1_000_000 - 40_000 - 10);
    expect(getTransactions()[0]).toMatchObject({ type: "buy", amount: -40_010 });
  });

  it("卖出到账 = 成交额 − 佣金 − 印花税，已实现盈亏扣掉买入成本（含买入佣金）", () => {
    vi.setSystemTime(shanghaiMorning("2026-10-14"));
    executeBuy({ ...MOUTAI, price: 100, quantity: 200 }); // 成本 20000 + 5
    vi.setSystemTime(shanghaiMorning("2026-10-15"));
    executeSell({ stockCode: MOUTAI.stockCode, stockName: MOUTAI.stockName, price: 110, quantity: 200 });

    const net = 22_000 - 5.5 - 11; // 佣金 5.5，印花税 11
    const txn = getTransactions()[0];
    expect(txn.type).toBe("sell");
    expect(txn.amount).toBe(net);
    expect(txn.realizedPnL).toBe(net - 20_005);
    expect(getAccount().availableCash).toBe(1_000_000 - 20_005 + net);
  });

  it("可买数量按整手并预留佣金", () => {
    saveAccount({ ...structuredClone(defaultAccount), availableCash: 10_004, totalAssets: 10_004 });
    expect(getMaxBuyQuantity(100)).toBe(0); // 一手 10000 + 佣金 5 > 10004
    saveAccount({ ...structuredClone(defaultAccount), availableCash: 10_005, totalAssets: 10_005 });
    expect(getMaxBuyQuantity(100)).toBe(100);
  });
});
