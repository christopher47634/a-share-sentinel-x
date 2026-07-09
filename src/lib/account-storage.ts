import type { AccountSummary, Position, AccountTransaction, PortfolioHistory } from '@/types/account';
import type { MockOrder } from '@/mock/orders';
import { defaultAccount, getAccountSummary } from '@/mock/account';
import { mockPositions } from '@/mock/positions';
import { mockTransactions } from '@/mock/accountTransactions';
import { mockPortfolioHistory } from '@/mock/portfolioHistory';

// ─── Storage Keys ──────────────────────────────────────────────────
const STORAGE_KEY = 'nexus-trade-account';
const POSITIONS_KEY = 'nexus-trade-positions';
const TRANSACTIONS_KEY = 'nexus-trade-transactions';
const HISTORY_KEY = 'nexus-trade-history';

// ─── SSR-safe helpers ──────────────────────────────────────────────
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getJson<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJson<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

// ─── Account ───────────────────────────────────────────────────────
export function getAccount(): AccountSummary {
  return getJson<AccountSummary>(STORAGE_KEY, defaultAccount);
}

export function saveAccount(account: AccountSummary): void {
  setJson(STORAGE_KEY, account);
}

// ─── Positions ─────────────────────────────────────────────────────
export function getPositions(): Position[] {
  return getJson<Position[]>(POSITIONS_KEY, []);
}

export function savePositions(positions: Position[]): void {
  setJson(POSITIONS_KEY, positions);
}

// ─── Transactions ──────────────────────────────────────────────────
export function getTransactions(): AccountTransaction[] {
  return getJson<AccountTransaction[]>(TRANSACTIONS_KEY, []);
}

export function saveTransactions(transactions: AccountTransaction[]): void {
  setJson(TRANSACTIONS_KEY, transactions);
}

// ─── Portfolio History ─────────────────────────────────────────────
export function getPortfolioHistory(): PortfolioHistory[] {
  return getJson<PortfolioHistory[]>(HISTORY_KEY, []);
}

export function savePortfolioHistory(history: PortfolioHistory[]): void {
  setJson(HISTORY_KEY, history);
}

export function recordPortfolioSnapshot(
  accountOverride?: AccountSummary
): PortfolioHistory[] {
  const account = accountOverride ?? getAccount();
  const history = getPortfolioHistory();
  const today = new Date().toISOString().slice(0, 10);
  const baseAssets = history[0]?.totalAssets ?? defaultAccount.totalAssets;
  const snapshot: PortfolioHistory = {
    date: today,
    totalAssets: Number(account.totalAssets.toFixed(2)),
    marketValue: Number(account.marketValue.toFixed(2)),
    cash: Number(account.availableCash.toFixed(2)),
    pnl: Number((account.totalAssets - baseAssets).toFixed(2)),
  };

  const nextHistory = [...history];
  const existingIndex = nextHistory.findIndex((item) => item.date === today);
  if (existingIndex >= 0) {
    nextHistory[existingIndex] = snapshot;
  } else {
    nextHistory.push(snapshot);
  }

  const normalized = nextHistory
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-260);

  savePortfolioHistory(normalized);
  return normalized;
}

// ─── Initialize / Reset ────────────────────────────────────────────

/**
 * Initialize account data in localStorage if empty.
 * Safe to call multiple times — only writes when keys are missing.
 */
export function initializeAccount(): void {
  if (!isClient()) return;

  // 先检查是否已有账户数据（用户做过交易）
  const existingAccount = window.localStorage.getItem(STORAGE_KEY);
  if (existingAccount) {
    try {
      const parsed = JSON.parse(existingAccount) as AccountSummary;
      // 如果有有效的 availableCash，不要重置
      if (typeof parsed.availableCash === 'number' && parsed.availableCash > 0) {
        // 只更新 positions 相关的字段，保留 availableCash
        const positions = getPositions();
        const marketValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
        const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
        const todayPnL = positions.reduce((sum, p) => sum + p.todayPnL, 0);
        const totalAssets = parsed.availableCash + marketValue;
        const positionRatio = totalAssets > 0 ? marketValue / totalAssets : 0;

        const highRiskValue = positions.filter(p => p.riskLevel === 'high').reduce((sum, p) => sum + p.marketValue, 0);
        const highRiskRatio = totalAssets > 0 ? highRiskValue / totalAssets : 0;
        const riskLevel = highRiskRatio > 0.3 ? 'high' : positionRatio > 0.6 ? 'medium' : 'low';

        saveAccount({
          ...parsed,
          totalAssets,
          marketValue,
          totalPnL,
          todayPnL,
          positionRatio,
          riskLevel,
          updatedAt: new Date().toISOString()
        });
        return;
      }
    } catch { /* fall through to reinitialize */ }
  }

  // 首次初始化：写入 positions 和 account
  const existingPositions = window.localStorage.getItem(POSITIONS_KEY);
  if (existingPositions === null) {
    savePositions(mockPositions);
  }

  const positions = getPositions();
  const account = getAccountSummary(positions);
  saveAccount(account);

  // Transactions & history (only if missing)
  if (window.localStorage.getItem(TRANSACTIONS_KEY) === null) {
    saveTransactions(mockTransactions);
  }
  if (window.localStorage.getItem(HISTORY_KEY) === null) {
    savePortfolioHistory(mockPortfolioHistory);
  }
}

/**
 * Reset all account data to default mock state.
 * Useful for "reset demo" functionality.
 */
export function resetAccount(): void {
  saveAccount(defaultAccount);
  savePositions(mockPositions);
  saveTransactions(mockTransactions);
  savePortfolioHistory(mockPortfolioHistory);
}
// ─── Demo Data Strategy ───────────────────────────────────────────

const DEMO_ORDERS_KEY = 'nexus-trade-demo-orders';
const DEMO_POSITIONS_KEY = 'nexus-trade-demo-positions';
const DEMO_TRANSACTIONS_KEY = 'nexus-trade-demo-transactions';
const DEMO_ACTIVE_KEY = 'nexus-trade-demo-active';
const DEMO_ORDER_ID = 'demo-order-p5-a3-001';
const DEMO_POSITION_STOCK = '300308';
const DEMO_TRANSACTION_ID = 'demo-tx-p5-a3-001';

export interface DemoIdentifiable {
  source?: string;
  [key: string]: unknown;
}

/**
 * Add a demo order with source: "demo" marker.
 * Deduplicates by order ID to prevent stacking on repeat runs.
 */
export function addDemoOrder<T extends { id: string }>(order: T): T & { source: string } {
  const tagged = { ...order, source: 'demo' };
  const existing = getJson<Array<{ id: string }>>(DEMO_ORDERS_KEY, []);
  if (!existing.some((o) => o.id === order.id)) {
    existing.push(tagged);
    setJson(DEMO_ORDERS_KEY, existing);
  }
  return tagged;
}

/**
 * Add a demo position with source: "demo" marker.
 * Deduplicates by stockCode to prevent stacking on repeat runs.
 */
export function addDemoPosition<T extends { stockCode: string }>(position: T): T & { source: string } {
  const tagged = { ...position, source: 'demo' };
  const existing = getJson<Array<{ stockCode: string }>>(DEMO_POSITIONS_KEY, []);
  if (!existing.some((p) => p.stockCode === position.stockCode)) {
    existing.push(tagged);
    setJson(DEMO_POSITIONS_KEY, existing);
  }
  return tagged;
}

/**
 * Get all demo orders.
 */
export function getDemoOrders<T>(): T[] {
  return getJson<T[]>(DEMO_ORDERS_KEY, []);
}

/**
 * Get all demo positions.
 */
export function getDemoPositions<T>(): T[] {
  return getJson<T[]>(DEMO_POSITIONS_KEY, []);
}

/**
 * Check if demo data exists.
 */
export function hasDemoData(): boolean {
  if (!isClient()) return false;
  return (
    window.localStorage.getItem(DEMO_ORDERS_KEY) !== null ||
    window.localStorage.getItem(DEMO_POSITIONS_KEY) !== null
  );
}

/**
 * Reset only demo data — clears source=demo items, preserves user's manual data.
 */
export function resetDemoData(): void {
  if (!isClient()) return;
  window.localStorage.removeItem(DEMO_ORDERS_KEY);
  window.localStorage.removeItem(DEMO_POSITIONS_KEY);
  window.localStorage.removeItem(DEMO_TRANSACTIONS_KEY);
  window.localStorage.removeItem(DEMO_ACTIVE_KEY);
  // Also clean demo mode flags
  window.localStorage.removeItem('demoMode');
  window.localStorage.removeItem('demoModeStep');
}

// ─── Demo Mode Active Flag ──────────────────────────────────────

export function isDemoModeActive(): boolean {
  if (!isClient()) return false;
  return window.localStorage.getItem(DEMO_ACTIVE_KEY) === 'true';
}

export function setDemoActive(active: boolean): void {
  if (!isClient()) return;
  if (active) window.localStorage.setItem(DEMO_ACTIVE_KEY, 'true');
  else window.localStorage.removeItem(DEMO_ACTIVE_KEY);
}

// ─── Demo Transactions ─────────────────────────────────────────

/**
 * Add a demo transaction with source: "demo" marker.
 * Deduplicates by transaction ID to prevent stacking on repeat runs.
 */
export function addDemoTransaction(tx: AccountTransaction): AccountTransaction & { source: string } {
  const tagged = { ...tx, source: 'demo' } as AccountTransaction & { source: string };
  const existing = getJson<Array<AccountTransaction & { source?: string }>>(DEMO_TRANSACTIONS_KEY, []);
  if (!existing.some((t) => t.id === tx.id)) {
    existing.push(tagged);
    setJson(DEMO_TRANSACTIONS_KEY, existing);
  }
  return tagged;
}

/**
 * Get all demo transactions.
 */
export function getDemoTransactions(): (AccountTransaction & { source?: string })[] {
  return getJson(DEMO_TRANSACTIONS_KEY, []);
}

// ─── Ensure Demo Trade Seeded (Deterministic Dedup) ────────────

/**
 * Ensures demo order, position, and transaction are all seeded.
 * Uses fixed IDs for deterministic dedup — safe to call multiple times.
 * Only creates missing items, never overwrites.
 */
export function ensureDemoTradeSeeded(): void {
  if (!isClient()) return;

  const now = Date.now();

  // 1. Seed demo order if missing
  const existingOrders = getJson<MockOrder[]>(DEMO_ORDERS_KEY, []);
  if (!existingOrders.some((o) => o.id === DEMO_ORDER_ID)) {
    const demoOrder: MockOrder = {
      id: DEMO_ORDER_ID,
      stockCode: '300308',
      stockName: '中际旭创',
      side: 'buy',
      price: 128.56,
      quantity: 100,
      totalAmount: 12856,
      status: 'filled',
      commission: 5,
      stampTax: 0,
      filledQuantity: 100,
      avgFillPrice: 128.56,
      createdAt: now,
      filledAt: now,
    };
    existingOrders.push({ ...demoOrder, source: 'demo' } as MockOrder & { source: string });
    setJson(DEMO_ORDERS_KEY, existingOrders);
  }

  // 2. Seed demo position if missing (dedup by stockCode)
  const existingPositions = getJson<Position[]>(DEMO_POSITIONS_KEY, []);
  if (!existingPositions.some((p) => p.stockCode === DEMO_POSITION_STOCK)) {
    const demoPosition: Position = {
      stockCode: '300308',
      stockName: '中际旭创',
      sectorId: 'optical-communication',
      quantity: 100,
      availableQuantity: 100,
      avgCost: 128.56,
      openPrice: 126,
      currentPrice: 128.56,
      marketValue: 12856,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      todayPnL: 256,
      positionRatio: 0,
      riskLevel: 'high',
    };
    existingPositions.push({ ...demoPosition, source: 'demo' } as Position & { source: string });
    setJson(DEMO_POSITIONS_KEY, existingPositions);
  }

  // 3. Seed demo transaction if missing
  const existingTxs = getJson<AccountTransaction[]>(DEMO_TRANSACTIONS_KEY, []);
  if (!existingTxs.some((t) => t.id === DEMO_TRANSACTION_ID)) {
    const demoTx: AccountTransaction = {
      id: DEMO_TRANSACTION_ID,
      type: 'buy',
      stockCode: '300308',
      amount: -12856,
      createdAt: new Date(now).toISOString(),
      relatedOrderId: DEMO_ORDER_ID,
    };
    existingTxs.push({ ...demoTx, source: 'demo' } as AccountTransaction & { source: string });
    setJson(DEMO_TRANSACTIONS_KEY, existingTxs);
  }
}

// ─── Demo Account Overlay ──────────────────────────────────────

export interface DemoAccountOverlay {
  /** Cash impact (negative = cash spent) */
  cashDelta: number;
  /** Market value added by demo positions */
  marketValueDelta: number;
  /** Demo positions to merge */
  positions: (Position & { source?: string })[];
}

/**
 * Calculate the impact of demo data on the account summary.
 * Returns deltas that should be applied to the base account.
 */
export function getDemoAccountOverlay(): DemoAccountOverlay {
  if (!isDemoModeActive()) {
    return { cashDelta: 0, marketValueDelta: 0, positions: [] };
  }

  const demoPositions = getDemoPositions<(Position & { source?: string })>();
  const demoTxs = getDemoTransactions();

  // Cash delta from demo transactions (amount is negative for buys)
  const cashDelta = demoTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Market value from demo positions
  const marketValueDelta = demoPositions.reduce((sum, p) => sum + p.marketValue, 0);

  return { cashDelta, marketValueDelta, positions: demoPositions };
}

/**
 * Apply demo overlay to a base account summary.
 * Returns a new account with adjusted values.
 */
export function applyDemoAccountOverlay(
  base: AccountSummary,
  overlay: DemoAccountOverlay
): AccountSummary {
  const availableCash = Number((base.availableCash + overlay.cashDelta).toFixed(2));
  const marketValue = Number((base.marketValue + overlay.marketValueDelta).toFixed(2));
  const totalAssets = Number((availableCash + marketValue).toFixed(2));
  const positionRatio = totalAssets > 0 ? Number((marketValue / totalAssets).toFixed(4)) : 0;

  return {
    ...base,
    availableCash,
    marketValue,
    totalAssets,
    positionRatio,
    updatedAt: new Date().toISOString(),
  };
}
