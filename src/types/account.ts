export interface AccountSummary {
  totalAssets: number        // 总资产 = availableCash + marketValue
  availableCash: number      // 可用资金
  marketValue: number        // 持仓市值 = sum(所有 Position.marketValue)
  totalPnL: number           // 累计盈亏
  todayPnL: number           // 今日盈亏
  riskLevel: 'low' | 'medium' | 'high'
  positionRatio: number      // 仓位比例 = marketValue / totalAssets
  updatedAt: string          // ISO 时间戳
}

export interface Position {
  stockCode: string
  stockName: string
  sectorId: string
  quantity: number
  availableQuantity: number
  avgCost: number
  openPrice: number          // 今日开盘价
  currentPrice: number
  marketValue: number        // currentPrice × quantity
  unrealizedPnL: number      // (currentPrice - avgCost) × quantity
  unrealizedPnLPercent: number // (currentPrice - avgCost) / avgCost × 100, avgCost=0时返回0
  todayPnL: number           // (currentPrice - openPrice) × quantity
  positionRatio: number      // marketValue / totalAssets
  riskLevel: 'low' | 'medium' | 'high'
}

export interface PortfolioHistory {
  date: string               // YYYY-MM-DD
  totalAssets: number
  marketValue: number
  cash: number
  pnl: number
}

export interface AccountTransaction {
  id: string
  type: 'buy' | 'sell' | 'fee' | 'dividend' | 'adjustment'
  stockCode: string
  amount: number
  realizedPnL?: number       // 仅 sell 类型
  createdAt: string
  relatedOrderId: string
}

export interface LocalLedgerSnapshot {
  version: 1
  reason: string
  exportedAt: string
  account: AccountSummary
  positions: Position[]
  transactions: AccountTransaction[]
  history: PortfolioHistory[]
  stats: {
    positionCount: number
    transactionCount: number
    historyCount: number
    firstTransactionAt: string | null
    lastTransactionAt: string | null
  }
}

export interface LocalLedgerSyncResult {
  ok: boolean
  mode: 'file' | 'browser'
  exists?: boolean
  path?: string
  updatedAt?: string
  snapshot?: LocalLedgerSnapshot
  error?: string
}
