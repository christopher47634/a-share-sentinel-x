import type { Position } from '@/types/account';

// ─── Mock Position Data ────────────────────────────────────────────
// Positions use real stock codes and sector IDs from src/mock/stocks.ts
// All computed fields (marketValue, unrealizedPnL, etc.) are internally consistent.

const INITIAL_CASH = 1_000_000;

function calcPnLPercent(avgCost: number, currentPrice: number): number {
  if (avgCost === 0) return 0;
  return Number((((currentPrice - avgCost) / avgCost) * 100).toFixed(2));
}

function calcMarketValue(quantity: number, currentPrice: number): number {
  return Number((quantity * currentPrice).toFixed(2));
}

function calcUnrealizedPnL(quantity: number, avgCost: number, currentPrice: number): number {
  return Number(((currentPrice - avgCost) * quantity).toFixed(2));
}

function calcTodayPnL(quantity: number, openPrice: number, currentPrice: number): number {
  return Number(((currentPrice - openPrice) * quantity).toFixed(2));
}

// ─── Position definitions ──────────────────────────────────────────
// Stock codes, sector IDs, prices match src/mock/stocks.ts exactly.

const positionDefs = [
  { stockCode: '600519', stockName: '贵州茅台', sectorId: 'baijiu', quantity: 100, avgCost: 1650, openPrice: 1680, currentPrice: 1688.00, riskLevel: 'low' as const },
  { stockCode: '300308', stockName: '中际旭创', sectorId: 'optical-communication', quantity: 200, avgCost: 120, openPrice: 126, currentPrice: 128.56, riskLevel: 'high' as const },
  { stockCode: '300750', stockName: '宁德时代', sectorId: 'new-energy', quantity: 150, avgCost: 195, openPrice: 197, currentPrice: 198.56, riskLevel: 'medium' as const },
  { stockCode: '688256', stockName: '寒武纪', sectorId: 'computing-power', quantity: 100, avgCost: 260, openPrice: 265, currentPrice: 268.90, riskLevel: 'high' as const },
];

export const mockPositions: Position[] = (() => {
  // First pass: compute all position data except positionRatio
  const rawPositions = positionDefs.map((def) => {
    const marketValue = calcMarketValue(def.quantity, def.currentPrice);
    const unrealizedPnL = calcUnrealizedPnL(def.quantity, def.avgCost, def.currentPrice);
    const unrealizedPnLPercent = calcPnLPercent(def.avgCost, def.currentPrice);
    const todayPnL = calcTodayPnL(def.quantity, def.openPrice, def.currentPrice);
    return { ...def, marketValue, unrealizedPnL, unrealizedPnLPercent, todayPnL };
  });

  // Compute actual total assets from all positions
  const totalMarketValue = rawPositions.reduce((sum, p) => sum + p.marketValue, 0);
  const costBasis = rawPositions.reduce((sum, p) => sum + p.avgCost * p.quantity, 0);
  const availableCash = INITIAL_CASH - costBasis;
  const totalAssets = availableCash + totalMarketValue;

  // Second pass: set positionRatio based on actual total assets
  return rawPositions.map((p) => ({
    stockCode: p.stockCode,
    stockName: p.stockName,
    sectorId: p.sectorId,
    quantity: p.quantity,
    availableQuantity: p.quantity, // T+1: all shares available (mock)
    avgCost: p.avgCost,
    openPrice: p.openPrice,
    currentPrice: p.currentPrice,
    marketValue: p.marketValue,
    unrealizedPnL: p.unrealizedPnL,
    unrealizedPnLPercent: p.unrealizedPnLPercent,
    todayPnL: p.todayPnL,
    positionRatio: totalAssets > 0 ? Number((p.marketValue / totalAssets).toFixed(4)) : 0,
    riskLevel: p.riskLevel,
  }));
})();

// Helper: total market value across all positions
export function getTotalMarketValue(positions: Position[]): number {
  return Number(positions.reduce((sum, p) => sum + p.marketValue, 0).toFixed(2));
}

// Helper: total unrealized P&L
export function getTotalUnrealizedPnL(positions: Position[]): number {
  return Number(positions.reduce((sum, p) => sum + p.unrealizedPnL, 0).toFixed(2));
}

// Helper: total today P&L
export function getTotalTodayPnL(positions: Position[]): number {
  return Number(positions.reduce((sum, p) => sum + p.todayPnL, 0).toFixed(2));
}
