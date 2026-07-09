import type { PortfolioHistory } from '@/types/account';

// ─── Mock Portfolio History (30 days) ──────────────────────────────
// Starts at ¥1,000,000 with realistic daily fluctuation
// Simulates gradual position building over the period

function generateHistory(): PortfolioHistory[] {
  const history: PortfolioHistory[] = [];
  const startDate = new Date('2026-05-19'); // 30 trading days ago
  let totalAssets = 1_000_000;
  let marketValue = 0;
  let cash = 1_000_000;

  // Simulated position building schedule
  // Each entry: [dayOffset, stockCode, action, shares, price]
  const trades: Array<{ day: number; type: 'buy'; cost: number }> = [
    { day: 3, type: 'buy', cost: 165_000 },   // 贵州茅台 100股 @ 1650
    { day: 7, type: 'buy', cost: 24_000 },     // 中际旭创 200股 @ 120
    { day: 12, type: 'buy', cost: 29_250 },    // 宁德时代 150股 @ 195
    { day: 18, type: 'buy', cost: 26_000 },    // 寒武纪 100股 @ 260
  ];

  // Daily P&L simulation: small random fluctuation
  const dailyReturns = [
    0.0012, -0.0008, 0.0025, -0.0015, 0.0018,
    0.0031, -0.0022, 0.0014, -0.0006, 0.0028,
    -0.0019, 0.0035, -0.0011, 0.0022, 0.0008,
    -0.0025, 0.0017, 0.0042, -0.0013, 0.0029,
    -0.0008, 0.0021, -0.0031, 0.0016, 0.0033,
    -0.0014, 0.0027, -0.0005, 0.0019, 0.0024,
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);

    // Process any trades on this day
    const trade = trades.find(t => t.day === i);
    if (trade) {
      cash -= trade.cost;
      marketValue += trade.cost; // At cost initially
    }

    // Apply daily return to market value (only if holding positions)
    if (marketValue > 0) {
      const dailyPnL = marketValue * dailyReturns[i];
      marketValue = Number((marketValue + dailyPnL).toFixed(2));
    }

    totalAssets = Number((cash + marketValue).toFixed(2));
    const pnl = Number((totalAssets - 1_000_000).toFixed(2));

    history.push({
      date: dateStr,
      totalAssets,
      marketValue: Number(marketValue.toFixed(2)),
      cash: Number(cash.toFixed(2)),
      pnl,
    });
  }

  return history;
}

export const mockPortfolioHistory: PortfolioHistory[] = generateHistory();
