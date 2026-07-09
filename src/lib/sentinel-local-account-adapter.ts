// 本地模拟账户 → Sentinel AI 页面轻量适配器
// 复用现有 account-storage，不重复发明账本

import type { Position, AccountSummary } from "@/types/account";

export interface LocalSentinelPosition {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPnl?: number;
  unrealizedPnlPct?: number;
  sector?: string;
}

export interface LocalSentinelAccountSnapshot {
  cash?: number;
  totalAsset?: number;
  positionMarketValue?: number;
  positions: LocalSentinelPosition[];
  updatedAt: string;
}

function getPositionsFromStorage(): Position[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("nexus-trade-positions");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAccountFromStorage(): AccountSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("nexus-trade-account");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadLocalSentinelAccountSnapshot(): LocalSentinelAccountSnapshot | null {
  const positions = getPositionsFromStorage();
  const account = getAccountFromStorage();

  if (!positions || positions.length === 0) return null;

  const mapped: LocalSentinelPosition[] = positions.map((p) => ({
    code: p.stockCode,
    name: p.stockName,
    quantity: p.quantity,
    costPrice: p.avgCost,
    currentPrice: p.currentPrice,
    marketValue: typeof p.marketValue === "number" ? p.marketValue : p.quantity * (p.currentPrice ?? p.avgCost),
    unrealizedPnl: p.unrealizedPnL,
    unrealizedPnlPct: p.unrealizedPnLPercent,
    sector: (p.sectorId) || undefined,
  }));

  return {
    cash: account?.availableCash,
    totalAsset: account?.totalAssets,
    positionMarketValue: account?.marketValue ?? mapped.reduce((sum, p) => sum + (p.marketValue ?? 0), 0),
    positions: mapped,
    updatedAt: new Date().toISOString(),
  };
}

export function getHeldCodes(snapshot: LocalSentinelAccountSnapshot | null): string[] {
  if (!snapshot) return [];
  return snapshot.positions.map((p) => p.code);
}

export function isHeldCode(code: string, snapshot: LocalSentinelAccountSnapshot | null): boolean {
  if (!snapshot) return false;
  return snapshot.positions.some((p) => p.code === code);
}
