import type { AccountSummary, Position } from '@/types/account';
import { mockPositions, getTotalMarketValue } from './positions';

// ─── Account Mock Data ─────────────────────────────────────────────
// Initial capital: ¥1,000,000

const INITIAL_CASH = 1_000_000;

// Default account with no positions (all cash)
export const defaultAccount: AccountSummary = {
  totalAssets: INITIAL_CASH,
  availableCash: INITIAL_CASH,
  marketValue: 0,
  totalPnL: 0,
  todayPnL: 0,
  riskLevel: 'low',
  positionRatio: 0,
  updatedAt: new Date().toISOString(),
};

// ─── Derive account summary from positions ─────────────────────────
export function getAccountSummary(positions: Position[]): AccountSummary {
  const marketValue = getTotalMarketValue(positions);
  const costBasis = positions.reduce((sum, p) => sum + p.avgCost * p.quantity, 0);
  const cash = Number((INITIAL_CASH - costBasis).toFixed(2));
  const totalAssets = Number((cash + marketValue).toFixed(2));
  const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const todayPnL = positions.reduce((sum, p) => sum + p.todayPnL, 0);
  const positionRatio = totalAssets > 0 ? Number((marketValue / totalAssets).toFixed(4)) : 0;

  // Risk level: weighted by position volatility
  const highRiskWeight = positions.filter(p => p.riskLevel === 'high').reduce((s, p) => s + p.marketValue, 0);
  const highRiskRatio = marketValue > 0 ? highRiskWeight / marketValue : 0;
  const riskLevel: AccountSummary['riskLevel'] = highRiskRatio > 0.5 ? 'high' : highRiskRatio > 0.2 ? 'medium' : 'low';

  return {
    totalAssets,
    availableCash: cash,
    marketValue,
    totalPnL: Number(totalPnL.toFixed(2)),
    todayPnL: Number(todayPnL.toFixed(2)),
    riskLevel,
    positionRatio,
    updatedAt: new Date().toISOString(),
  };
}

// Pre-computed account with mock positions (for display/demo)
export const mockAccountWithPositions: AccountSummary = getAccountSummary(mockPositions);
