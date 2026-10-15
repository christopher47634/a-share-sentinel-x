import {
  getAccount,
  getPositions,
  getTransactions,
  getPortfolioHistory,
  buildPortfolioSnapshotHistory,
  commitBatch,
  shanghaiDate,
  STORAGE_KEYS,
} from './account-storage'
import { syncLocalLedgerSnapshot } from './local-ledger'
import { getAccountSummary, toCents, fromCents } from '@/mock/account'
import { createOrder, updateOrderStatus } from '@/mock/orders'
import type { AccountTransaction, AccountSummary } from '@/types/account'
import type { MockOrder } from '@/mock/orders'

interface BuyParams {
  stockCode: string
  stockName: string
  sectorId: string
  price: number
  quantity: number
  /** Reference previous close; when known, limit prices outside the daily limit band are rejected. */
  prevClose?: number
}

interface SellParams {
  stockCode: string
  stockName: string
  price: number
  quantity: number
  prevClose?: number
}

interface TradeResult {
  success: boolean
  order?: MockOrder
  error?: string
  updatedAccount?: AccountSummary
}

// ─── Fees (integer cents) ──────────────────────────────────────────

/** Commission in cents: 0.025% of turnover, minimum ¥5 */
export function commissionCents(totalCents: number): number {
  return Math.max(500, Math.round(totalCents * 0.00025))
}

/** Stamp tax in cents: sell-only, 0.05% of turnover */
export function stampTaxCents(totalCents: number): number {
  return Math.round(totalCents * 0.0005)
}

/** Commission: 0.025% of total, minimum ¥5 */
export function calcCommission(total: number): number {
  return fromCents(commissionCents(toCents(total)))
}

/** Stamp tax: sell-only, 0.05% of total */
export function calcStampTax(total: number): number {
  return fromCents(stampTaxCents(toCents(total)))
}

function amountCents(price: number, quantity: number): number {
  return Math.round(price * quantity * 100)
}

// ─── Price validation ──────────────────────────────────────────────

function bareCode(code: string): string {
  return code.replace(/^(sh|sz|bj)/i, '')
}

/** Daily price limit fraction by board: BSE 30%, ChiNext/STAR 20%, main board & ETF 10%. */
export function priceLimitPct(code: string): number {
  const c = bareCode(code)
  if (/^(8|4|92)/.test(c)) return 0.3
  if (/^(300|301|688|689)/.test(c)) return 0.2
  return 0.1
}

export function validatePrice(code: string, price: number, prevClose?: number): string | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    return '委托价格必须大于 0'
  }
  if (toCents(price) <= 0) return '委托价格必须大于 0'
  if (typeof prevClose === 'number' && Number.isFinite(prevClose) && prevClose > 0) {
    const pct = priceLimitPct(code)
    const upper = Math.round(prevClose * (1 + pct) * 100)
    const lower = Math.round(prevClose * (1 - pct) * 100)
    const cents = toCents(price)
    if (cents > upper || cents < lower) {
      return `委托价格超出涨跌幅限制（${fromCents(lower).toFixed(2)} ~ ${fromCents(upper).toFixed(2)}）`
    }
  }
  return null
}

const PERSIST_ERROR = '保存失败：浏览器本地存储不可用或已满，本次交易未生效'

function newTxnId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function finalize(
  order: MockOrder,
  entries: Array<[string, unknown]>,
  updatedAccount: AccountSummary,
  reason: string
): TradeResult {
  if (!commitBatch(entries)) {
    updateOrderStatus(order.id, 'rejected')
    return { success: false, error: PERSIST_ERROR }
  }
  setTimeout(() => updateOrderStatus(order.id, 'filled'), 100)
  void syncLocalLedgerSnapshot(reason)
  return { success: true, order, updatedAccount }
}

export function executeBuy(params: BuyParams): TradeResult {
  const { stockCode, stockName, sectorId, price, quantity, prevClose } = params

  if (!Number.isInteger(quantity) || quantity <= 0 || quantity % 100 !== 0) {
    return { success: false, error: '买入数量必须是100股的整数倍' }
  }
  const priceError = validatePrice(stockCode, price, prevClose)
  if (priceError) return { success: false, error: priceError }

  const totalCents = amountCents(price, quantity)
  const feeCents = commissionCents(totalCents)
  const costCents = totalCents + feeCents

  const account = getAccount()
  const cashCents = toCents(account.availableCash)
  if (cashCents < costCents) {
    return {
      success: false,
      error: `可用资金不足。需要 ¥${fromCents(costCents).toLocaleString()}，当前可用 ¥${fromCents(cashCents).toLocaleString()}`,
    }
  }

  const today = shanghaiDate()
  const positions = getPositions()
  const existing = positions.find((p) => p.stockCode === stockCode)

  if (existing) {
    const oldCostCents = Math.round(existing.avgCost * existing.quantity * 100)
    const newQuantity = existing.quantity + quantity
    const todayBought = (existing.lastBuyDate === today ? existing.todayBought ?? 0 : 0) + quantity
    existing.avgCost = (oldCostCents + costCents) / 100 / newQuantity
    existing.quantity = newQuantity
    existing.todayBought = todayBought
    existing.lastBuyDate = today
    existing.availableQuantity = newQuantity - todayBought
    existing.currentPrice = price
    existing.marketValue = fromCents(amountCents(price, newQuantity))
    existing.unrealizedPnL = fromCents(Math.round((price - existing.avgCost) * newQuantity * 100))
    existing.unrealizedPnLPercent = existing.avgCost > 0 ? ((price - existing.avgCost) / existing.avgCost) * 100 : 0
    existing.todayPnL = fromCents(Math.round((price - existing.openPrice) * newQuantity * 100))
  } else {
    const avgCost = costCents / 100 / quantity
    positions.push({
      stockCode, stockName, sectorId,
      quantity,
      availableQuantity: 0,
      todayBought: quantity,
      lastBuyDate: today,
      avgCost,
      openPrice: price, currentPrice: price,
      marketValue: fromCents(totalCents),
      unrealizedPnL: fromCents(-feeCents),
      unrealizedPnLPercent: avgCost > 0 ? ((price - avgCost) / avgCost) * 100 : 0,
      todayPnL: 0,
      positionRatio: 0, riskLevel: 'medium',
    })
  }

  const updatedAccount = getAccountSummary(positions, fromCents(cashCents - costCents))

  const order = createOrder({ stockCode, stockName, side: 'buy', price, quantity })
  const txn: AccountTransaction = {
    id: newTxnId(),
    type: 'buy', stockCode, amount: -fromCents(costCents),
    createdAt: new Date().toISOString(), relatedOrderId: order.id,
  }
  const txns = getTransactions()
  txns.unshift(txn)
  const history = buildPortfolioSnapshotHistory(updatedAccount, getPortfolioHistory())

  return finalize(order, [
    [STORAGE_KEYS.positions, positions],
    [STORAGE_KEYS.account, updatedAccount],
    [STORAGE_KEYS.transactions, txns],
    [STORAGE_KEYS.history, history],
  ], updatedAccount, 'trade-buy')
}

export function executeSell(params: SellParams): TradeResult {
  const { stockCode, stockName, price, quantity, prevClose } = params

  if (!Number.isInteger(quantity) || quantity <= 0 || quantity % 100 !== 0) {
    return { success: false, error: '卖出数量必须是100股的整数倍' }
  }
  const priceError = validatePrice(stockCode, price, prevClose)
  if (priceError) return { success: false, error: priceError }

  const positions = getPositions()
  const positionIndex = positions.findIndex((p) => p.stockCode === stockCode)
  if (positionIndex < 0) return { success: false, error: '没有该股票的持仓' }

  const position = positions[positionIndex]
  if (position.availableQuantity < quantity) {
    const t1 = (position.todayBought ?? 0) > 0 ? '（今日买入的股份遵循 T+1，下一交易日可卖）' : ''
    return {
      success: false,
      error: `可卖数量不足。可卖 ${position.availableQuantity} 股，您要卖 ${quantity} 股${t1}`,
    }
  }

  const totalCents = amountCents(price, quantity)
  const feeCents = commissionCents(totalCents)
  const taxCents = stampTaxCents(totalCents)
  const netCents = totalCents - feeCents - taxCents
  const costBasisCents = Math.round(position.avgCost * quantity * 100)
  const realizedCents = netCents - costBasisCents

  const account = getAccount()
  const newCashCents = toCents(account.availableCash) + netCents

  position.quantity -= quantity
  position.availableQuantity -= quantity
  if (position.quantity === 0) {
    positions.splice(positionIndex, 1)
  } else {
    position.currentPrice = price
    position.marketValue = fromCents(amountCents(price, position.quantity))
    position.unrealizedPnL = fromCents(Math.round((price - position.avgCost) * position.quantity * 100))
    position.unrealizedPnLPercent = position.avgCost > 0 ? ((price - position.avgCost) / position.avgCost) * 100 : 0
    position.todayPnL = fromCents(Math.round((price - position.openPrice) * position.quantity * 100))
  }

  const updatedAccount = getAccountSummary(positions, fromCents(newCashCents))

  const order = createOrder({ stockCode, stockName, side: 'sell', price, quantity })
  const txn: AccountTransaction = {
    id: newTxnId(),
    type: 'sell', stockCode, amount: fromCents(netCents), realizedPnL: fromCents(realizedCents),
    createdAt: new Date().toISOString(), relatedOrderId: order.id,
  }
  const txns = getTransactions()
  txns.unshift(txn)
  const history = buildPortfolioSnapshotHistory(updatedAccount, getPortfolioHistory())

  return finalize(order, [
    [STORAGE_KEYS.positions, positions],
    [STORAGE_KEYS.account, updatedAccount],
    [STORAGE_KEYS.transactions, txns],
    [STORAGE_KEYS.history, history],
  ], updatedAccount, 'trade-sell')
}

export function getMaxBuyQuantity(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0
  const account = getAccount()
  const cashCents = toCents(account.availableCash)
  const lotCents = amountCents(price, 100)
  if (lotCents <= 0) return 0
  const costPerLot = lotCents + commissionCents(lotCents)
  return Math.floor(cashCents / costPerLot) * 100
}

export function getAvailableSellQuantity(stockCode: string): number {
  const positions = getPositions()
  return positions.find((p) => p.stockCode === stockCode)?.availableQuantity ?? 0
}

export function resetDemoAccount(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('nexus-trade-account')
  localStorage.removeItem('nexus-trade-positions')
  localStorage.removeItem('nexus-trade-transactions')
  localStorage.removeItem('nexus-trade-history')
  localStorage.removeItem('nexus-trade-orders')
  // Re-import to avoid circular dependency issues
  import('./account-storage').then(({ initializeAccount }) => initializeAccount())
}
