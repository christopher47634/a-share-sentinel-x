import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

// trade-engine 只在浏览器里跑：给它一个内存版 localStorage 和 window
class MemoryStorage {
  private data = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const storage = new MemoryStorage();
vi.stubGlobal("localStorage", storage);
vi.stubGlobal("window", { localStorage: storage });
// 账本同步走 fetch；测试里不需要服务端
vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));

const { executeBuy, executeSell, validatePrice } = await import("@/lib/trade-engine");
const { getAccount, getPositions, saveAccount, savePositions } = await import("@/lib/account-storage");
const { defaultAccount } = await import("@/mock/account");

function startEmpty() {
  storage.clear();
  storage.failWrites = false;
  saveAccount(structuredClone(defaultAccount));
  savePositions([]);
}

function invariant() {
  const account = getAccount();
  const marketValue = getPositions().reduce((sum, p) => sum + Math.round(p.marketValue * 100), 0);
  expect(Math.round(account.totalAssets * 100)).toBe(Math.round(account.availableCash * 100) + marketValue);
}

describe("trade-engine ledger", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T02:00:00Z")); // 北京时间 10:00
    startEmpty();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps totalAssets === cash + marketValue across a buy and a next-day sell", () => {
    const buy = executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price: 100, quantity: 100 });
    expect(buy.success).toBe(true);
    invariant();
    // 买入 10000 + 佣金 5（最低 5 元）
    expect(getAccount().availableCash).toBe(1_000_000 - 10_005);

    vi.setSystemTime(new Date("2026-10-15T02:00:00Z"));
    const sell = executeSell({ stockCode: "600519", stockName: "贵州茅台", price: 120, quantity: 100 });
    expect(sell.success).toBe(true);
    invariant();

    // 卖出 12000 − 佣金 5 − 印花税 6
    const cash = getAccount().availableCash;
    expect(cash).toBe(1_000_000 - 10_005 + 12_000 - 5 - 6);
    expect(getAccount().totalAssets).toBe(cash);
    expect(getPositions()).toHaveLength(0);
  });

  it("rejects selling shares bought the same day (T+1)", () => {
    executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price: 100, quantity: 100 });
    const sell = executeSell({ stockCode: "600519", stockName: "贵州茅台", price: 101, quantity: 100 });
    expect(sell.success).toBe(false);
    expect(sell.error).toContain("T+1");
    expect(getPositions()[0].availableQuantity).toBe(0);
  });

  it("treats the Shanghai calendar day, not UTC, as 'today'", () => {
    // UTC 10-14 16:30 = 北京时间 10-15 00:30
    vi.setSystemTime(new Date("2026-10-14T16:30:00Z"));
    executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price: 100, quantity: 100 });
    // UTC 10-15 01:00 = 北京时间 10-15 09:00：UTC 日期变了，但北京时间还是同一天，不能卖
    vi.setSystemTime(new Date("2026-10-15T01:00:00Z"));
    expect(executeSell({ stockCode: "600519", stockName: "贵州茅台", price: 100, quantity: 100 }).success).toBe(false);
  });

  it("rejects non-positive and non-finite prices", () => {
    for (const price of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price, quantity: 100 });
      expect(result.success).toBe(false);
    }
    expect(getAccount().availableCash).toBe(1_000_000);
  });

  it("rejects limit prices outside the daily limit band", () => {
    expect(validatePrice("600519", 111, 100)).not.toBeNull(); // 主板 ±10%
    expect(validatePrice("600519", 110, 100)).toBeNull();
    expect(validatePrice("300750", 119, 100)).toBeNull(); // 创业板 ±20%
    expect(validatePrice("920001", 129, 100)).toBeNull(); // 北交所 ±30%
    expect(validatePrice("688256", 79, 100)).not.toBeNull();
  });

  it("does not mutate the shared default account", () => {
    storage.clear();
    executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price: 100, quantity: 100 });
    expect(defaultAccount.availableCash).toBe(1_000_000);
    expect(defaultAccount.totalAssets).toBe(1_000_000);
  });

  it("reports failure and leaves the ledger untouched when storage is full", () => {
    storage.failWrites = true;
    const result = executeBuy({ stockCode: "600519", stockName: "贵州茅台", sectorId: "baijiu", price: 100, quantity: 100 });
    storage.failWrites = false;
    expect(result.success).toBe(false);
    expect(getAccount().availableCash).toBe(1_000_000);
    expect(getPositions()).toHaveLength(0);
  });
});
